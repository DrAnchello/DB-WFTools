console.log('report.js');

// Define csaLogins and table variables here

let table;
let globalData;
// Initialize csaLogins as an empty array if it's not already an array
let csaLogins = [];

document.addEventListener("DOMContentLoaded", () => {
    // Function to initialize or update the DataTable
    function initializeOrUpdateDataTable(dataArray) {
        if ($.fn.dataTable.isDataTable("#scheduleReportDatatable")) {
            table.clear().rows.add(dataArray).draw();
        } else {
            table = initDataTable(dataArray);
        }
    }

    // Function to update the table filter based on selected values
    function updateTableFilter() {
        if (table) {
            table.draw();
        }
    }

    // Add event listener for the filter select boxes
    $("#scheduleReportDatatable select").on("change", updateTableFilter);

    // Add event listener for the textarea input
    $("#csaLoginFilter").on("input", function () {
        // Ensure csaLogins is reset to an empty array if there's no input
        csaLogins = this.value.trim() ? this.value.split(/[\s,]+/).map(login => login.trim().toLowerCase()) : [];
        if (globalData) {
            populateFilterOptions(globalData); // Make sure this only updates necessary selects
        }
        updateTableFilter();
    });    

    // Custom search logic for DataTables
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        // Safely retrieve values, defaulting to arrays if undefined
        const selectedWeekNumbers = $('#weekSelector').val() || [];
        // Assuming 'siteFilter' is a multi-select, if not, you should not default to an array
        const selectedSites = $('#siteFilter').val() || [];
        const selectedWorkgroups = ($('#workgroupFilter').val() || []).map(val => val.toLowerCase());
        const selectedManagers = ($('#managerFilter').val() || []).map(val => val.toLowerCase());
    
        // Perform checks only if the variables are arrays and have length
        const weekMatch = selectedWeekNumbers.length === 0 || selectedWeekNumbers.includes(data[13]);
        const siteMatch = selectedSites.length === 0 || selectedSites.some(site => site.toLowerCase() === data[3].toLowerCase());
        const workgroupMatch = selectedWorkgroups.length === 0 || selectedWorkgroups.includes(data[1].toLowerCase());
        const managerMatch = selectedManagers.length === 0 || selectedManagers.includes(data[2].toLowerCase());
    
        // csaLoginMatch will be true if csaLogins is empty or if any login matches
        // Ensure csaLogins is defined and an array at the point where it's used
        const csaLoginMatch = !csaLogins || csaLogins.length === 0 || csaLogins.some(login => data[0].toLowerCase().includes(login));
    
        // Return true if all conditions are met
        return siteMatch && weekMatch && workgroupMatch && managerMatch && csaLoginMatch;
    });
    
    // After setting up or changing filters, redraw the table to apply the filter
    if (table) {
        table.draw();
    }    

    // Open the IndexedDB database
    const request = indexedDB.open("VibeScheduleDB");

    request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["schedules"], "readonly");
        const objectStore = transaction.objectStore("schedules");
        const getAllDataRequest = objectStore.getAll();
    
        getAllDataRequest.onsuccess = (event) => {
            globalData = event.target.result;
            const dataTableArray = processData(globalData);
    
            initializeOrUpdateDataTable(dataTableArray);
            populateFilterOptions(globalData);
            populateWeekSelection(globalData); // Call this with the globalData only once here
        };
    
        transaction.oncomplete = () => {
            db.close();
        };
        console.log("Data retrieved from IndexedDB");
    };

    function getFilteredDataByLogins(data, logins) {
        if (!logins || logins.length === 0) return data;
        return data.filter(item => {
            // Check if the item has a non-null "CSA Login" property
            return item["CSA Login"] && logins.includes(item["CSA Login"].toLowerCase());
        });
    }

    function populateFilterOptions(data) {
        // This now includes the week selector as well
        const uniqueSites = [...new Set(data.map(item => item.Site))];
        const uniqueWorkgroups = [...new Set(data.map(item => item["Workgroup"]))];
        const uniqueManagers = [...new Set(data.map(item => item["Manager Login"]))];
        const uniqueWeekNumbers = [...new Set(data.map(item => item["Week Number"] || item["WeekNumber"]))];
    
        clearSelectBox("siteFilter");
        clearSelectBox("workgroupFilter");
        clearSelectBox("managerFilter");
        clearSelectBox("weekSelector");
    
        populateSelectBox(uniqueSites, "siteFilter", true);
        populateSelectBox(uniqueWorkgroups, "workgroupFilter", true);
        populateSelectBox(uniqueManagers, "managerFilter", true);
        populateSelectBox(uniqueWeekNumbers, "weekSelector", true); // Now repopulating the week selector
    
        $('.form-select').selectpicker('refresh');
    }     

    function clearSelectBox(selectId) {
        const select = document.getElementById(selectId);
        // Bootstrap-select requires a different approach to clear options
        $(select).empty().selectpicker('refresh');
    }

    function populateSelectBox(options, selectId, includeAllOption = false) {
        const select = document.getElementById(selectId);
        $(select).empty(); // Clear all existing options
    
        if (includeAllOption) {
            $(select).append(new Option('All', '')); // The value '' will signify no filter
        }
    
        options.forEach(option => {
            const optionElement = new Option(option, option);
            optionElement.selected = true; // Set each option as selected
            $(select).append(optionElement);
        });
    
        $(select).selectpicker('refresh'); // Refresh the select picker after appending options
    }    

    function resetFilter(selectId) {
        $('#' + selectId).val('').selectpicker('refresh');
        // Optionally, redraw the table if needed
        if (table) {
            table.draw();
        }
    }    

    // Initial bootstrap-select initialization and event listener setup
    $(document).ready(function () {
        $('.form-select').selectpicker(); // Initialize bootstrap-select on all .form-select elements

        $("#weekSelector, #siteFilter, #workgroupFilter, #managerFilter").on('change', function () {
            if (table) {
                console.log('Redrawing table for filters');
                table.draw();
            }
        });
    });


    function clearSelectBox(selectId) {
        const select = document.getElementById(selectId);
        select.innerHTML = '';
    }

    // Function to populate a select box with options
    function populateSelectBox(options, selectId) {
        const select = document.getElementById(selectId);

        options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.text = option;
            select.appendChild(optionElement);
        });
    }

    // Function to populate week selection input from data
    function populateWeekSelection(data) {
        const uniqueWeekNumbers = [...new Set(data.map(item => item["Week Number"] || item["WeekNumber"]))];
        uniqueWeekNumbers.sort((a, b) => a - b);
    
        const lowestWeekNumber = uniqueWeekNumbers[0];
        const weekSelector = $('#weekSelector');
    
        // Clear existing options
        weekSelector.empty();
    
        // Append new options and set the lowest week number as selected by default
        uniqueWeekNumbers.forEach(week => {
            const isSelected = week === lowestWeekNumber;
            weekSelector.append(new Option(week, week, isSelected, isSelected));
        });
    
        // Refresh the select picker to apply changes
        weekSelector.selectpicker('refresh');
    
        // Trigger table update to reflect the default selected week
        if (table) {
            table.draw();
        }
    }
    
    // Add event listener for the button if it exists
    const viewButton = document.getElementById("viewSiteSchedules");
    if (viewButton) {
        viewButton.addEventListener("click", () => {
            generateCombinedData()
                .then((combinedData) => {
                    // Initialize or update the DataTable with the combined data
                    initializeOrUpdateDataTable(combinedData);
                })
                .catch((error) => {
                    console.error("Error during data generation:", error);
                });
        });
    } else {
        console.error('Button with ID "viewSiteSchedules" not found');
    }
    // Function to update the table filter based on selected values
    function updateTableFilter() {
        if (table) {
            table.draw();
        }
    }
});

