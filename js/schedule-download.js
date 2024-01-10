function downloadSchedule() {
  const rows = document.querySelectorAll("#shift-table tbody tr");
  let csvContent = "data:text/csv;charset=utf-8,";

  // Add the header row to the CSV file
  csvContent += "login,emp_id,team,title,workgroup,workdays,start,end,sun,mon,tue,wed,thu,fri,sat,fte,name,lunch_start,lunch_end,brk1_start,brk1_end,brk2_start,brk2_end,brk3_start,brk3_end,lunch2_start,lunch2_end,tm_day,tm_start,tm_end\n";

  // Filter out empty rows from the collection
  const nonEmptyRows = Array.from(rows).filter((row) => {
    const rowData = Array.from(row.cells).map((cell) => cell.textContent.trim());
    return rowData.some((data) => data !== "");
  });

  // Add the data rows to the CSV file
  nonEmptyRows.forEach((row, index) => {
    let rowData = "";
    rowData += row.cells[0].textContent + ","; // Login
    rowData += ","; // Emp ID
    rowData += ","; // Team
    rowData += ","; // Title
    rowData += row.cells[1].textContent + ","; // Workgroup
    rowData += ","; // Workdays
    rowData += row.cells[2].textContent + ","; // Shift Start Time
    rowData += row.cells[3].textContent + ","; // Shift End Time
    rowData += row.cells[4].textContent + ","; // Sun
    rowData += row.cells[5].textContent + ","; // Mon
    rowData += row.cells[6].textContent + ","; // Tue
    rowData += row.cells[7].textContent + ","; // Wed
    rowData += row.cells[8].textContent + ","; // Thu
    rowData += row.cells[9].textContent + ","; // Fri
    rowData += row.cells[10].textContent + ","; // Sat
    rowData += "1,"; // FTE
    rowData += ","; // Name
    rowData += row.cells[11].textContent + ","; // Lunch Start
    rowData += row.cells[12].textContent + ","; // Lunch End
    rowData += row.cells[13].textContent + ","; // Break 1 Start
    rowData += row.cells[14].textContent + ","; // Break 1 End
    rowData += row.cells[15].textContent + ","; // Break 2 Start
    rowData += row.cells[16].textContent + ","; // Break 2 End
    rowData += row.cells[17].textContent + ","; // Break 3 Start
    rowData += row.cells[18].textContent + ","; // Break 3 End
    rowData += ","; // Lunch 2 Start
    rowData += ","; // Lunch 2 End
    rowData += ","; // TM Day
    rowData += ","; // TM Start
    rowData += ","; // TM End

    csvContent += rowData;

    // Check if this is not the last row, then add a new line character
    if (index < nonEmptyRows.length - 1) {
      csvContent += "\r\n";
    }
  });

  // Get the "Site" value from the "weekselector" input
  const siteInput = document.getElementById("weekselector");

  // Get current date and format it
  const currentDate = new Date();
  const formattedDate = (currentDate.getMonth() + 1).toString().padStart(2, '0') + "-" +
    currentDate.getDate().toString().padStart(2, '0') + "-" +
    currentDate.getFullYear();

  // Create the filename with the "Site" value
  const filename = `Generated_Schedule_${formattedDate}.csv`;

  // Create a link and click it to download the CSV file
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link); // Required for FF
  link.click();
}