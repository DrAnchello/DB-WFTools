$(document).ready(function () {
    // Initialize existing selectpickers
    $('.form-select, #workgroupFilter, #managerFilter, #siteFilter, #weekSelector, #scheduleFormSiteSelection, #scheduleFormWeekSelector').selectpicker();

    // Initialize the select picker with custom options
    $('#workgroupsVibeDownload').selectpicker({
        noneSelectedText: 'Select Options',
        actionsBox: true,
        liveSearch: true,
        liveSearchNormalize: true,
        title: 'Select Workgroups',
        multipleSeparator: ', ',
        countSelectedText: function (numSelected, numTotal) {
            return numSelected === numTotal ? "All workgroups selected" : numSelected + " of " + numTotal + " selected";
        },
        maxOptions: 10,
        maxOptionsText: 'Maximum {n} workgroups selected',
        liveSearchStyle: 'startsWith', // Change to 'contains' if you prefer
        liveSearchFormatter: function (value) {
            return value.split(',').map(function (item) {
                return item.trim();
            });
        }
    }).on('show.bs.select', function () {
        // Hide the default "Select All" button (optional)
        $('.bs-select-all').hide();
    });

    // Custom "Select All Visible" button logic
    document.getElementById('customSelectAll').addEventListener('click', function () {
        $('#workgroupsVibeDownload').find('option').each(function () {
            if (!$(this).hasClass('hide-option')) { // Check if the option is not hidden
                $(this).prop('selected', true);
            }
        });
        $('#workgroupsVibeDownload').selectpicker('refresh');
    });


    // Corrected the function name from 'selectpickr' to 'selectpicker'
    $('#siteVibeDownload').selectpicker({
        noneSelectedText: 'Select Options',
        selectedTextFormat: 'count > 3',
        actionsBox: true
    });

    // Fetch and parse the CSV file
    fetch('data/SpaceOwnership.csv')
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function (results) {
                    console.log(results.data); // Log the parsed data
                    populateSkillOwners(results.data);
                    createCsvTable(results.data);
                }
            });
        })
        .catch(error => console.error('Error fetching CSV:', error));

    // Rest of your code...
});


function populateSkillOwners(data) {
    // Get the table body where rows will be inserted
    const tableBody = document.querySelector("#csvOwnerTable tbody");

    // Clear existing rows in the table body
    tableBody.innerHTML = '';

    // Iterate over each item in the CSV data
    data.forEach(item => {
        // Create a new row element
        const tr = document.createElement("tr");

        // Set the HTML content of the row
        tr.innerHTML = `
            <td>${item['WG']}</td>
            <td>${item['OU']}</td>
            <td>${item['Skill Owner: CPT']}</td>
            <td>${item['Skill Owner: SAVCS']}</td>
        `;

        // Append the new row to the table body
        tableBody.appendChild(tr);
    });
}
document.getElementById('customSearch').addEventListener('input', function () {
    var searchTerms = this.value.split(',').map(item => item.trim());
    var options = $('#workgroupsVibeDownload').find('option');

    options.each(function () {
        var optionText = $(this).text();
        var match = searchTerms.some(term => optionText === term) || searchTerms[0] === '';
        $(this).toggleClass('hide-option', !match);
    });

    $('#workgroupsVibeDownload').selectpicker('refresh');
});



function copyColumnData(columnIndex) {
    console.log("Copy function called for column: " + columnIndex); // Add this line
    const table = document.getElementById("csvOwnerTable");
    const rows = table.getElementsByTagName("tr");
    let dataToCopy = [];

    for (let i = 1; i < rows.length; i++) {
        if (rows[i].style.display !== "none") { // Check if the row is visible
            let cell = rows[i].getElementsByTagName("td")[columnIndex];
            if (cell) {
                dataToCopy.push(cell.textContent.trim());
            }
        }
    }

    if (dataToCopy.length > 0) {
        // Join the array with commas instead of newline
        copyTextToClipboard(dataToCopy.join(", "));
        alert("Copied to clipboard!");
    } else {
        alert("No data to copy!");
    }
    console.log("Data to be copied: ", dataToCopy.join(", ")); // Log the data to be copied
}

