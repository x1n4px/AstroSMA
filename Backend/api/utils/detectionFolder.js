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

function resolveDetectionContext(date, time, fullPath = process.env.FULL_PATH) {
  if (!fullPath) {
    return null;
  }

  const dateParts = normalizeDate(date);
  const timeParts = normalizeTime(time);

  if (!dateParts || !timeParts) {
    return null;
  }

  const normalizedFullPath = path.resolve(fullPath);
  const deteccionesSuffix = path.join('home', 'sma', 'Meteoros', 'Detecciones');
  const deteccionesRoot = normalizedFullPath.endsWith(deteccionesSuffix)
    ? normalizedFullPath
    : path.resolve(normalizedFullPath, deteccionesSuffix);
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
  resolveDetectionContext
};
