let currentTableId; // Declare a variable to store the current table ID

document.addEventListener('DOMContentLoaded', function () {
    const viewButton = document.getElementById('viewSiteSchedules');
    if (viewButton) {
        viewButton.addEventListener('click', () => {
            generateCombinedData().then(combinedData => {
                // Use a static table ID instead of a dynamic one
                const tableId = 'scheduleReportDatatable';
                createAndPopulateTable(combinedData, tableId);
            }).catch(error => {
                console.error('Error during data generation:', error);
            });
        });
    } else {
        console.error('Button with ID "viewSiteSchedules" not found');
    }

});

function generateCombinedData() {
    console.log('Button clicked, starting data generation process');
    return Promise.all([
        getAllDataFromDatabase("VibeScheduleDB", "schedules"),
        getAllDataFromDatabase("FinHCDatabase", "FinHCObjectStore")
    ])
        .then(([vibeData, finData]) => {
            return combineData(vibeData, finData);
        });
}

function combineData(vibeData, finData) {
    console.log('Combining data from VibeScheduleDB and FinHCDatabase');

    const combinedData = finData.map(finRecord => {
        // Access the 'Userid' and 'Manager Reports to' field inside the 'data' object
        const finUserid = finRecord.data && finRecord.data['Userid'];
        // Access 'ManagerReportsTo' field directly
        const managerReportsTo = finRecord.ManagerReportsTo;

        if (!finUserid) {
            console.error(`Missing Userid in FinHC record:`, finRecord);
            return { ...finRecord, VibeSchedule: [], ManagerReportsTo: managerReportsTo || "N/A" };
        }

        // Filter VibeSchedule records to match the userid and filter out non-'Work' types
        const matchingVibeRecords = vibeData.filter(vibeRecord => {
            const vibeLogin = vibeRecord["CSA Login"];
            const type = vibeRecord["Type"];
            const date = new Date(vibeRecord["Date"]);
            const startTime = vibeRecord["Start"];

            if (!vibeLogin) {
                console.error(`Missing CSA Login in VibeSchedule record:`, vibeRecord);
                return false;
            }
            // Check for 'Work' type and exclude records for Sunday starting at midnight
            return vibeLogin.trim().toLowerCase() === finUserid.trim().toLowerCase() &&
                   type === 'Work' &&
                   !(date.getDay() === 0 && startTime === '0:00');
        });

        return {
            ...finRecord,
            VibeSchedule: matchingVibeRecords,
            ManagerReportsTo: managerReportsTo
        };
    });

    console.log('Combined Data:', combinedData);
    return combinedData;
}

function getAllDataFromDatabase(dbName, storeName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onerror = event => {
            reject('Database error: ' + event.target.errorCode);
        };
        request.onsuccess = event => {
            const db = event.target.result;
            const transaction = db.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const allDataRequest = objectStore.getAll();
            allDataRequest.onerror = event => {
                reject('Data retrieval error: ' + event.target.errorCode);
            };
            allDataRequest.onsuccess = event => {
                resolve(event.target.result);
            };
        };
    });
}

function formatTime(timeString) {
    // Check if timeString is a valid string
    if (typeof timeString !== 'string') {
        return ''; // Return an empty string if timeString is not valid
    }

    const [datePart, timePart] = timeString.split(' ');

    // Check if timePart is a valid string
    if (typeof timePart !== 'string') {
        return ''; // Return an empty string if timePart is not valid
    }

    const [hour, minute] = timePart.split(':');

    // Check if hour and minute are valid strings
    if (typeof hour !== 'string' || typeof minute !== 'string') {
        return ''; // Return an empty string if hour or minute is not valid
    }

    return `${hour}:${minute}`;
}

