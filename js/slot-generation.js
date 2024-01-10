function loadDataFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open('VibeScheduleDB');

    openRequest.onerror = function () {
      reject('Database failed to open');
    };

    openRequest.onsuccess = function () {
      const db = this.result;
      const transaction = db.transaction('schedules', 'readonly');
      const objectStore = transaction.objectStore('schedules');
      const request = objectStore.getAll();

      request.onerror = function () {
        reject('Error fetching data');
      };

      request.onsuccess = function () {
        resolve(request.result);
      };
    };
  });
}

function processScheduleData(scheduleData) {
  return scheduleData.map((record) => {

    // Ensure that the property names are correct and match the IndexedDB records
    const csaLogin = record['CSA Login'];
    const managerLogin = record['Manager Login'];
    const startDate = moment(record.startDateTime, 'MM/DD/YYYY HH:mm').format('YYYY-MM-DD HH:mm');
    const endDate = moment(record.endDateTime, 'MM/DD/YYYY HH:mm').format('YYYY-MM-DD HH:mm');

    // Return the new object with the correct property names
    return {
      CSA_Login: csaLogin, // Use the exact key from your data
      Workgroup: record.Workgroup,
      Manager_Login: managerLogin, // Use the exact key from your data
      Type: record.Type,
      Start: startDate,
      End: endDate,
      Comment: record['Requester Comment'] || '', // Provide a default if not present
      Uploader: '', // This is not provided in your IndexedDB data
      Upload_date: '', // This is not provided in your IndexedDB data
      Site: record.Site,
    };
  });
}


function populateTableWithIndexedDBData() {
  loadDataFromIndexedDB()
    .then((rawData) => {
      console.log("Raw Data from IndexedDB:", rawData); // Log the raw data
      const processedData = processScheduleData(rawData);

      // Check if the table body exists before populating
      if (document.getElementById('tableBody')) {
        populateTable(processedData);
      } else {
        console.log('Table body not found, skipping population.');
      }
    })
    .catch((error) => {
      console.error('Error loading data from IndexedDB', error);
    });
}
// Assuming populateTable function is similar to the one provided for CSV
// You would use it here after processing data from IndexedDB
populateTableWithIndexedDBData();


function populateTable(processedData) {
  // Get the tbody element within the table, not the table itself
  const tableBody = document.getElementById('tableBody'); // Use the correct ID for tbody
  if (!tableBody) {
    console.error('Table body element not found');
    return;
  }

  tableBody.innerHTML = ''; // Clear existing rows in the body, not the entire table

  processedData.forEach(row => {
    const tr = document.createElement('tr');

    // Create and append table cells for each field
    tr.appendChild(createTableCell(row.CSA_Login || ''));
    tr.appendChild(createTableCell(row.Workgroup || ''));
    tr.appendChild(createTableCell(row.Manager_Login || ''));
    tr.appendChild(createTableCell(row.Type || ''));
    tr.appendChild(createTableCell(row.Start || ''));
    tr.appendChild(createTableCell(row.End || ''));
    tr.appendChild(createTableCell(row.Comment || ''));
    tr.appendChild(createTableCell(row.Uploader || ''));
    tr.appendChild(createTableCell(row.Upload_date || ''));
    tr.appendChild(createTableCell(row.Site || ''));

    tableBody.appendChild(tr); // Append the row to tbody
  });

  function createTableCell(text) {
    const td = document.createElement('td');
    td.textContent = text;
    return td;
  }

  // Show success toast
  showToast('scheduleToast');
}

function showToast(toastId) {
  const toast = new bootstrap.Toast(document.getElementById(toastId));
  toast.show();
}

function showFailureToast() {
  showToast('failureToast');
}

function countLogins() {
  const loginTextarea = document.getElementById('login');
  const logins = loginTextarea.value.split(/[ ,\t\n]+/).map(login => login.trim());
  const loginsCount = logins.filter(login => login.length > 0).length;
  return loginsCount;
}

document.getElementById('login').addEventListener('input', function () {
  const loginsCount = countLogins();
  document.getElementById('loginsCount').innerText = loginsCount;
});

