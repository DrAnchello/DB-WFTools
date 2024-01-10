// dataProcessing.js

import { setupIndexedDB, storeDataInIndexedDB } from '/js/dbOperations.js';

document.addEventListener('DOMContentLoaded', function () {
    setupIndexedDB(); // Setup IndexedDB when the DOM is fully loaded
    const fileInput = document.getElementById('csvInput');

    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const csvData = e.target.result;
                const processedData = processCSVData(csvData);
                const validData = processedData.filter(row => row['CSA Login'] && row['CSA Login'].trim() !== '');
                storeDataInIndexedDB(validData); // Store only valid data in IndexedDB
            };

            reader.readAsText(file);
        }
    });
});

const processCSVData = (csvData) => {
    let parsedData = parseCSV(csvData);

    // First, filter out rows with empty 'CSA Login'
    let validData = parsedData.filter(row => row['CSA Login'] && row['CSA Login'].trim() !== '');

    // Now sort the filtered valid data
    validData.sort((a, b) => {
        // Assuming 'CSA Login' is now guaranteed to be non-empty, we don't need the empty check here
        let comparison = a['CSA Login'].localeCompare(b['CSA Login']);
        if (comparison !== 0) return comparison;

        let dateA = moment(a.Date, 'MM/DD/YYYY');
        let dateB = moment(b.Date, 'MM/DD/YYYY');
        // No need to check for valid dates as they should be filtered by parseCSV if they are invalid
        return dateA - dateB || moment(a.Start, 'HH:mm') - moment(b.Start, 'HH:mm');
    });

    // Transform the sorted valid data
    let transformedData = validData.map(transformData);

    // Finally, return the calculated breaks on the transformed data
    return calculateBreaks(transformedData);
};

const parseCSV = (csvData) => {
    // Parse the CSV data and return the rows
    return Papa.parse(csvData, { header: true, skipEmptyLines: true }).data; // skipEmptyLines to skip empty rows
};

const transformData = (rowData) => {
    let startDate = moment(rowData.Date, 'MM/DD/YYYY');
    let startDateTime = moment(`${rowData.Date} ${rowData.Start}`, 'MM/DD/YYYY HH:mm');
    let endDateTime = moment(`${rowData.Date} ${rowData.End}`, 'MM/DD/YYYY HH:mm');

    if (endDateTime.isBefore(startDateTime)) {
        endDateTime.add(1, 'day');
    }

    // Check if the required field 'CSA Login' is present and not empty
    if (!rowData['CSA Login'] || rowData['CSA Login'].trim() === '') {
        return null; // Return null for invalid rows
    }

    return {
        ...rowData,
        startDateTime: startDateTime.format('MM/DD/YYYY HH:mm'),
        endDateTime: endDateTime.format('MM/DD/YYYY HH:mm'),
        WeekNumber: startDate.week()
    };
};

const calculateBreaks = (data) => {
    let currentWorkShift = null;
    let breakCount = 0;

    data.forEach(row => {
        if (row['Type'] && row['Type'].trim() === 'Work') {
            currentWorkShift = row;
            breakCount = 0; // Reset break count for new work shift
        } else if (row['Type'] && row['Type'].trim() === 'Break' && currentWorkShift) {
            breakCount++;
            row['BreakNumber'] = breakCount; // Assign break count to the break row
        }
    });

    return data;
};

// The csvData should be assigned the CSV content as a string
// const csvData = `Your CSV Data Here`;
// const processedData = processCSVData(csvData);
// console.log(processedData);
