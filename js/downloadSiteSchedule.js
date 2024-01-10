function downloadTableDiv() {
    const divContainer = document.getElementById('data-table-container');
    const divHtml = divContainer.innerHTML;

    // Include CDN links for Bootstrap and Bootstrap-Select
    const bootstrapCdns = `
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.13.1/css/bootstrap-select.min.css">
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.13.1/js/bootstrap-select.min.js"></script>
  `;

    const cssContents = `/* Main.css */

    /* Base styles for the navbar */
    .navbar {
      background-color: #424242; /* Material dark grey for background */
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* Material shadow for depth */
    }
    
    .navbar-brand img {
      filter: invert(100%);
    }
    
    .navbar-brand,
    .navbar-nav .nav-link {
      color: #ffffff; /* Material text/icons color on dark backgrounds */
    }
    
    .nav-item .material-icons {
      font-size: 24px; /* Standard icon size */
      vertical-align: middle;
      padding: 5px;
    }
    
    .navbar-nav .nav-link {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem; /* Adjust padding as needed */
      transition: background-color 0.3s; /* Smooth transition for hover effect */
    }
    
    .navbar-nav .nav-link:hover,
    .navbar-nav .nav-link:focus {
      background-color: #616161; /* Material lighter grey for hover/focus */
      border-radius: 4px; /* Optional: rounded corners for the hover/focus effect */
    }
    
    /* Active state for nav-link */
    .navbar-nav .nav-link.active {
      font-weight: bold;
      color: #e0e0e0; /* Material lighter grey for active links */
    }
    
    /* Styles for navbar toggler icon */
    .navbar-toggler {
      border-color: #bdbdbd; /* Greyscale border color */
    }
    
    .navbar-toggler-icon {
      background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255, 255, 255, 0.5)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
    }
    
    /* Responsive behavior */
    @media (max-width: 991px) {
      .navbar-nav .nav-link {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
      }
    }
    
    /* Additional styles can be added for hover effects, active link highlighting, etc. */
    
    /* Main Content Card */
    .card {
      background-color: #ffffff; /* Material cards are typically white or a light grey */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Material Design Shadow */
      border: none; /* Optional: removes the border for a cleaner look */
      margin-top: 2rem; /* Adds some space at the top of the card */
    }
    
    .card-body {
      padding: 2rem; /* Padding inside the card */
    }
    
    #includeme {
      float: none; /* Removes float, if not necessary */
      text-align: center; /* Centers the text if desired */
    }
    
    .card-title {
      color: #424242; /* A darker grey for the title to stand out */
      font-size: 2rem; /* Increases the size of the title */
      font-weight: 400; /* Material Design uses specific font weights, adjust as needed */
      margin-bottom: 1rem; /* Space after the title */
    }
    
    .card-text {
      color: #616161; /* A lighter grey for the body text */
      font-size: 1rem; /* Standard font size for body text */
      margin-bottom: 1rem; /* Space after each paragraph */
    }
    
    /* Adjustments for smaller screens */
    @media (max-width: 768px) {
      .card-body {
        padding: 1rem; /* Smaller padding on smaller screens */
      }
    }
    
    .container-fluid {
      text-align: center;
    }
    
    .custom-file {
      margin-bottom: 15px;
    }
    
    .modal-dialog {
      max-width: 80%;
      text-align: center;
    }
    #scheduleReportDatatable {
      width: max-content  ;
    
      .modal-progress-data-loading {
        display: none; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: 1; /* Sit on top */
        left: 0;
        top: 0;
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
      }
      
      .modal-content-modal-progress-data-loading {
        background-color: #fefefe;
        margin: 15% auto; /* 15% from the top and centered */
        padding: 20px;
        border: 1px solid #888;
        width: 80%; /* Could be more or less, depending on screen size */
        text-align: center;
      }
      
      progress {
        width: 100%; /* Full width */
        height: 20px; /* Specified height */
      }
      
    }
    .dashboard-table {
        text-align: center;
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 20px 0;
      font-size: 0.9em;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
      border-radius: 10px;
      transition: all 0.3s ease-in-out;
    }
    
    .dashboard-table thead tr:first-child th:first-child {
      border-top-left-radius: 10px;
    }
    
    .dashboard-table thead tr:first-child th:last-child {
      border-top-right-radius: 10px;
    }
    
    table.dataTable thead th, table.dataTable thead td, table.dataTable tfoot th, table.dataTable tfoot td {
      text-align: center;
    }
    /* Enhanced table hover effect */
    .dashboard-table:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
      transition: box-shadow 0.3s ease-in-out;
    }
    .dashboard-table thead tr {
      background-color: #343a40 !important;
      color: white;
      text-align: center;
      border-top-right-radius: 15px !important;
    }
    .btn-primary {
      color: #fff;
      background-color: #343a40;
      border-color: #343a40;
    }
    .btn-primary:hover {
      color: #fff;
      background-color: #0b0c0e;
      border-color: #0b0c0e;
    }
    .dashboard-table th{
      padding: 6px 7.5px;
    }
    
    .dashboard-table td {
      padding: 5px;
    }
    
    .dashboard-table tbody tr {
      border-bottom: 1px solid #dddddd;
    }
    
    .dashboard-table tbody tr:nth-of-type(even) {
      background-color: #f3f3f3;
    }
    
    .dashboard-table tbody tr:last-of-type {
      border-bottom: 2px solid #4caf50;
    }
    
    .dashboard-table tbody tr:hover {
      background-color: #f1f1f1;
    }
    
    .dashboard-table tbody td.active-cell {
      font-weight: bold;
      color: #4caf50;
    }
    #scheduleReportDatatable{
      margin: 0 auto !important;
    }
    
    .dropdown-menu {
        position: absolute;
        z-index: 1000; /* Adjust the z-index as needed */
    }
    
    .parent-of-dropdown {
        overflow: visible;
    }
    
    .cell-green {
      background-color: lightgreen !important;
      color: darkgreen !important;
    }
    
    .cell-yellow {
      background-color: lightyellow !important;
      color: lightyellow !important;
    }
    
    .tab-content > .tab-pane:not(.active) {
      display: none;
    }
    
    .dataTables_info {
    position: relative !important;
    }
    
    .dataTables_wrapper .dataTables_length, .dataTables_wrapper .dataTables_filter, .dataTables_wrapper .dataTables_info, .dataTables_wrapper .dataTables_processing, .dataTables_wrapper .dataTables_paginate {
        display: none;
    }
    
    .navbar-expand-lg>.container, .navbar-expand-lg>.container-fluid {
      max-width: 100%;
    }
    
    ::-webkit-scrollbar {
      width: 6px;
    }
    
    ::-webkit-scrollbar-track,
    ::-webkit-scrollbar-thumb {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    }`;

    // Filter section and filter functionality script
    const filterSectionHtml = `
  <div class="container-fluid" style="padding: 5%;" >
        <h3 class="title">Site Schedules WK01</h3>
        <div class="filter-div col-md-12">
            <label for="csaLoginFilter" class="form-label">CSA Logins:</label>
            <textarea class="form-control" id="csaLoginFilter" rows="4"></textarea>
        </div>
        <br>
        <div class="row">
            <div class="form-group col-md-3">
                <label for="workgroupFilter" class="form-label">Workgroup:</label>
                <select id="workgroupFilter" class="form-select form-select-sm" multiple aria-label="Workgroup filter"
                    data-live-search="true" data-actions-box="true" data-selected-text-format="count">
                    <!-- Options will be added dynamically -->
                </select>
            </div>

            <div class="form-group col-md-3">
                <label for="siteFilter" class="form-label">Site:</label>
                <select id="siteFilter" class="form-select form-select-sm" multiple aria-label="Site filter"
                    data-live-search="true" data-actions-box="true" data-selected-text-format="count">
                    <!-- Options will be added dynamically -->
                </select>
            </div>

            <div class="form-group col-md-3">
                <label for="managerFilter" class="form-label">Manager:</label>
                <select id="managerFilter" class="form-select form-select-sm" multiple aria-label="Manager filter"
                    data-live-search="true" data-actions-box="true" data-selected-text-format="count">
                    <!-- Options will be added dynamically -->
                </select>
            </div>

            <div class="form-group col-md-3">
                <label for="reportingManagerFilter" class="form-label">Reporting Manager:</label>
                <select id="reportingManagerFilter" class="form-select form-select-sm" multiple
                    aria-label="Reporting Manager filter" data-live-search="true" data-actions-box="true"
                    data-selected-text-format="count">
                    <!-- Options will be added dynamically -->
                </select>
            </div>
        </div>

    </div>
`;

const filterScript = `
  <script>
    document.addEventListener("DOMContentLoaded", function () {
        function populateFilter(filterId, columnIndex) {
            const table = document.getElementById('scheduleReportDatatable');
            const uniqueSet = new Set();
            const filterSelect = document.getElementById(filterId);

            Array.from(table.rows).forEach(row => {
                if (row.rowIndex === 0) return;
                const cell = row.cells[columnIndex];
                uniqueSet.add(cell.textContent.trim());
            });

            uniqueSet.forEach(value => {
                const option = document.createElement('option');
                option.value = option.textContent = value;
                filterSelect.appendChild(option);
            });

            $('#' + filterId).selectpicker();
        }

        // Populate filters
        populateFilter('workgroupFilter', 1);
        populateFilter('siteFilter', 3);
        populateFilter('managerFilter', 2);
        populateFilter('reportingManagerFilter', 17);

        // Initialize Bootstrap Select for the given filter IDs
        $('#workgroupFilter').selectpicker();
        $('#siteFilter').selectpicker();
        $('#managerFilter').selectpicker();
        $('#reportingManagerFilter').selectpicker();

        // General function to filter the table by a specific column
        function filterTableByColumn(filterId, columnIndex) {
            const filterSelect = document.getElementById(filterId);
            const selectedValues = Array.from(filterSelect.selectedOptions).map(option => option.value.toLowerCase());
            const table = document.getElementById('scheduleReportDatatable');

            Array.from(table.rows).forEach(row => {
                if (row.rowIndex === 0) return;
                const cell = row.cells[columnIndex];
                const cellValue = cell.textContent.toLowerCase();
                row.style.display = selectedValues.length === 0 || selectedValues.includes(cellValue) ? '' : 'none';
            });
        }

        // Function to filter the table by CSA Logins
        function filterByCsaLogins() {
            const loginInput = document.getElementById('csaLoginFilter').value;
            const logins = loginInput.split(',').map(login => login.trim().toLowerCase());
            const table = document.getElementById('scheduleReportDatatable');

            Array.from(table.rows).forEach(row => {
                if (row.rowIndex === 0) return;
                const loginCell = row.cells[0];
                const cellLogin = loginCell.textContent.toLowerCase();
                row.style.display = logins.length === 0 || logins.some(login => cellLogin.includes(login)) ? '' : 'none';
            });
        }        

        // Attach event listeners to filters
        document.getElementById('csaLoginFilter').addEventListener('input', filterByCsaLogins);
        document.getElementById('workgroupFilter').addEventListener('change', () => filterTableByColumn('workgroupFilter', 1));
        document.getElementById('siteFilter').addEventListener('change', () => filterTableByColumn('siteFilter', 3));
        document.getElementById('managerFilter').addEventListener('change', () => filterTableByColumn('managerFilter', 2));
        document.getElementById('reportingManagerFilter').addEventListener('change', () => filterTableByColumn('reportingManagerFilter', 17));

        // Call the filter functions initially to apply any default filters
        filterByCsaLogins();
    });
  </script>
`;


    // Construct the complete HTML
    const completeHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Exported Table</title>
            ${bootstrapCdns}
            <style>${cssContents}</style>
        </head>
        <body>
            ${filterSectionHtml}
            <div id="data-table-container">${divHtml}</div>
            ${filterScript}
        </body>
        </html>`;

    // Blob and download link creation
    const blob = new Blob([completeHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "filtered_table.html";
    downloadLink.click();

    URL.revokeObjectURL(url);
}