document.addEventListener("DOMContentLoaded", function () {
  // Elements retrieval
  var limitTimesCheckbox = document.getElementById("limitTimes");
  // Log when checkbox is checked
  limitTimesCheckbox.addEventListener('change', function () {
    console.log('Checkbox checked');
  });
  var timeRangeGroup = document.getElementById("timeRangeGroup");
  // Log time range
  timeRangeGroup.addEventListener('change', function () {
    console.log('Time range changed');
  });
  var startTimeInput = document.getElementById("startTime");
  var endTimeInput = document.getElementById("endTime");

  // Function to toggle time range inputs
  function toggleTimeRangeInputs() {
    if (limitTimesCheckbox.checked) {
      timeRangeGroup.style.display = ''; // Unhide the input group
      startTimeInput.disabled = false;    // Enable the start time input
      endTimeInput.disabled = false;      // Enable the end time input
    } else {
      timeRangeGroup.style.display = 'none'; // Hide the input group
      startTimeInput.disabled = true;         // Disable the start time input
      endTimeInput.disabled = true;           // Disable the end time input
    }
  }

  // Event listeners
  limitTimesCheckbox.addEventListener('change', toggleTimeRangeInputs);

  // Call the function initially to set the correct state based on the initial checkbox state
  toggleTimeRangeInputs();

  // Additional logic can be added here for other form elements and their event listeners
});

function getTableData() {
  const table = document.getElementById('loadedSchedules');
  const rows = table.querySelectorAll('tbody tr');
  const data = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const rowData = {
      Login: cells[0].textContent,
      Workgroup: cells[1].textContent,
      ManagerLogin: cells[2].textContent, // Assuming you need this
      Type: cells[3].textContent,
      Start: new Date(cells[4].textContent), // Convert to Date object
      End: new Date(cells[5].textContent), // Convert to Date object
      Comment: cells[6].textContent,
      Uploader: cells[7].textContent,
      UploadDate: cells[8].textContent,
      Site: cells[9].textContent
    };

    data.push(rowData);
  });

  return data;
}

document.getElementById('generateSlots').addEventListener('click', async function (event) {
  showGenerationPopup(); // Show the popup immediately

  // Defer the rest of the operations
  setTimeout(async () => {
    await generateSlots(event);
  }, 0); // setTimeout with 0 delay ensures that it's executed after the current call stack is cleared
});

function addProcessingMessage(stepsContainer, message) {
  const msgElement = document.createElement('p');
  msgElement.innerText = message;
  stepsContainer.appendChild(msgElement);

  // Set a timeout to fade out the message
  setTimeout(() => {
    msgElement.classList.add('fade-out');

    // Remove the element after fading out
    msgElement.addEventListener('animationend', () => {
      stepsContainer.removeChild(msgElement);
    });
  }, 2); // Delay before starting the fade out

  // Scroll the container to the bottom
  const container = document.getElementById('generationStepsContainer');
  container.scrollTop = container.scrollHeight;
}

