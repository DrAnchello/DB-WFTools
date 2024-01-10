// BreakCalc.js 

function calculateBreaksAndLunch(startTime, endTime) {
          
    let start = new Date('1970/01/01 ' + startTime);
    let end = new Date('1970/01/01 ' + endTime);
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    console.log('Parsed Start Time:', start);
    console.log('Parsed End Time:', end);
    let shiftLength = (end - start) / (1000 * 60 * 60);
    console.log('Shift Length (hours):', shiftLength);

    let break1 = null, lunch = null, break2 = null, break3 = null;

    // Calculate breaks and lunch based on shift length
    if (shiftLength >= 4 && shiftLength < 7) {
      break1 = roundToNearestFive(new Date(start.getTime() + randomMinutes(120, 195)));
    } else if (shiftLength >= 7 && shiftLength < 7.5) {
      break1 = roundToNearestFive(new Date(start.getTime() + randomMinutes(120, 195)));
      lunch = roundToNearestFive(new Date(start.getTime() + randomMinutes(240, 300)));
    } else if (shiftLength >= 7.5 && shiftLength <= 10) {
      break1 = roundToNearestFive(new Date(start.getTime() + randomMinutes(120, 195)));
      lunch = roundToNearestFive(new Date(start.getTime() + randomMinutes(240, 300)));
      break2 = roundToNearestFive(new Date(lunch.getTime() + 60 * 60 * 1000 + randomMinutes(90, 135)));
    } else if (shiftLength > 10) {
      break1 = roundToNearestFive(new Date(start.getTime() + randomMinutes(120, 195)));
      lunch = roundToNearestFive(new Date(start.getTime() + randomMinutes(240, 300)));
      break2 = roundToNearestFive(new Date(lunch.getTime() + 60 * 60 * 1000 + randomMinutes(90, 135)));
      break3 = roundToNearestFive(new Date(break2.getTime() + 15 * 60 * 1000 + randomMinutes(90, 120)));
    }

    console.log('Break 1 Start:', break1 ? formatTime(break1) : 'N/A');
    console.log('Lunch Start:', lunch ? formatTime(lunch) : 'N/A');
    console.log('Break 2 Start:', break2 ? formatTime(break2) : 'N/A');
    console.log('Break 3 Start:', break3 ? formatTime(break3) : 'N/A');

    // Format times and round the end times to the nearest 5 minutes
    return {
      break1Start: break1 ? formatTime(break1) : '',
      break1End: break1 ? formatTime(roundToNearestFive(new Date(break1.getTime() + 15 * 60 * 1000))) : '',
      lunchStart: lunch ? formatTime(lunch) : '',
      lunchEnd: lunch ? formatTime(roundToNearestFive(new Date(lunch.getTime() + 60 * 60 * 1000))) : '',
      break2Start: break2 ? formatTime(break2) : '',
      break2End: break2 ? formatTime(roundToNearestFive(new Date(break2.getTime() + 15 * 60 * 1000))) : '',
      break3Start: break3 ? formatTime(break3) : '',
      break3End: break3 ? formatTime(roundToNearestFive(new Date(break3.getTime() + 15 * 60 * 1000))) : '',
    };
}

// Helper function to generate random minutes within a range
function randomMinutes(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min) * 60 * 1000;
}

function roundToNearestFive(date) {
  const minutes = date.getMinutes();
  const roundedMinutes = 5 * Math.round(minutes / 5);
  date.setMinutes(roundedMinutes);
  return date;
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
