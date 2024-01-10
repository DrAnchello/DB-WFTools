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
            db.createObjectStore("schedules", { keyPath: "id", autoIncrement: true });
        }
        // Define other indexes as required
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
            objectStore.add(rowData);
        });

        transaction.oncomplete = function () {
            console.log("Data stored in IndexedDB");
            console.log(data);
            // reload page
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

// Load stored DB info on page load
window.onload = function () {
    var request = window.indexedDB.open("VibeScheduleDB", 2);

    request.onerror = function (event) {
        console.error("Database error: " + event.target.errorCode);
    };

    request.onsuccess = function (event) {
        var db = event.target.result;
        var transaction = db.transaction("schedules", "readonly");
        var objectStore = transaction.objectStore("schedules");
        var cursorRequest = objectStore.openCursor();

        cursorRequest.onsuccess = function (e) {
            var cursor = e.target.result;
            if (cursor) {
                // Log the current row's data
                cursor.value;
                cursor.continue();
            } else {
                console.log("No more entries!");
            }
        };
    };
};

// Clear StoredDB
document.addEventListener("DOMContentLoaded", () => {
    const clearDataButton = document.getElementById('clearDataButton');

    clearDataButton.addEventListener('click', () => {
        // Function to clear a specific database and object store
        const clearDatabase = (dbName, storeName) => {
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
                };
            };
        };

        // Clear VibeScheduleDB
        clearDatabase("VibeScheduleDB", "schedules");

        // Clear FinHCDatabase
        clearDatabase("FinHCDatabase", "FinHCObjectStore");
    });
});