function showGenerationPopup() {
  const popup = document.getElementById('generationPopup');
  const stepsContainer = document.getElementById('generationSteps');
  popup.style.display = 'block';
  stepsContainer.innerHTML = '<p>Initializing slot generation...</p>';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateSlots(event) {
  event.preventDefault();

  // Show and initialize the popup
  const popup = document.getElementById('generationPopup');
  const stepsContainer = document.getElementById('generationSteps');
  popup.style.display = 'block';
  stepsContainer.innerHTML = '<p>Initializing slot generation...</p>';

  // Collect inputs
  const loginsText = document.getElementById('login').value;
  const slotType = document.getElementById('slotType').value;
  const slotLength = parseInt(document.getElementById('slotLength').value, 10);
  const avoidLunch = document.getElementById('avoidLunch').checked;
  const avoidBreaks = document.getElementById('avoidBreaks').checked;
  const avoidNonWorkNPT = document.getElementById('avoidNonWorkNPT').checked;
  const slotName = document.getElementById('slotName').value;
  const excludeDates = document.getElementById('excludeDates').value.split(',').map(date => new Date(date));
  const limitTimes = document.getElementById('limitTimes').checked;
  let startTimeLimit, endTimeLimit;
  if (limitTimes) {
      startTimeLimit = document.getElementById('startTime').value;
      endTimeLimit = document.getElementById('endTime').value;
  }

  // Selected sites
  const selectedSites = Array.from(document.getElementById('siteSelect').selectedOptions).map(option => option.value);

  // Retrieve all selected manager and workgroup values
  const selectedManagers = Array.from(document.getElementById('managerSelect').selectedOptions).map(option => option.value);
  const selectedWorkgroups = Array.from(document.getElementById('workgroupSelect').selectedOptions).map(option => option.value);

  // Efficient data structure for loaded schedules
  const loadedSchedules = new Map();
  const rows = Array.from(document.querySelectorAll('#loadedSchedules tbody tr'));
  rows.forEach(row => {
      const login = row.cells[0].innerText.trim().toLowerCase();
      if (selectedSites.includes(row.cells[9].innerText.trim())) {
          if (!loadedSchedules.has(login)) {
              loadedSchedules.set(login, []);
          }
          loadedSchedules.get(login).push(row);
      }
  });

  // Filter logins based on loaded schedules
  const logins = loginsText.split(/[ ,\t\n]+/)
      .map(login => login.trim().toLowerCase())
      .filter(login => loadedSchedules.has(login));

    const slots = [];
    const unassignedLogins = new Map();
    const data = getTableData();
    let totalLogins = 0;
    let totalSlotsGenerated = 0;

    for (const login of logins) {
        totalLogins++;
        let validSlotFound = false;
        let attempts = 0;
        const maxAttempts = 20; // Prevent infinite loops

        while (!validSlotFound && attempts < maxAttempts) {
            attempts++;

            const workPeriods = data.filter(row => row.Login === login && row.Type === 'Work');
            if (workPeriods.length === 0) {
                unassignedLogins.set(login, 'No work periods found');
                break;
            }

            // Apply manager and workgroup filters
            const filteredWorkPeriods = workPeriods.filter(period => {
                const isManagerMatch = selectedManagers.length === 0 || selectedManagers.includes(period.ManagerLogin);
                const isWorkgroupMatch = selectedWorkgroups.length === 0 || selectedWorkgroups.includes(period.Workgroup);
                return isManagerMatch && isWorkgroupMatch;
            });

            if (filteredWorkPeriods.length === 0) {
                unassignedLogins.set(login, 'No matching work periods found');
                break;
            }

            const selectedWorkPeriod = filteredWorkPeriods[Math.floor(Math.random() * filteredWorkPeriods.length)]
          const workStart = new Date(selectedWorkPeriod.Start);
          const workEnd = new Date(selectedWorkPeriod.End);

          // Define nonWorkPeriods here
          const nonWorkPeriods = avoidNonWorkNPT ? data.filter(row => row.Login === login && row.Type !== 'Work') : [];

          // Generate a random slot start within the work period
          let randomSlotStart = new Date(workStart.getTime() + Math.random() * (workEnd.getTime() - workStart.getTime()));
          let randomSlotEnd = new Date(randomSlotStart.getTime() + slotLength * 60000);

          // Round the slot start time to the nearest 5 minutes
          roundToNearestFive(randomSlotStart);
          randomSlotEnd = new Date(randomSlotStart.getTime() + slotLength * 60000); // Recalculate slot end time          

          // Adjust for time limits
          if (limitTimes) {
              const slotStartDateTime = new Date(randomSlotStart.toDateString() + ' ' + startTimeLimit);
              const slotEndDateTime = new Date(randomSlotStart.toDateString() + ' ' + endTimeLimit);

              if (randomSlotStart < slotStartDateTime || randomSlotEnd > slotEndDateTime) {
                  continue; // Slot time not within limits, try again
              }
          }

          if (excludeDates.some(excludeDate => isSameDay(excludeDate, randomSlotStart)) ||
              (avoidLunch && isLunchTime(randomSlotStart)) ||
              (avoidBreaks && isBreakTime(randomSlotStart)) ||
              (avoidNonWorkNPT && nonWorkPeriods.some(period => doesOverlap(randomSlotStart, randomSlotEnd, new Date(period.Start), new Date(period.End))))) {
              continue; // Overlap or exclusion found, try again
          }

          if (randomSlotEnd <= workEnd && !excludeDates.some(excludeDate => isSameDay(excludeDate, randomSlotStart)) &&
                !(avoidLunch && isLunchTime(randomSlotStart)) &&
                !(avoidBreaks && isBreakTime(randomSlotStart)) &&
                !(avoidNonWorkNPT && nonWorkPeriods.some(period => doesOverlap(randomSlotStart, randomSlotEnd, new Date(period.Start), new Date(period.End))))) {
                
                slots.push({
                    Login: login,
                    Workgroup: selectedWorkPeriod.Workgroup,
                    Type: slotType,
                    Start: formatDate(randomSlotStart) + ' ' + formatTime(randomSlotStart),
                    End: formatDate(randomSlotEnd) + ' ' + formatTime(randomSlotEnd),
                    Length: formatSlotLength(slotLength),
                    Name: slotName
                });
                validSlotFound = true;
                totalSlotsGenerated++;
            }
        }

        if (!validSlotFound && attempts === maxAttempts) {
            unassignedLogins.set(login, 'Could not find a valid slot');
            stepsContainer.innerHTML += `<p>Slot not assigned for login: ${login} (Reason: Could not find a valid slot)</p>`;
            unassignedLogins.set(login, 'No free slots available for training');
        }
    }

    // After slot generation
    stepsContainer.innerHTML += `<p>Slot generation complete.</p>`;
    // Show the button group
    document.getElementById('popupButtons').style.display = 'block';

    displaySlots(slots);
    displayUnassignedLogins(unassignedLogins);

    await delay(1000); // Delay for final UI update
    // popup.style.display = 'none';
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

function doesOverlap(slotStart, slotEnd, periodStart, periodEnd) {
  return (slotStart < periodEnd && slotEnd > periodStart);
}

function roundToNearestFive(date) {
  const minutes = date.getMinutes();
  const roundedMinutes = 5 * Math.round(minutes / 5);
  date.setMinutes(roundedMinutes);
  date.setSeconds(0); // Optionally set seconds to zero
}

function displaySlots(slots) {
  const tableBody = document.getElementById('generatedSlotsTable').querySelector('tbody');
  tableBody.innerHTML = '';

  slots.forEach(slot => {
    const row = tableBody.insertRow();
    row.insertCell().textContent = slot.Login;
    row.insertCell().textContent = slot.Workgroup;
    row.insertCell().textContent = slot.Type;
    row.insertCell().textContent = slot.Start;
    row.insertCell().textContent = slot.End;
    row.insertCell().textContent = slot.Length;
    row.insertCell().textContent = slot.Name;
  });
}

function isWeekend(date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

function isLunchTime(time) {
  // Define lunch time (example: 12pm to 1pm)
  const lunchStart = new Date(time);
  lunchStart.setHours(12, 0, 0);
  const lunchEnd = new Date(time);
  lunchEnd.setHours(13, 0, 0);

  return time >= lunchStart && time < lunchEnd;
}

function isBreakTime(time) {
  // Define break time (example: 10am to 10:15am)
  const breakStart = new Date(time);
  breakStart.setHours(10, 0, 0);
  const breakEnd = new Date(time);
  breakEnd.setHours(10, 15, 0);

  return time >= breakStart && time < breakEnd;
}

function isNonWorkNPT(type) {
  const nonWorkNPTTypes = ['Meeting', 'Project Work', 'Training', '1-on-1'];
  return nonWorkNPTTypes.includes(type);
}

function formatSlotLength(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function formatTime(time) {
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}



// Dynamically load the site to the select options

// Debounce function
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function handleLoginChange() {
  let inputLogins = document.getElementById('login').value.split(/[\s,]+/).map(l => l.trim().toLowerCase());
  console.log("Input Logins: ", inputLogins); // Debug log

  let managers = new Set();
  let workgroups = new Set();
  let sites = new Set();

  document.querySelectorAll('#loadedSchedules tbody tr').forEach(row => {
    let tableLogin = row.cells[0].innerText.trim().toLowerCase();
    if (inputLogins.includes(tableLogin)) {
      managers.add(row.cells[2].innerText.trim());
      workgroups.add(row.cells[1].innerText.trim());
      sites.add(row.cells[9].innerText.trim());
    }
  });

  console.log("Managers: ", Array.from(managers)); // Debug log
  console.log("Workgroups: ", Array.from(workgroups)); // Debug log
  console.log("Sites: ", Array.from(sites)); // Debug log

  populateSelect('managerSelect', Array.from(managers));
  populateSelect('workgroupSelect', Array.from(workgroups));
  populateSelect('siteSelect', Array.from(sites));
}

document.getElementById('login').addEventListener('input', handleLoginChange); // Removed debounce for debugging

function populateSelect(sites) {
  let select = document.getElementById('siteSelect');
  let options = sites.map(site => `<option value="${site}">${site}</option>`).join('');
  select.innerHTML = options; // Batched DOM update
}

function handleLoginChange() {
  let inputLogins = document.getElementById('login').value.split(/[\s,]+/).map(l => l.trim().toLowerCase());

  let managers = new Set();
  let workgroups = new Set();
  let sites = new Set();

  document.querySelectorAll('#loadedSchedules tbody tr').forEach(row => {
    let tableLogin = row.cells[0].innerText.trim().toLowerCase();

    if (inputLogins.includes(tableLogin)) {
      console.log("Match Found: ", tableLogin); // Log if there's a match
      managers.add(row.cells[2].innerText.trim());
      workgroups.add(row.cells[1].innerText.trim());
      sites.add(row.cells[9].innerText.trim());
    }
  });

  populateSelect('managerSelect', Array.from(managers));
  populateSelect('workgroupSelect', Array.from(workgroups));
  populateSelect('siteSelect', Array.from(sites));
}

document.getElementById('login').addEventListener('input', handleLoginChange);

function populateSelect(selectId, items) {
  let select = document.getElementById(selectId);
  // Remove all options except the first one (presumed to be "All")
  while (select.options.length > 1) {
    select.remove(1);
  }

  // Now add new options
  items.forEach(item => {
    let option = document.createElement("option");
    option.value = item;
    option.text = item;
    select.appendChild(option);
  });
}


function handleSelectAllOption(selectElementId) {
  const selectElement = document.getElementById(selectElementId);
  selectElement.addEventListener('change', () => {
    const allOption = selectElement.querySelector('option[value="all"]');
    const isAllSelected = allOption.selected;
    if (isAllSelected) {
      selectElement.querySelectorAll('option').forEach(option => option.selected = true);
    } else {
      // Deselect all if 'All' option was manually deselected
      if (selectElement.selectedOptions.length === selectElement.options.length) {
        selectElement.querySelectorAll('option').forEach(option => option.selected = false);
      }
    }
  });
}

// Call this function for each select element
handleSelectAllOption('managerSelect');
handleSelectAllOption('workgroupSelect');

document.getElementById('showFailedLogins').addEventListener('click', function () {
  function displayUnassignedLogins(unassignedLogins) {
    let modalBody = document.getElementById('failedLoginsModalBody');
    modalBody.innerHTML = Array.from(unassignedLogins.entries()).join('<br>');
    $('#failedLoginsModal').modal('show');
  }


  // Implement the functionality to show failed logins
});

document.getElementById('viewSlotsHeatmap').addEventListener('click', function () {
  // Implement the functionality to view slots heatmap
});

document.getElementById('recalculateSlots').addEventListener('click', function () {
  // Implement the functionality to recalculate slots
});

document.getElementById('closePopup').addEventListener('click', function () {
  document.getElementById('generationPopup').style.display = 'none';
});

// Get the "Show Table" link element
const showTableLink = document.getElementById('showTableBtn');

// Check if the element exists before trying to add an event listener
if (showTableLink) {
  // Add event listener to the "Show Table" link
  showTableLink.addEventListener('click', function (event) {
    // Prevent the default link behavior
    event.preventDefault();

    // Use the Bootstrap 5 method to show the modal
    var myModal = new bootstrap.Modal(document.getElementById('tableModal'), {
      keyboard: false
    });
    myModal.show();
  });
} else {
  console.error('Could not find the button element');
}

async function fetchDatesFromDB() {
  return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open('VibeScheduleDB', 2); // Adjust the version number as needed

      openRequest.onerror = () => reject('Database failed to open');
      openRequest.onsuccess = () => {
          const db = openRequest.result;
          const transaction = db.transaction('schedules', 'readonly');
          const store = transaction.objectStore('schedules');
          const request = store.getAll();

          request.onerror = () => reject('Error in fetching data');
          request.onsuccess = () => {
              const result = request.result.map(item => item.Date); // Assuming 'Date' is the field
              resolve(result);
          };
      };
  });
}

function convertDatesForFlatpickr(dates) {
  return dates.map(date => {
      const [month, day, year] = date.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
      const dates = await fetchDatesFromDB();
      const formattedDates = convertDatesForFlatpickr(dates);
      flatpickr("#excludeDates", {
          enable: formattedDates,
          dateFormat: "Y-m-d",
          mode: "multiple",
          disableMobile: true,
          weekNumbers: true,  
      });
  } catch (error) {
      console.error("Error initializing Flatpickr:", error);
  }
});
