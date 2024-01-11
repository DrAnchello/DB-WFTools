// dbOperations.js

// Function to setup IndexedDB
export function setupIndexedDB() {
    const request = window.indexedDB.open("VibeScheduleDB", 2); // Incremented version number

    request.onerror = function (event) {
        console.error("Database error: " + event.target.errorCode);
    };

    request.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("schedules")) {
            const objectStore = db.createObjectStore("schedules", { keyPath: "id", autoIncrement: true });

            // Update here: Create an index for 'CSA Login'
            objectStore.createIndex("csaIndex", "CSA Login", { unique: false }); // Ensure this matches your data structure
        }
    };
}

// Function to store data in IndexedDB
export function storeDataInIndexedDB(data) {
    const dbRequest = window.indexedDB.open("VibeScheduleDB", 2);

    dbRequest.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["schedules"], "readwrite");
        const objectStore = transaction.objectStore("schedules");

        data.forEach((rowData) => {
            if (rowData['CSA Login'] !== undefined) {
                const checkRequest = objectStore.index('csaIndex').get(rowData['CSA Login']);

                checkRequest.onsuccess = function (e) {
                    const matchingRecord = e.target.result;
                    if (matchingRecord) {
                        alertDuplicateData(() => clearScheduleStore(db));
                    } else {
                        objectStore.add(rowData);
                    }
                };
            }
        });

        transaction.oncomplete = function () {
            console.log("Data stored in IndexedDB");
            // Reload the page after successful data addition
            window.location.reload();
        };

        transaction.onerror = function (event) {
            console.error("Transaction error:", event.target.error);
        };
    };

    dbRequest.onerror = function (event) {
        console.error("Database open error:", event.target.errorCode);
    };
}

function alertDuplicateData(callback) {
    const userResponse = confirm("Duplicate data week for CSAs has been found and not overwritten. Do you want to clear the schedule store?");
    if (userResponse) {
        callback();
    }
}

function clearScheduleStore(db) {
    const transaction = db.transaction(["schedules"], "readwrite");
    const objectStore = transaction.objectStore("schedules");
    const clearRequest = objectStore.clear();

    clearRequest.onsuccess = function() {
        alert("Schedule store cleared.");
        // Consider reloading the page here as well if needed
    };
}

// Load stored DB info on page load
window.onload = function () {
    const request = window.indexedDB.open("VibeScheduleDB", 2);

    request.onerror = function (event) {
        console.error("Database error: " + event.target.errorCode);
    };

    request.onsuccess = function (event) {
        let dbSize = 0;
        const db = event.target.result;
        const transaction = db.transaction("schedules", "readonly");
        const objectStore = transaction.objectStore("schedules");
        const cursorRequest = objectStore.openCursor();

        cursorRequest.onsuccess = function (e) {
            const cursor = e.target.result;
            if (cursor) {
                // Calculate the size of this row
                const json = JSON.stringify(cursor.value);
                const size = new TextEncoder().encode(json).length;
                dbSize += size; // Add to the total size
                cursor.continue();
            } else {
                // No more entries, update the size display
                const dbSizeInMB = (dbSize / 1024 / 1024).toFixed(2); // Convert bytes to MB
                document.getElementById("dbSize").textContent = `Total DB size: ${dbSizeInMB} MB`;
            }
        };
    };
};

// Function to clear a specific database and object store
const clearDatabase = (dbName, storeName, callback) => {
    const request = indexedDB.open(dbName);

    request.onerror = (event) => {
        console.error(`IndexedDB error on ${dbName}:`, event.target.error);
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction([storeName], "readwrite");
        const objectStore = transaction.objectStore(storeName);

        const clearRequest = objectStore.clear();

        clearRequest.onsuccess = () => {
            console.log(`The object store ${storeName} in ${dbName} has been cleared`);
        };

        clearRequest.onerror = (event) => {
            console.error(`Error clearing the object store ${storeName} in ${dbName}:`, event.target.error);
        };

        transaction.oncomplete = () => {
            db.close();
            if (typeof callback === 'function') {
                callback();
            }
        };
    };
};

// Clear StoredDB
document.addEventListener("DOMContentLoaded", () => {
    const clearDataButton = document.getElementById('clearDataButton');

    clearDataButton.addEventListener('click', () => {
        // Clear VibeScheduleDB
        clearDatabase("VibeScheduleDB", "schedules", () => {
            // Clear FinHCDatabase
            clearDatabase("FinHCDatabase", "FinHCObjectStore", () => {
                // Reload the page after both databases are cleared
                window.location.reload();
            });
        });
    });
});