function createAndPopulateTable(combinedData, tableId) {
    const includedDeptIds = [1501, 1590, 1530, 1524, 1184, 1552, 1334, 7742, 1584, 5298, 1503];
    // Sort the combinedData array first 
    combinedData.sort((a, b) => {
        // Compare by Workgroup
        const workgroupA = a.VibeSchedule[0]?.['Workgroup'] || '';
        const workgroupB = b.VibeSchedule[0]?.['Workgroup'] || '';

        // Filter out rows where both workgroupA and workgroupB are empty
        if (workgroupA === '' && workgroupB === '') return 0;
        if (workgroupA === '') return 1;
        if (workgroupB === '') return -1;

        const workgroupComparison = workgroupA.localeCompare(workgroupB);

        // If Workgroup comparison is not equal, return the result
        if (workgroupComparison !== 0) return workgroupComparison;

        // If Workgroup is equal, compare by CS OU
        const csOuA = a.data && a.data['CS OU'];
        const csOuB = b.data && b.data['CS OU'];

        return csOuA.localeCompare(csOuB);
    });

    // Create a new table with a fixed ID
    const table = document.createElement('table');
    table.id = tableId;
    table.className = 'display dashboard-table';

    // Create the header of the table
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>CSA Login</th>
            <th>Workgroup</th>
            <th>Manager Login</th>
            <th>Site</th>
            <th>Start</th>
            <th>End</th>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
            <th>Week</th>
            <th>Badge</th>
            <th>CS OU</th>
            <th>Manager</th>
            <th>Manager Reports To</th>
            <th>Tenure Group</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create and populate the body of the table
    const tbody = document.createElement('tbody');
    combinedData.forEach((record, index) => {
        // Skip rows where CSA Login is empty
        if (!record.data || !record.data['Userid']) {
            return;
        }

        // Convert DeptID to integer and check if it's in the included list
        const deptId = parseInt(record.data['DeptID']);
        if (!includedDeptIds.includes(deptId)) {
            return; // Skip this record if its DeptID is not in the included list
        }
        const weekSchedule = populateDayColumns(record.VibeSchedule);
        // Additional criteria check for VibeSchedule records
        if (record.VibeSchedule && record.VibeSchedule.length > 0) {
            const item = record.VibeSchedule[0];

            // Check if the criteria are met
            if (item['Type'] === 'Work') {
                const startDate = new Date(item['Start']);
                const shiftDuration = (new Date(item['End']) - startDate) / (1000 * 60 * 60); // Duration in hours
                const dayOfWeek = startDate.getDay(); // Get day of week (0 for Sunday)

                // Skip the record if it starts on Sunday at midnight and is shorter than 7 hours
                if (dayOfWeek === 0 && isMidnight(startDate) && shiftDuration < 7) {
                    return; // Skip this record
                }
            }
        }

        // Create table row and populate it with data
        const tr = document.createElement('tr');

        // Generate the clickable link for CSA Login, Manager, and Manager Reports To
        const csaLoginLink = `https://phonetool.amazon.com/users/${record.data['Userid']}`;
        const managerLink = `https://phonetool.amazon.com/users/${record.VibeSchedule[0]?.['Manager Login']}`;
        const managerReportsToLink = `https://phonetool.amazon.com/users/${record.data['ManagerReportsTo']}`;

        // Calculate today's date in the required format
        const today = new Date().toISOString().split('T')[0];

        // Hardcoded links for the actions
        const vibeScheduleLink = `https://vibe.a2z.com/scheduling/scheduleView/agentView/${record.data['Userid']}@amazon/${today}`;
        const logSimDownloadLink = `https://example.com/logSimDownload/${record.data['Userid']}`;        

        // Function to add class based on value
        function addClassBasedOnValue(value) {
            if (value === 1) {
                return 'cell-green';
            } else if (value === 0) {
                return 'cell-yellow';
            } else {
                return ''; // No class
            }
        }

        tr.innerHTML = `
        <td><a href="${csaLoginLink}" target="_blank">${record.data['Userid']}</a></td>
        <td>${record.VibeSchedule[0]?.['Workgroup'] || ''}</td>
        <td>${record.VibeSchedule[0]?.['Manager Login'] || ''}</td>
        <td>${record.VibeSchedule[0]?.['Site'] || ''}</td>
        <td>${formatTime(record.VibeSchedule[0]?.['startDateTime'] || '')}</td>
        <td>${formatTime(record.VibeSchedule[0]?.['endDateTime'] || '')}</td>
        <td class="${addClassBasedOnValue(weekSchedule['Sun'])}">${weekSchedule['Sun']}</td>
        <td class="${addClassBasedOnValue(weekSchedule['Mon'])}">${weekSchedule['Mon']}</td>
        <td class="${addClassBasedOnValue(weekSchedule['Tue'])}">${weekSchedule['Tue']}</td>
        <td class="${addClassBasedOnValue(weekSchedule['Wed'])}">${weekSchedule['Wed']}</td>
        <td class="${addClassBasedOnValue(weekSchedule['Thu'])}">${weekSchedule['Thu']}</td>
        <td class="${addClassBasedOnValue(weekSchedule['Fri'])}">${weekSchedule['Fri']}</td>
        <td class="${addClassBasedOnValue(weekSchedule['Sat'])}">${weekSchedule['Sat']}</td>
        <td>${record.VibeSchedule[0]?.['WeekNumber'] || ''}</td>
        <td>${record.data['Badge'] || ''}</td>
        <td>${record.data['CS OU'] || ''}</td>
        <td><a href="${managerLink}" target="_blank">${record.VibeSchedule[0]?.['Manager Login'] || ''}</a></td>
        <td><a href="${managerReportsToLink}" target="_blank">${record.data['ManagerReportsTo']}</a></td>
            <td>${record.data['Tenure Group'] || ''}</td>
            <td>
                <div class="dropdown">
                    <button class="btn btn-xs btn-primary dropdown-toggle" type="button" id="actionsMenu_${index}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Actions
                    </button>
                    <div class="dropdown-menu" aria-labelledby="actionsMenu_${index}">
                        <a class="dropdown-item" href="${vibeScheduleLink}" target="_blank">Vibe Schedule</a>
                        <a class="dropdown-item" href="${logSimDownloadLink}" target="_blank">Log a simDownload</a>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    const container = document.getElementById('data-table-container');
    if (container) {
        container.innerHTML = '';
        container.appendChild(table);
    } else {
        console.error('Container element not found');
    }

    // Event listener for dropdown actions
    tbody.addEventListener('click', function (event) {
        if (event.target.matches('.dropdown-item')) {
            const action = event.target.getAttribute('data-action');
            const userId = event.target.getAttribute('data-userid');

            if (action === 'vibeSchedule') {
                const today = new Date().toISOString().split('T')[0];
                const scheduleUrl = `https://vibe.a2z.com/scheduling/scheduleView/agentView/${userId}@amazon/${today}`;
                window.open(scheduleUrl, '_blank');
            }
            // Handle other actions...
        }
    });
}

function getDayOfWeek(dateString) {
    const [month, day, year] = dateString.split('/').map(num => parseInt(num));
    const date = new Date(year, month - 1, day);
    return date.getDay();
}

// Utility function to initialize the week object
function initializeWeek() {
    return { 'Sun': '', 'Mon': '', 'Tue': '', 'Wed': '', 'Thu': '', 'Fri': '', 'Sat': '' };
}

// Function to populate the day columns based on the VibeSchedule
function populateDayColumns(schedule) {
    // Initialize all days as 0 (OFF)
    let week = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };

    schedule.forEach(item => {
        // Get day of the week as a number (0-6)
        const dayOfWeek = getDayOfWeek(item.Date);
        // Map the day of the week to the corresponding day name
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[dayOfWeek];
        // Set to 1 (On) if there is a schedule
        week[dayName] = 1;
    });

    return week;
}