function formatTimeManual(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Manually formatting hours and minutes
    let hoursString = (hours < 10) ? '0' + hours : '' + hours;
    let minutesString = (minutes < 10) ? '0' + minutes : '' + minutes;

    return hoursString + ':' + minutesString;
}

// This function processes the IndexedDB data into the format DataTables expects
function processData(data) {
    const consolidatedData = new Map();

    data.forEach((item) => {
        if (item["Type"] === "Work") {
            const startDate = new Date(item["startDateTime"]);
            const endDate = new Date(item["endDateTime"]);
            const shiftDuration = (endDate - startDate) / (1000 * 60 * 60); // Duration in hours
            const dayOfWeek = startDate.getDay(); // Get day of week (0 for Sunday)

            // Skip the record if it starts on Sunday at midnight and is shorter than 7 hours
            if (dayOfWeek === 0 && isMidnight(startDate)) {
                return; // Continue to the next iteration in forEach
            }

            // Using the manually formatting function
            const startTime = formatTimeManual(startDate);
            const endTime = formatTimeManual(endDate);

            const weekNumber = item["Week Number"] || item["WeekNumber"];
            const key = `${item["CSA Login"]}-${item["Workgroup"]}-${startTime}-${weekNumber}`;

            if (!consolidatedData.has(key)) {
                consolidatedData.set(key, {
                    "CSA Login": item["CSA Login"],
                    Workgroup: item["Workgroup"],
                    "Manager Login": item["Manager Login"],
                    Site: item["Site"],
                    Start: startTime,
                    End: endTime,
                    Week: weekNumber,
                    Days: [0, 0, 0, 0, 0, 0, 0], // Initialize Days array with zeros
                });
            }

            // Set 1 for the corresponding day of week
            consolidatedData.get(key)["Days"][dayOfWeek] = 1;
        }
    });

    return Array.from(consolidatedData.values());
}

