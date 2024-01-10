// ScheduleGen.js

document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('scheduleForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Log to see if the handler is called more than once
    console.log('Form submitted');

    const csaLogins = document.getElementById('scheduleFormCsaLogins').value.split(/[\s,]+/).map(login => login.trim());
    const startTime = document.getElementById('scheduleFormStartTime').value;
    const endTime = document.getElementById('scheduleFormEndTime').value;
    const selectedDays = document.getElementById('scheduleFormDaySelector').value; // assuming this returns a comma-separated list of days

    for (const login of csaLogins) {
      const workgroup = await fetchWorkgroupForLogin(login);
      const breaks = calculateBreaksAndLunch(startTime, endTime);

      addToTable(login, startTime, endTime, selectedDays, workgroup, breaks);
    }
  });
});

// Remove the event listener before adding it, to ensure it's not duplicated
const formElement = document.getElementById('scheduleForm');

async function fetchWorkgroupForLogin(login) {
  const db = await openDB();
  const transaction = db.transaction("schedules");
  const store = transaction.objectStore("schedules");
  const query = store.getAll();

  return new Promise((resolve, reject) => {
    query.onsuccess = (event) => {
      const schedules = event.target.result;
      const userSchedule = schedules.find(schedule => schedule['CSA Login'] === login);
      resolve(userSchedule ? userSchedule.Workgroup : 'Unknown');
    };

    query.onerror = (event) => reject(event.target.error);
  });
}

function addToTable(login, startTime, endTime, days, workgroup, breaks) {
  // First, get the table body or create it if it doesn't exist
  let tbody = document.querySelector('#shift-table tbody');
  if (!tbody) {
    tbody = document.createElement('tbody');
    document.getElementById('shift-table').appendChild(tbody);
  }

  // Create a new row in the tbody element
  const row = tbody.insertRow();

  // Add cells and fill them with data
  row.insertCell().textContent = login;
  row.insertCell().textContent = workgroup;
  row.insertCell().textContent = startTime;
  row.insertCell().textContent = endTime;

  // Parse the dates and fill in the day columns with 1 or 0
  const dateStrings = days.split(', ').map(dateStr => dateStr.trim());
  const dayIndices = dateStrings.map(dateStr => (new Date(dateStr)).getDay());
  const dayMapping = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  dayMapping.forEach((day, index) => {
    const dayCell = row.insertCell();
    const isActiveDay = dayIndices.includes(index);
    dayCell.textContent = isActiveDay ? '1' : '0';
    dayCell.classList.add(isActiveDay ? 'cell-green' : 'cell-yellow');
  });
  

  // Add break times assuming breaks is an object containing break times
  // in the format { break1Start: '10:00', break1End: '10:15', ... }
  row.insertCell().textContent = breaks.lunchStart;
  row.insertCell().textContent = breaks.lunchEnd;
  row.insertCell().textContent = breaks.break1Start;
  row.insertCell().textContent = breaks.break1End;
  row.insertCell().textContent = breaks.break2Start;
  row.insertCell().textContent = breaks.break2End;
  row.insertCell().textContent = breaks.break3Start;
  row.insertCell().textContent = breaks.break3End;
}

async function openDB() {
  return new Promise((resolve, reject) => {
      const request = indexedDB.open("VibeScheduleDB", 2); // Replace with your actual DB name and version

      request.onerror = event => {
          console.error("Error opening DB:", event.target.errorCode);
          reject(event.target.error);
      };

      request.onsuccess = event => {
          resolve(event.target.result);
      };
  });
}
