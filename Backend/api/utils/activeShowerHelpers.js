const normalizeShowerCode = (value) => {
    return String(value || '')
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase();
};

const toRadians = (degrees) => degrees * Math.PI / 180;

const normalizeAngle = (degrees) => {
    const numericValue = Number(degrees);
    if (!Number.isFinite(numericValue)) {
        return null;
    }

    const normalized = numericValue % 360;
    return normalized < 0 ? normalized + 360 : normalized;
};

const getJulianDay = (date) => {
    return date.getTime() / 86400000 + 2440587.5;
};

const getSolarEclipticLongitude = (date) => {
    const julianDay = getJulianDay(date);
    const centuries = (julianDay - 2451545.0) / 36525;

    const meanLongitude = normalizeAngle(
        280.46646 + (36000.76983 * centuries) + (0.0003032 * centuries * centuries)
    );
    const meanAnomaly = normalizeAngle(
        357.52911 + (35999.05029 * centuries) - (0.0001537 * centuries * centuries)
    );

    if (meanLongitude === null || meanAnomaly === null) {
        return null;
    }

    const meanAnomalyRad = toRadians(meanAnomaly);
    const equationOfCenter =
        (1.914602 - (0.004817 * centuries) - (0.000014 * centuries * centuries)) * Math.sin(meanAnomalyRad) +
        (0.019993 - (0.000101 * centuries)) * Math.sin(2 * meanAnomalyRad) +
        0.000289 * Math.sin(3 * meanAnomalyRad);

    const trueLongitude = meanLongitude + equationOfCenter;
    const omega = 125.04 - (1934.136 * centuries);
    const apparentLongitude = trueLongitude - 0.00569 - (0.00478 * Math.sin(toRadians(omega)));

    return normalizeAngle(apparentLongitude);
};

const isSolarLongitudeWithinRange = (solarLongitude, startLongitude, endLongitude) => {
    const longitude = normalizeAngle(solarLongitude);
    const start = normalizeAngle(startLongitude);
    const end = normalizeAngle(endLongitude);

    if (longitude === null || start === null || end === null) {
        return false;
    }

    if (start <= end) {
        return longitude >= start && longitude <= end;
    }

    return longitude >= start || longitude <= end;
};

const dedupeShowerResults = (rows, codeSelector) => {
    const groupedRows = new Map();

    for (const row of rows) {
        const normalizedCode = normalizeShowerCode(codeSelector(row));
        if (!normalizedCode) {
            continue;
        }

        const current = groupedRows.get(normalizedCode);
        const currentScore = current ? Number(current.membership ?? Number.NEGATIVE_INFINITY) : Number.NEGATIVE_INFINITY;
        const nextScore = Number(row.membership ?? Number.NEGATIVE_INFINITY);

        if (!current || nextScore > currentScore) {
            groupedRows.set(normalizedCode, {
                ...row,
                canonicalCode: normalizedCode
            });
        }
    }

    return Array.from(groupedRows.values());
};

module.exports = {
    dedupeShowerResults,
    getSolarEclipticLongitude,
    isSolarLongitudeWithinRange,
    normalizeShowerCode
};
