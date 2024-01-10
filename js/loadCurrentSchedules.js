document.getElementById("loadShifts").addEventListener("click", async function () {
    console.log('Button clicked');
    const csaLogins = parseCSALogins(document.getElementById("scheduleFormCsaLogins").value);
    console.log('CSA Logins:', csaLogins);

    const selectedWeekValues = $('#scheduleFormWeekSelector').val(); // Retrieve the selected week values
    console.log('Week Selector Values:', selectedWeekValues);

    if (!selectedWeekValues || selectedWeekValues.length === 0) {
        console.error('Invalid week number. Please make sure to select a valid week.');
        return;
    }

    const selectedWeek = parseInt(selectedWeekValues[0], 10); // Handling the first selected value
    console.log('Selected Week:', selectedWeek);

    if (isNaN(selectedWeek)) {
        console.error('Invalid week number. Please make sure to select a valid week.');
        return;
    }

    try {
        const schedulesFromDB = await fetchSchedulesFromDB(csaLogins, selectedWeek);
        console.log('Filtered Schedules from DB:', schedulesFromDB);

        populateShiftTable(schedulesFromDB); // Call the function to populate the table
    } catch (error) {
        console.error('Failed to fetch schedules from IndexedDB', error);
    }
});

function processSchedules(schedules, csaLogins, selectedWeek) {
    return schedules
        .filter(schedule =>
            csaLogins.includes(schedule['CSA Login']) &&
            parseInt(schedule['WeekNumber']) === selectedWeek &&
            !(isMidnightStart(schedule['Start']) && isSunday(schedule['Date']))
        )
        .reduce((acc, schedule) => {
            const key = schedule['CSA Login'] + '-' + schedule['Workgroup'] + '-' + schedule['Start'];
            if (!acc[key]) {
                acc[key] = { ...schedule, Days: Array(7).fill(0) };
            }
            const dayIndex = new Date(schedule['Date']).getDay();
            acc[key].Days[dayIndex] = 1;
            return acc;
        }, {});
}

function isMidnightStart(startTime) {
    return startTime === "0:00" || startTime === "24:00" || startTime === "00:00";
}

function isSunday(dateString) {
    const date = new Date(dateString);
    return date.getDay() === 0; // 0 corresponds to Sunday
}

function parseCSALogins(csaLoginsString) {
    // Use a regular expression to split by comma, tab, or space
    return csaLoginsString.split(/[\s,]+/).filter(Boolean);
}

function shouldFetchFromDB() {
    // Check if the checkbox element with ID 'loadSchedules' exists
    const loadSchedulesCheckbox = document.getElementById('loadSchedules');

    if (loadSchedulesCheckbox) {
        // Access the 'checked' property if the checkbox element exists
        return loadSchedulesCheckbox.checked;
    } else {
        // Default to false if the checkbox element doesn't exist
        return false;
    }
}

async function fetchBreakTimesFromDB(login) {
    // Example implementation. You'll need to adjust this according to your database structure and access method.
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('VibeScheduleDB', 2); // Version number 1

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            // Create an object store named "schedules" if it doesn't already exist
            if (!db.objectStoreNames.contains('schedules')) {
                db.createObjectStore('schedules', { keyPath: 'id' }); // Assuming 'id' is your primary key
            }
        };

        request.onerror = function (event) {
            console.error('Database error:', event.target.error);
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            // Now you can create transactions on the 'schedules' store
        };

    });
}

async function fetchSchedulesFromDB(csaLogins, selectedWeek) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('VibeScheduleDB', 2); // Ensure the version is correct

        request.onerror = function (event) {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction('schedules', 'readonly');
            const store = transaction.objectStore('schedules');
            const query = store.getAll();

            query.onsuccess = function (event) {
                const allSchedules = event.target.result;
                const filteredSchedules = allSchedules.filter(schedule =>
                    csaLogins.includes(schedule['CSA Login']) &&
                    parseInt(schedule['WeekNumber'], 10) === selectedWeek
                );
                resolve(filteredSchedules);
            };

            query.onerror = function (event) {
                console.error('Error fetching records:', event.target.error);
                reject(event.target.error);
            };
        };
    });
}

function filterAndGroupSchedules(schedules) {
    const filteredSchedules = schedules.filter(schedule =>
        schedule['Type'] === 'Work' &&
        !(isMidnightStart(schedule['Start']) && isSunday(schedule['Date']))
    );

    return filteredSchedules.reduce((acc, schedule) => {
        const key = schedule['CSA Login'] + '-' + schedule['Workgroup'] + '-' + schedule['Start'];
        if (!acc[key]) {
            acc[key] = { ...schedule, Days: Array(7).fill(0) };
        }
        const dayIndex = new Date(schedule['Date']).getDay();
        acc[key].Days[dayIndex] = 1;
        return acc;
    }, {});
}