function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        // Navigator clipboard API method
        navigator.clipboard.writeText(text)
            .then(function () {
                console.log('Text successfully copied to clipboard');
                alert('Copied to clipboard!');
            })
            .catch(function (err) {
                console.error('Could not copy text to clipboard: ', err);
                alert('Failed to copy text to clipboard');
            });
    } else {
        // Fallback method for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            const msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
            alert('Copied to clipboard!');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            alert('Failed to copy text to clipboard');
        }
        document.body.removeChild(textArea);
    }
}


function filterTable() {
    const wgInput = document.getElementById('filterWG').value.toUpperCase();
    const ouInput = document.getElementById('filterOU').value.toUpperCase();
    const cptInput = document.getElementById('filterCPT').value.toUpperCase();
    const savcsInput = document.getElementById('filterSAVCS').value.toUpperCase();
    const table = document.getElementById("csvOwnerTable");
    const tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        let wgTd = tr[i].getElementsByTagName("td")[0];
        let ouTd = tr[i].getElementsByTagName("td")[1];
        let cptTd = tr[i].getElementsByTagName("td")[2];
        let savcsTd = tr[i].getElementsByTagName("td")[3];

        if (wgTd && ouTd && cptTd && savcsTd) {
            let wgText = wgTd.textContent || wgTd.innerText;
            let ouText = ouTd.textContent || ouTd.innerText;
            let cptText = cptTd.textContent || cptTd.innerText;
            let savcsText = savcsTd.textContent || savcsTd.innerText;

            if (wgText.toUpperCase().indexOf(wgInput) > -1 &&
                ouText.toUpperCase().indexOf(ouInput) > -1 &&
                cptText.toUpperCase().indexOf(cptInput) > -1 &&
                savcsText.toUpperCase().indexOf(savcsInput) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

document.getElementById('filterWG').addEventListener('keyup', filterTable);
document.getElementById('filterOU').addEventListener('keyup', filterTable);
document.getElementById('filterCPT').addEventListener('keyup', filterTable);
document.getElementById('filterSAVCS').addEventListener('keyup', filterTable);

function updateWorkgroupsSelect() {
    console.log("Attempting to fetch workgroup list from CSV file...");

    // Fetch the CSV file from the data folder
    fetch('data/workgroupList.csv') // Ensure this path is correct
        .then(response => {
            console.log("CSV file fetched successfully");
            return response.text();
        })
        .then(csvText => {
            console.log("CSV file content:", csvText); // Logs the raw CSV text

            // Parse the CSV text
            Papa.parse(csvText, {
                header: true, // Assumes the first row of the CSV is a header
                complete: function (results) {
                    console.log("Parsed CSV data:", results.data); // Logs parsed data

                    // Use the correct key 'Workgroup' to extract workgroup names
                    const workgroups = results.data.map(row => row.Workgroup).filter(Boolean);
                    console.log("Workgroups extracted from CSV:", workgroups); // Logs extracted workgroups

                    populateSelectWithWorkgroups(workgroups);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching and parsing CSV:', error); // Logs any fetching/parsing errors
        });
}

function populateSelectWithWorkgroups(workgroups) {
    const workgroupsSelect = $('#workgroupsVibeDownload');
    workgroupsSelect.empty(); // Clear existing options

    if (workgroups.length === 0) {
        console.log("No workgroups found to populate in the select element.");
    }

    workgroups.forEach(wg => {
        console.log("Adding workgroup to select element:", wg); // Logs each workgroup being added
        workgroupsSelect.append(new Option(wg, wg));
    });

    workgroupsSelect.selectpicker('refresh'); // Refresh the selectpicker
    console.log("Select element refreshed with new options.");
}

// Call this function to load and initialize the workgroups select options
updateWorkgroupsSelect();
$(document).ready(function () {
    updateWorkgroupsSelect();
});


// Initialize Switchery
var elem = document.querySelector('.loadSchedules');
var init = new Switchery(elem, { color: '#343a40', size: 'small' });

document.addEventListener('DOMContentLoaded', function () {
    const csaLoginGroupNPT = document.getElementById('csaLoginGroupNPT');
    const scheduleFormCsaLogins = document.getElementById('scheduleFormCsaLogins');

    if (csaLoginGroupNPT) {
        csaLoginGroupNPT.addEventListener('input', async () => {
            console.log('Processing input for csaLoginGroupNPT.');
            const inputLogins = csaLoginGroupNPT.value.split(/[ ,\t\n]+/).map(login => login.trim());
            const data = await readFromIndexedDB('schedules');

            const { managers, workgroups, sites } = getUniqueValuesForSelectedLogins(data, inputLogins);

            populateSelect('managerSelect', managers);
            populateSelect('workgroupSelect', workgroups);
            populateSelect('siteSelect', sites);
        });
    }

    if (scheduleFormCsaLogins) {
        scheduleFormCsaLogins.addEventListener('input', async function () {
            console.log('CSA Login input accessed.');
            const logins = this.value.split(/[\s,]+/).map(login => login.trim()); // Splits by space, comma, or tab
            const data = await readFromIndexedDB('schedules', logins);

            const uniqueSites = new Set();
            const uniqueWeeks = new Set();

            data.forEach(item => {
                if (logins.includes(item['CSA Login'])) {
                    uniqueSites.add(item.Site);
                    uniqueWeeks.add(item.WeekNumber.toString());
                }
            });

            populateSelectElement('scheduleFormSiteSelection', uniqueSites);
            populateSelectElement('scheduleFormWeekSelector', uniqueWeeks);
        });
    }
});

function readFromIndexedDB(storeName, filterLogins = []) {
    return new Promise((resolve, reject) => {
        // Open a connection to the IndexedDB database
        const request = indexedDB.open("VibeScheduleDB", 2); // Make sure the DB name is correct

        // Handle any errors when opening the database
        request.onerror = event => {
            console.error('Database error:', event.target.errorCode);
            reject('Database error:', event.target.errorCode);
        };

        // On successful database opening
        request.onsuccess = event => {
            const db = event.target.result;

            // Open a transaction to read data from the specified store
            const transaction = db.transaction(storeName, "readonly");
            const store = transaction.objectStore(storeName);

            // Request to get all records from the store
            const allRecordsRequest = store.getAll();

            // Handle any errors when reading records
            allRecordsRequest.onerror = event => {
                console.error('Error reading records:', event.target.errorCode);
                reject('Error reading records:', event.target.errorCode);
            };

            // On successful retrieval of records
            allRecordsRequest.onsuccess = event => {
                let records = event.target.result;

                // If filterLogins array is provided, filter the records
                if (filterLogins.length > 0) {
                    records = records.filter(item => filterLogins.includes(item['CSA Login']));
                }
                resolve(records);
            };
        };
    });
}

function getUniqueValuesForSelectedLogins(data, selectedLogins) {
    let uniqueManagers = new Set();
    let uniqueWorkgroups = new Set();
    let uniqueSites = new Set();

    data.forEach(item => {
        if (selectedLogins.includes(item['CSA Login'])) {
            uniqueManagers.add(item['Manager Login']);
            uniqueWorkgroups.add(item['Workgroup']);
            uniqueSites.add(item['Site']);
        }
    });

    return {
        managers: Array.from(uniqueManagers),
        workgroups: Array.from(uniqueWorkgroups),
        sites: Array.from(uniqueSites)
    };
}

function populateSelect(elementId, items) {
    const selectElement = document.getElementById(elementId);
    selectElement.innerHTML = ''; // Clear existing options
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        selectElement.appendChild(option);
    });
}

// Use selectpicker methods to update and refresh the dropdowns
function populateSelectElement(elementId, values) {
    var select = $('#' + elementId);
    select.empty(); // Clear existing options
    values.forEach(value => {
        select.append(new Option(value, value));
    });
    select.selectpicker('refresh'); // Refresh the selectpicker to show new options
}

// Initialize Flatpickr for the input element with ID 'scheduleFormDaySelector'
flatpickr("#scheduleFormDaySelector", {
    mode: 'multiple',
    enableTime: false, // Set to true if you want to include time selection as well
    dateFormat: "Y-m-d", // Set the desired date format
    // Add any other options you need here
});

function clearTableContent() {
    // Get the table element by its ID
    var table = document.getElementById("shift-table");

    // Find the tbody within the table
    var tbody = table.getElementsByTagName("tbody")[0];

    // Clear the contents of the tbody
    tbody.innerHTML = "";
}