// Helper function to check if the time is exactly midnight
function isMidnight(date) {
    return date.getHours() === 0 && date.getMinutes() === 0;
}

// This function initializes the DataTable with the processed data
function initDataTable(dataArray) {
    return $("#scheduleReportDatatable").DataTable({
        data: dataArray,
        columns: [
            // Columns configuration
            { title: "CSA Login", data: "CSA Login" },
            { title: "Workgroup", data: "Workgroup" },
            { title: "Manager Login", data: "Manager Login" },
            { title: "Site", data: "Site" },
            { title: "Start", data: "Start" },
            { title: "End", data: "End" },
            { title: "Sun", data: "Days.0" },
            { title: "Mon", data: "Days.1" },
            { title: "Tue", data: "Days.2" },
            { title: "Wed", data: "Days.3" },
            { title: "Thu", data: "Days.4" },
            { title: "Fri", data: "Days.5" },
            { title: "Sat", data: "Days.6" },
            { title: "Week", data: "Week" }
        ],
        paging: false,
        searching: true,
        ordering: true,
        orderCellsTop: true,
        dom: 'lBfrtip',
        buttons: ['csv', 'excel', 'pdf'],
        columnDefs: [
            {
                targets: 'no-sort',
                orderable: false
            }
        ],
        createdRow: function (row, data, dataIndex) {
            // Apply conditional styling to day columns in the row
            for (let i = 6; i <= 12; i++) {
                // Day columns indexes
                if (data.Days[i - 6] === 1) {
                    $('td', row).eq(i).addClass('cell-green');
                } else {
                    $('td', row).eq(i).addClass('cell-yellow');
                }
            }
        },
        footerCallback: function (row, data, start, end, display) {
            var api = this.api();

            // Count unique logins
            var uniqueLogins = new Set(api.column(0, { page: 'current' }).data().toArray()).size;
            $(api.column(0).footer()).html('Logins : ' + uniqueLogins);

            // Loop through each day column, which are at indexes 6 to 12
            for (let dayIndex = 6; dayIndex <= 12; dayIndex++) {
                // Calculate the total for each day column
                var dayTotal = api
                    .column(dayIndex, { page: 'current' })
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);

                // Update the footer cell with the total
                $(api.column(dayIndex).footer()).html(dayTotal);
            }
        },
        stateSave: false,
    });
}

// Download Schedule Report Table

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('downloadScheduleBtn').addEventListener('click', function() {
        var table = document.getElementById('scheduleReportDatatable');
        var wb = XLSX.utils.table_to_book(table, {sheet: "Schedule Report"});
        XLSX.writeFile(wb, 'ScheduleReport.xlsx');
    });
});
