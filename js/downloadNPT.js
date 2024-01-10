// Helper function to get ISO week number
function getISOWeekNumber(d) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    const week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}
// Helper function to format the date from YYYY-MM-DD to MM/DD/YYYY
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    // Ensure month and day are two digits
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');
    return `${formattedMonth}/${formattedDay}/${year}`;
}

// Function to download NPT table content as CSV, grouped by week
function downloadNPT(event) {
    event.preventDefault();
    const table = document.getElementById('generatedSlotsTable').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');
    const weekData = {};

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cols = row.getElementsByTagName('td');

        const login = cols[0].textContent.trim();
        const workgroup = cols[1].textContent.trim();
        const slotType = cols[2].textContent.trim();
        let slotDate = cols[3].textContent.trim();
        let slotStart = cols[4].textContent.trim();
        let slotEnd = cols[5].textContent.trim();

        // Format the slotDate to MM/DD/YYYY
        slotDate = formatDate(slotDate);
        slotStart = `${slotDate} ${slotStart}`;
        slotEnd = `${slotDate} ${slotEnd}`;

        const comment = cols[7].textContent.trim();

        // Calculate the week number for the slotDate
        const weekNumber = 'WK' + getISOWeekNumber(new Date(slotDate.replace(/-/g, "/")));
        weekData[weekNumber] = weekData[weekNumber] || [];

        const rowData = [
            login,
            "amazon",
            workgroup,
            slotType,
            slotStart,
            slotEnd,
            "n",
            comment,
            "Approved"
        ].join(',');

        weekData[weekNumber].push(rowData);
    }

    // Create and download a CSV file for each week
    Object.keys(weekData).forEach(weekNumber => {
        const csvContent = "login,owner_name/company_name,workgroup,shift_interval,start_date_time,end_date_time,is_delete,comment,interval_status\n" + weekData[weekNumber].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `NPT_data_${weekNumber}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
}

// Event listener for the "Download" button
document.getElementById('downloadNPTButton').addEventListener('click', downloadNPT);