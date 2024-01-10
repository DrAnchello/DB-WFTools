// Global constants
const finHCDBName = "FinHCDatabase";
const finHCObjectStoreName = "FinHCObjectStore";

// Function to open IndexedDB connection
function openIndexedDB(dbName, version = 1) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    request.onupgradeneeded = (event) => createObjectStore(event, finHCObjectStoreName);
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.errorCode);
  });
}

// Function to create object store
function createObjectStore(event, storeName) {
  const db = event.target.result;
  if (!db.objectStoreNames.contains(storeName)) {
    db.createObjectStore(storeName, { keyPath: "id" })
      .createIndex("dataIndex", "data", { unique: false });
  }
}

// Function to handle file selection for the "FinHC" CSV input
document.getElementById("csvInputFinHC").addEventListener("change", handleFileSelectFinHC, false);


function processFinHCCSV(csvData) {
  const lines = csvData.split("\n");
  const data = [];
  const emplidToUserid = {}; // Lookup object for Emplid to Userid
  const emplidToMgrId = {}; // Lookup object for Emplid to Manager's Emplid (Mgr ID)

  if (lines.length === 0) {
    console.error("CSV data is empty");
    return data;
  }

  // Extract headers from the first row
  const headers = parseCSVLine(lines[0]);

  // First pass: Build lookup maps
  lines.slice(1).forEach(line => {
    const values = parseCSVLine(line);
    const emplidIndex = headers.indexOf("Emplid");
    const useridIndex = headers.indexOf("Userid");
    const mgrIdIndex = headers.indexOf("Mgr ID");
    if (emplidIndex !== -1 && useridIndex !== -1 && mgrIdIndex !== -1) {
      const emplid = values[emplidIndex];
      const userid = values[useridIndex];
      const mgrId = values[mgrIdIndex];
      emplidToUserid[emplid] = userid; // Map Emplid to Userid
      emplidToMgrId[emplid] = mgrId; // Map Emplid to its Manager's Emplid (Mgr ID)
    }
  });

  // Second pass: Assign Manager Userid and Manager's Manager Userid
  lines.slice(1).forEach(line => {
    const values = parseCSVLine(line);
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });

    // Find Manager's Userid using Mgr ID
    const managerEmplid = record["Mgr ID"];
    record["Manager"] = emplidToUserid[managerEmplid] || "N/A";

    // Find Manager's Manager Emplid using current Manager's Emplid, then find Userid
    const directManagerEmplid = emplidToMgrId[managerEmplid];
    record["ManagerReportsTo"] = emplidToUserid[directManagerEmplid] || "N/A";

    data.push(record);
  });

  return data;
}


// Helper function to parse a line of CSV data
function parseCSVLine(line) {
  let isInsideQuotes = false;
  let currentValue = '';
  const values = [];

  for (let char of line) {
    if (char === '"') {
      isInsideQuotes = !isInsideQuotes;
    } else if (char === ',' && !isInsideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim()); // Add the last value
  return values;
}

// Handle file selection for the "FinHC" CSV input
function handleFileSelectFinHC(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const text = e.target.result;
    if (text.trim().length > 0) {
      const csvDataArrayFinHC = processFinHCCSV(text);
      if (csvDataArrayFinHC && csvDataArrayFinHC.length > 0) {
        storeFinHCCSVDataInIndexedDB(csvDataArrayFinHC);
        console.log("CSV data loaded successfully");
        console.log(csvDataArrayFinHC);
      } else {
        console.error("Parsed data is empty or invalid");
      }
    } else {
      console.error("FinHC CSV data is empty");
    }
  };

  reader.readAsText(file);
}

// Function to store FinHC CSV data in IndexedDB
async function storeFinHCCSVDataInIndexedDB(data) {
  try {
    const db = await openIndexedDB(finHCDBName);
    const transaction = db.transaction([finHCObjectStoreName], "readwrite");
    const objectStore = transaction.objectStore(finHCObjectStoreName);

    // Assuming that "data" is an array of objects, loop through and add each object
    data.forEach((record, index) => {
      // Assign a unique ID or use "index" as the ID, depending on your needs
      objectStore.add({ id: index, data: record });
    });

    transaction.oncomplete = () => console.log("FinHC data stored in IndexedDB");
    transaction.onerror = (event) => console.error("Error storing data:", event.target.errorCode);
  } catch (error) {
    console.error("Database error:", error);
  }
}

// Function to log FinHC data on page reload
async function logFinHCDataOnPageReload() {
  try {
    const db = await openIndexedDB(finHCDBName);
    const transaction = db.transaction([finHCObjectStoreName], "readonly");
    const objectStore = transaction.objectStore(finHCObjectStoreName);
    const request = objectStore.getAll();

    request.onsuccess = (event) => console.log("FinHC Data on Page Reload:", event.target.result);
    request.onerror = (event) => console.error("Error in reading FinHC data:", event.target.errorCode);
  } catch (error) {
    console.error("Database error:", error);
  }
}

document.addEventListener('DOMContentLoaded', logFinHCDataOnPageReload);
document.getElementById("csvInputFinHC").addEventListener("change", handleFileSelectFinHC, false);