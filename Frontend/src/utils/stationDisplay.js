const NUMBER_FORMATTER = new Intl.NumberFormat('es-ES');

function normalizeSexagesimalParts(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const tokens = String(value)
        .trim()
        .replace(/\s*:\s*/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    if (tokens.length < 3) {
        return null;
    }

    return tokens.slice(0, 3);
}

export function formatSexagesimalDisplay(value) {
    const parts = normalizeSexagesimalParts(value);
    if (!parts) {
        return '-';
    }

    const [degrees, minutes, seconds] = parts;
    const normalizedDegrees = degrees.startsWith('+') ? degrees.slice(1) : degrees;
    const normalizedMinutes = minutes.startsWith('+') || minutes.startsWith('-') ? minutes.slice(1) : minutes;
    const normalizedSeconds = seconds.startsWith('+') || seconds.startsWith('-') ? seconds.slice(1) : seconds;

    return `${normalizedDegrees}:${normalizedMinutes}:${normalizedSeconds}`;
}

export function sexagesimalToDegrees(value) {
    const parts = normalizeSexagesimalParts(value);
    if (!parts) {
        return null;
    }

    const [degreesToken, minutesToken, secondsToken] = parts;
    const degrees = Number.parseFloat(degreesToken);
    const minutes = Number.parseFloat(minutesToken);
    const seconds = Number.parseFloat(secondsToken);

    if (![degrees, minutes, seconds].every(Number.isFinite)) {
        return null;
    }

    const sign = degrees < 0 ? -1 : 1;
    return sign * (Math.abs(degrees) + Math.abs(minutes) / 60 + Math.abs(seconds) / 3600);
}

export function sexagesimalToRadians(value) {
    const degrees = sexagesimalToDegrees(value);
    return degrees === null ? null : degrees * (Math.PI / 180);
}

export function formatResolution(horizontalPixels, verticalPixels) {
    const horizontal = Number.parseInt(horizontalPixels, 10);
    const vertical = Number.parseInt(verticalPixels, 10);

    if (!Number.isFinite(horizontal) || !Number.isFinite(vertical)) {
        return '-';
    }

    return `${NUMBER_FORMATTER.format(Math.abs(horizontal))}x${NUMBER_FORMATTER.format(Math.abs(vertical))}`;
}

export function sortStationsByObservatoryAndId(left, right) {
    const leftName = String(left?.stationName ?? '').trim();
    const rightName = String(right?.stationName ?? '').trim();
    const nameComparison = leftName.localeCompare(rightName, 'es', { sensitivity: 'base' });

    if (nameComparison !== 0) {
        return nameComparison;
    }

    return Number(left?.id ?? 0) - Number(right?.id ?? 0);
}

export function getStationDisplayName(station) {
    return station?.stationName || station?.name || station?.id || '-';
}
