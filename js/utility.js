// utility.js

/**
 * Parses a CSV row and returns an array of values.
 * @param {string} row - A string representing a row from a CSV file.
 * @returns {string[]} An array of values parsed from the row.
 */
function parseCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
  
    for (let char of row) {
      if (char === '"' && inQuotes && current.slice(-1) !== '"') {
        inQuotes = !inQuotes;
      } else if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  
    result.push(current); // Add the last field
    return result.map(field => field.trim().replace(/^"|"$/g, ''));
  }
  
  /**
   * Parses a date and time string into a Date object.
   * @param {string} dateString - A string representing a date.
   * @param {string} timeString - A string representing a time.
   * @returns {Date|null} A Date object or null if the input is invalid.
   */
  function parseDateTime(dateString, timeString) {
    if (!dateString || !timeString) {
      console.error("Invalid date or time input:", dateString, timeString);
      return null;
    }
  
    const [day, month, year] = dateString.split('/').map(num => parseInt(num, 10));
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day, hours, minutes);
  
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString, timeString);
      return null;
    }
  
    return date;
  }
  
  /**
   * Checks if an end date/time is before a start date/time, indicating crossing over midnight.
   * @param {Date} start - The start Date object.
   * @param {Date} end - The end Date object.
   * @returns {boolean} True if the end is before the start, false otherwise.
   */
  function crossesMidnight(start, end) {
    return end < start;
  }
  
  /**
   * Calculates the week number for a given date.
   * @param {string} dateString - A string representing a date.
   * @returns {number} The week number of the year for the date.
   */
  function getWeekNumber(dateString) {
    const date = new Date(dateString);
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000)) + ((startOfYear.getDay() + 6) % 7);
    return Math.ceil(days / 7);
  }
  
  /**
   * Validates the structure of data based on required fields.
   * @param {Object} dataItem - The data item object to validate.
   * @param {string[]} requiredFields - An array of strings representing the required fields.
   * @returns {boolean} True if the item is valid, false otherwise.
   */
  function validateDataStructure(dataItem, requiredFields) {
    return requiredFields.every(field => dataItem.hasOwnProperty(field) && dataItem[field]);
  }
  
  // Export the utility functions if using ES6 modules
  // export { parseCSVRow, parseDateTime, crossesMidnight, getWeekNumber, validateDataStructure };
  
  // For non-module environments, the functions are already available globally.
  