async function populateShiftTable(schedules) {
    const tableBody = document.getElementById("shift-table").querySelector("tbody");
    tableBody.innerHTML = "";

    if (!schedules || schedules.length === 0) {
        console.error('No schedules to display.');
        return;
    }

    const groupedSchedules = filterAndGroupSchedules(schedules);

    // Define an async function to handle the loop
    async function processSchedulesAsync() {
        if (!schedules) {
            console.error('Schedules array is undefined or null.');
            return;
        }

        // Loop through filtered schedules and populate the table
        for (const [key, combinedSchedule] of Object.entries(groupedSchedules)) {
            const newRow = document.createElement("tr");

            // Safety check for 'Days' array
            if (!Array.isArray(combinedSchedule.Days)) {
                console.error(`Missing or invalid 'Days' array for schedule:`, combinedSchedule);
                continue; // Skip this iteration if 'Days' is not an array
            }

            newRow.innerHTML = `<td>${combinedSchedule['CSA Login']}</td>` +
                `<td>${combinedSchedule['Workgroup']}</td>` +
                `<td>${combinedSchedule['Start']}</td>` +
                `<td>${combinedSchedule['End']}</td>` +
                combinedSchedule.Days.map(day => `<td class="${day === 1 ? "cell-green" : "cell-yellow"}">${day}</td>`).join("");

            // Determine break times based on the checkbox status
            let breakTimes = {};
            if (shouldFetchFromDB()) {
                // Fetch break times from the database
                breakTimes = await fetchBreakTimesFromDB(combinedSchedule['CSA Login']);
            } else {
                // Calculate break times using BreakCalc.js logic
                breakTimes = calculateBreaksAndLunch(combinedSchedule['Start'], combinedSchedule['End']);
            }

            // Append break times
            newRow.innerHTML +=
                `<td>${breakTimes.lunchStart || ""}</td>` +
                `<td>${breakTimes.lunchEnd || ""}</td>` +
                `<td>${breakTimes.break1Start || ""}</td>` +
                `<td>${breakTimes.break1End || ""}</td>` +
                `<td>${breakTimes.break2Start || ""}</td>` +
                `<td>${breakTimes.break2End || ""}</td>` +
                `<td>${breakTimes.break3Start || ""}</td>` +
                `<td>${breakTimes.break3End || ""}</td>`;

            tableBody.appendChild(newRow); // Append the new row to the table body
        }
    }

    // Call the async function
    await processSchedulesAsync();
}


function getDaysOfWeekArray(dateString) {
    const date = new Date(dateString);
    const daysOfWeek = ['0', '0', '0', '0', '0', '0', '0'];
    daysOfWeek[date.getDay()] = '1'; // Mark the corresponding day of week as '1'
    return daysOfWeek;
}

async function insertRowIntoTable(schedule) {
    const newRow = document.createElement("tr");
    const tableBody = document.getElementById("shift-table").querySelector("tbody");

    // Basic row data
    newRow.innerHTML =
        `<td>${schedule['CSA Login']}</td>` +
        `<td>${schedule['Workgroup']}</td>` +
        `<td>${schedule['Start']}</td>` +
        `<td>${schedule['End']}</td>` +
        schedule.Days.map(day => `<td class="${day === "1" ? "cell-green" : "cell-yellow"}">${day}</td>`).join("");

    // Check the checkbox status
    const includeBreaks = document.getElementById('loadSchedules').checked;  // Updated ID

    let breakTimes = {};
    if (includeBreaks) {
        // Fetch break times from the database or recalculate them
        breakTimes = await (shouldFetchFromDB() ? fetchBreakTimesFromDB(schedule['CSA Login']) : calculateBreaksAndLunch(schedule['Start'], schedule['End']));
    }

    // Append break times
    newRow.innerHTML +=
        `<td>${breakTimes.lunchStart || ""}</td>` +
        `<td>${breakTimes.lunchEnd || ""}</td>` +
        `<td>${breakTimes.break1Start || ""}</td>` +
        `<td>${breakTimes.break1End || ""}</td>` +
        `<td>${breakTimes.break2Start || ""}</td>` +
        `<td>${breakTimes.break2End || ""}</td>` +
        `<td>${breakTimes.break3Start || ""}</td>` +
        `<td>${breakTimes.break3End || ""}</td>`;

    tableBody.appendChild(newRow); // Append the new row to the table body
}