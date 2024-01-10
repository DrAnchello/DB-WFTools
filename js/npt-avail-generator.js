document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('ByAvailForm');
    
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const CSALogins = document.getElementById('CSALoginsByAvail').value.split(/[\s,]+/);
        const dateRange = document.getElementById('dateRangePicker').value; // Assume this is in a format that can be split into a start and end date
        const trainingLength = document.getElementById('TrainingLength').value; // This should be in HH:MM format
        const excludeWeekends = document.getElementById('ExcludeWeekends').checked;
        const excludeBreaks = document.getElementById('ExcludeBreaks').checked;

        // Assume the format is "start - end" and we'll split it into two dates.
        const [startDate, endDate] = dateRange.split(' - ').map(dateStr => new Date(dateStr.trim()));

        fetchSchedules(CSALogins, startDate, endDate).then(schedules => {
            // The `schedules` now contains all the relevant schedule entries.
            const nptSlots = processSchedules(schedules, trainingLength, excludeWeekends, excludeBreaks);
            // Do something with the nptSlots, like display them or prepare them for download.
        }).catch(error => {
            console.error("Error fetching schedules: ", error);
        });
    });

    function fetchSchedules(CSALogins, startDate, endDate) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('VibeScheduleDB');
            request.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction(['schedules'], 'readonly');
                const store = transaction.objectStore('schedules');
                
                let schedules = [];
                CSALogins.forEach(login => {
                    const index = store.index('CSA Login');
                    index.openCursor().onsuccess = function (event) {
                        const cursor = event.target.result;
                        if (cursor) {
                            const record = cursor.value;
                            // Access properties with strings when they have spaces
                            const recordDate = new Date(record['Date']);
                            if (record['CSA Login'] === login && recordDate >= startDate && recordDate <= endDate) {
                                schedules.push(record);
                            }
                            cursor.continue();
                        } else {
                            // When all cursors have been visited, resolve
                            resolve(schedules);
                        }
                    };
                });
                transaction.oncomplete = function () {
                    // All cursors have been visited at this point, resolve the promise
                    resolve(schedules);
                };
            };
            request.onerror = function (event) {
                reject("Error opening database: ", event.target.errorCode);
            };
        });
    }    

    function processSchedules(schedules, trainingLength, excludeWeekends, excludeBreaks) {
        // Sort schedules by date and time
        schedules.sort((a, b) => new Date(a.Date + ' ' + a.Start) - new Date(b.Date + ' ' + b.Start));
    
        // Initialize processed NPT slots map
        const nptSlots = {};
    
        // Convert training length to minutes for easier calculations
        const [trainingHours, trainingMinutes] = trainingLength.split(':').map(Number);
        const totalTrainingMinutes = trainingHours * 60 + trainingMinutes;
    
        // Function to check if a date is a weekend
        const isWeekend = (date) => {
            const dayOfWeek = date.getDay();
            return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
        };
    
        // Iterate through the schedules to find available NPT slots
        schedules.forEach((schedule, index) => {
            // Skip if the type is not 'Work' or if it's a weekend and we're excluding weekends
            if (schedule.Type !== 'Work' || (excludeWeekends && isWeekend(new Date(schedule.Date)))) {
                return;
            }
    
            // Calculate the duration of each work period in minutes
            const startTime = new Date(schedule.Date + ' ' + schedule.Start);
            const endTime = new Date(schedule.Date + ' ' + schedule.End);
            const workDuration = (endTime - startTime) / (1000 * 60); // Convert milliseconds to minutes
    
            let currentDuration = 0;
            let currentTime = startTime;
            const currentSlot = [];
    
            while (currentDuration < totalTrainingMinutes && index < schedules.length) {
                let nextSchedule = schedules[index + 1];
    
                // Check for breaks if we're not excluding them
                if (!excludeBreaks && nextSchedule && nextSchedule.Type !== 'Work') {
                    let breakEnd = new Date(nextSchedule.Date + ' ' + nextSchedule.End);
                    currentSlot.push({
                        start: currentTime,
                        end: breakEnd,
                        duration: (breakEnd - currentTime) / (1000 * 60) // Duration in minutes
                    });
                    currentDuration += (breakEnd - currentTime) / (1000 * 60);
                    currentTime = breakEnd;
                    index++; // Move to the next schedule after the break
                } else {
                    currentSlot.push({
                        start: currentTime,
                        end: endTime,
                        duration: workDuration
                    });
                    currentDuration += workDuration;
                    break; // Exit while loop if we've reached the training length or there are no more schedules
                }
            }
    
            if (currentDuration >= totalTrainingMinutes) {
                nptSlots[schedule['CSA Login']] = currentSlot;
            }
        });
    
        return nptSlots;
    }
    
});
