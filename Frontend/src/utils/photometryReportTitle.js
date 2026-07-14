function compactDate(value) {
  const rawDate = String(value || '').trim();

  if (rawDate.includes('T')) {
    const parsedDate = new Date(rawDate);

    if (!Number.isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');

      return `${year}${month}${day}`;
    }
  }

  const dateMatch = rawDate.match(/(\d{4})[-/]?(\d{2})[-/]?(\d{2})/);
  return dateMatch ? `${dateMatch[1]}${dateMatch[2]}${dateMatch[3]}` : '';
}

function compactTime(value) {
  const timeMatch = String(value || '').trim().match(/(\d{1,2}):?(\d{2}):?(\d{2})/);

  if (!timeMatch) {
    return '';
  }

  return `${timeMatch[1].padStart(2, '0')}${timeMatch[2]}${timeMatch[3]}`;
}

function displayDate(value) {
  const rawDate = String(value || '').trim();

  if (rawDate.includes('T')) {
    const parsedDate = new Date(rawDate);

    if (!Number.isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    }
  }

  const dateMatch = rawDate.match(/(\d{4})[-/]?(\d{2})[-/]?(\d{2})/);
  return dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';
}

function displayTime(value) {
  const timeMatch = String(value || '').trim().match(/(\d{1,2}):?(\d{2}):?(\d{2})/);

  if (!timeMatch) {
    return '';
  }

  return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}:${timeMatch[3]}`;
}

function firstValue(values) {
  return values.find(value => value !== null && value !== undefined && String(value).trim() !== '');
}

function extractStationNumber(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value).trim();
  const parentheticalNumber = text.match(/\((\d+)\)\s*$/);

  if (parentheticalNumber) {
    return parentheticalNumber[1];
  }

  const leadingNumber = text.match(/^(\d+)(?:\D|$)/);

  if (leadingNumber) {
    return leadingNumber[1];
  }

  const anyNumber = text.match(/\b\d+\b/);
  return anyNumber ? anyNumber[0] : '';
}

function resolveStationNumber(sources) {
  const directValue = firstValue(sources.flatMap(source => [
    source?.Nobs,
    source?.nobs,
    source?.Observatorio_Número,
    source?.observatoryNumber,
    source?.stationNumber,
    source?.stationNumber1,
    source?.Numero,
    source?.numero
  ]));

  if (directValue !== undefined) {
    return String(directValue).trim();
  }

  const stationLabel = firstValue(sources.flatMap(source => [
    source?.station1,
    source?.station,
    source?.observatory,
    source?.observatoryName
  ]));

  return extractStationNumber(stationLabel);
}

export function buildPhotometryReportTitle(report, ...stationSources) {
  const timestamp = `${compactDate(report?.Fecha ?? report?.date)}${compactTime(report?.Hora ?? report?.time)}`;
  const stationNumber = resolveStationNumber([report, ...stationSources].filter(Boolean));

  if (!timestamp || !stationNumber) {
    return '';
  }

  return `informe-fotometría-${timestamp}-${stationNumber}`;
}

export function buildPhotometryEventTitle(report) {
  const date = displayDate(report?.Fecha ?? report?.date);
  const time = displayTime(report?.Hora ?? report?.time);

  if (!date || !time) {
    return '';
  }

  return `Evento ${date} ${time}`;
}
