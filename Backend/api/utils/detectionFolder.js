const path = require('path');

function normalizeDate(inputDate) {
  const value = String(inputDate || '').trim();

  if (value.includes('T')) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Madrid',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(parsed);
      const year = parts.find((part) => part.type === 'year')?.value;
      const month = parts.find((part) => part.type === 'month')?.value;
      const day = parts.find((part) => part.type === 'day')?.value;

      if (year && month && day) {
        return { year, month, day };
      }
    }
  }

  const match = value.match(/(\d{4})[-/]?(\d{2})[-/]?(\d{2})/);
  if (!match) return null;
  return { year: match[1], month: match[2], day: match[3] };
}

function normalizeTime(inputTime) {
  const value = String(inputTime || '').trim();
  const match = value.match(/(\d{2}):?(\d{2}):?(\d{2})/);
  if (!match) return null;
  return { hour: match[1], minute: match[2], second: match[3] };
}

function shiftDateParts(dateParts, offsetDays) {
  const year = Number(dateParts.year);
  const month = Number(dateParts.month);
  const day = Number(dateParts.day);

  if (![year, month, day].every(Number.isInteger)) {
    return null;
  }

  const shifted = new Date(Date.UTC(year, month - 1, day));
  shifted.setUTCDate(shifted.getUTCDate() + offsetDays);

  return {
    year: String(shifted.getUTCFullYear()).padStart(4, '0'),
    month: String(shifted.getUTCMonth() + 1).padStart(2, '0'),
    day: String(shifted.getUTCDate()).padStart(2, '0')
  };
}

function getObservationDateParts(dateParts, timeParts) {
  const dawnCutoffHour = Number(process.env.DAWN_CUTOFF_HOUR ?? 8);
  const hour = Number(timeParts.hour);

  if (Number.isFinite(dawnCutoffHour) && Number.isInteger(hour) && hour < dawnCutoffHour) {
    return shiftDateParts(dateParts, -1) || dateParts;
  }

  return dateParts;
}

function resolveDetectionContext(date, time, fullPath = process.env.FULL_PATH) {
  if (!fullPath) {
    return null;
  }

  const dateParts = normalizeDate(date);
  const timeParts = normalizeTime(time);

  if (!dateParts || !timeParts) {
    return null;
  }

  const observationDateParts = getObservationDateParts(dateParts, timeParts);
  const deteccionesRoot = path.resolve(fullPath);
  const formattedDate = `${observationDateParts.year}${observationDateParts.month}${observationDateParts.day}`;
  const formattedTime = `${timeParts.hour}${timeParts.minute}${timeParts.second}`;
  const eventFolder = path.resolve(deteccionesRoot, observationDateParts.year, formattedDate, formattedTime);
  console.log(`Resolved detection context: ${eventFolder}`);
  return {
    dateParts: observationDateParts,
    timeParts,
    deteccionesRoot,
    eventFolder,
    formattedDate,
    formattedTime
  };
}




function originalResolveDetectionContext(date, time, fullPath = process.env.FULL_PATH) {
  if (!fullPath) {
    return null;
  }

  const dateParts = normalizeDate(date);
  const timeParts = normalizeTime(time);

  if (!dateParts || !timeParts) {
    return null;
  }

  const deteccionesRoot = path.resolve(fullPath);
  const formattedDate = `${dateParts.year}${dateParts.month}${dateParts.day}`;
  const formattedTime = `${timeParts.hour}${timeParts.minute}${timeParts.second}`;
  const eventFolder = path.resolve(deteccionesRoot, dateParts.year, formattedDate, formattedTime);

  return {
    dateParts,
    timeParts,
    deteccionesRoot,
    eventFolder,
    formattedDate,
    formattedTime
  };
}

module.exports = {
  resolveDetectionContext, originalResolveDetectionContext
};
