document.addEventListener('DOMContentLoaded', function () {
    let db;

    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("VibeScheduleDB", 2); // Correct version number

            request.onupgradeneeded = (event) => {
                db = event.target.result;
                if (!db.objectStoreNames.contains("schedules")) {
                    db.createObjectStore("schedules", { keyPath: "id" });
                }
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                resolve();
            };

            request.onerror = (event) => {
                // Improved error handling in the reject call
                const error = event.target.error ? event.target.error : "Unknown error";
                console.error("Database error:", error);
                reject("Database error: " + error);
            };
        });
    }

    function parseFormInputs() {
        const csaLogins = document.getElementById('csaLoginGroupNPT').value.toLowerCase().split(/[\s,]+/);
        const duration = document.getElementById('duration').value;
        const startTime = document.getElementById('startTime').value;
        const dates = document.getElementById('dateMultiSelect').value.split(','); // Assuming comma-separated dates
        const slotType = document.getElementById('slotTypeGroupNPT').value;
        const comment = document.getElementById('comment').value;

        return { csaLogins, duration, startTime, dates, slotType, comment };
    }

    function calculateEndTime(startTime, duration) {
        const [hours, minutes] = duration.split(':').map(Number);
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const startTimeDate = new Date();

        startTimeDate.setHours(startHours);
        startTimeDate.setMinutes(startMinutes);
        startTimeDate.setHours(startTimeDate.getHours() + hours);
        startTimeDate.setMinutes(startTimeDate.getMinutes() + minutes);

        // Extracting the HH:MM part from the toTimeString()
        return startTimeDate.toTimeString().split(':')[0] + ':' + startTimeDate.toTimeString().split(':')[1];
    }

    // Function to get Workgroup for a CSA Login from IndexedDB
    async function getWorkgroup(csaLogin) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("VibeScheduleDB", 2);

            request.onerror = (event) => {
                reject("Database error: " + (event.target.error ? event.target.error.message : "Unknown error"));
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(["schedules"], "readonly");
                const store = transaction.objectStore("schedules");
                const cursorRequest = store.openCursor();

                cursorRequest.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor) {
                        if (cursor.value["CSA Login"] === csaLogin) {
                            resolve(cursor.value.Workgroup); // Found the matching CSA Login
                            return;
                        }
                        cursor.continue();
                    } else {
                        resolve('Unknown'); // Did not find the CSA Login
                    }
                };

                cursorRequest.onerror = (event) => {
                    reject("Cursor error: " + (event.target.error ? event.target.error.message : "Unknown error"));
                };
            };
        });
    }

    // Function to populate the table with data
    async function populateTable(data) {
        const tableBody = document.getElementById('generatedSlotsTable').getElementsByTagName('tbody')[0];

        for (const date of data.dates) {
            for (const login of data.csaLogins) {
                const workgroup = await getWorkgroup(login);
                const endTime = calculateEndTime(data.startTime, data.duration);
                const row = tableBody.insertRow();

                // Add cells and fill them with values
                row.insertCell(0).innerHTML = login;
                row.insertCell(1).innerHTML = workgroup;
                row.insertCell(2).innerHTML = data.slotType;
                row.insertCell(3).innerHTML = date;
                row.insertCell(4).innerHTML = data.startTime;
                row.insertCell(5).innerHTML = endTime;
                row.insertCell(6).innerHTML = data.duration;
                row.insertCell(7).innerHTML = data.comment; // Placeholder
                row.insertCell(8).innerHTML = ''; // Placeholder
                row.insertCell(9).innerHTML = ''; // Placeholder
            }
        }
    }

    // Event handler for the submit button
    document.getElementById('groupNPTbutton').addEventListener('click', async function () {
        const formData = parseFormInputs();
        await populateTable(formData);
    });

    // Initialize the database
    openDatabase().then(() => {
        console.log("Database initialized successfully");
    }).catch((error) => {
        console.error("Error opening database: ", error);
    });
}); 