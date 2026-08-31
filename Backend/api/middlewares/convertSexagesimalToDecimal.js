require('dotenv').config(); // Asegúrate de que dotenv esté configurado

function parseSexagesimalParts(sexagesimalValue) {
    if (!sexagesimalValue) {
        return null;
    }

    const normalizedValue = String(sexagesimalValue).trim();
    if (!normalizedValue) {
        return null;
    }

    const parts = normalizedValue
        .replace(/\s*:\s*/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length < 3) {
        return null;
    }

    const getExplicitSign = (part) => {
        const trimmedPart = String(part).trim();

        if (trimmedPart.startsWith('-')) return -1;
        if (trimmedPart.startsWith('+')) return 1;

        return null;
    };

    const firstSign = getExplicitSign(parts[0]) ?? 1;
    const applyPartSign = (part, fallbackSign = firstSign) => {
        const parsedPart = Number.parseFloat(part);
        const sign = getExplicitSign(part) ?? fallbackSign;

        return sign * Math.abs(parsedPart);
    };

    const degrees = applyPartSign(parts[0], 1);
    const minutes = applyPartSign(parts[1]);
    const seconds = applyPartSign(parts[2]);

    if (![degrees, minutes, seconds].every(Number.isFinite)) {
        return null;
    }

    const sign = firstSign;

    return { degrees, minutes, seconds, sign };
}

function convertSexagesimalToDecimal(sexagesimalValue) {
    const parts = parseSexagesimalParts(sexagesimalValue);
    if (!parts) return null;

    return parts.degrees + parts.minutes / 60 + parts.seconds / 3600;
}

function convertSexagesimalToRadians(sexagesimalValue) {
    const decimalDegrees = convertSexagesimalToDecimal(sexagesimalValue);
    return decimalDegrees === null ? null : decimalDegrees * (Math.PI / 180);
}

function formatResolution(horizontalPixels, verticalPixels) {
    const horizontal = Number.parseInt(horizontalPixels, 10);
    const vertical = Number.parseInt(verticalPixels, 10);

    if (!Number.isFinite(horizontal) || !Number.isFinite(vertical)) {
        return null;
    }

    const formatter = new Intl.NumberFormat('es-ES');
    return `${formatter.format(Math.abs(horizontal))}x${formatter.format(Math.abs(vertical))}`;
}

function transformStation(station) {
    if (!station) return null; // Manejo de valores nulos o indefinidos

    return {
        id: station.Número,
        name: station.Nombre_Camara,
        description: station.Descripción,
        // The legacy columns are named opposite to the coordinate values they store.
        longitudeSexagesimal: station.Latitud_Sexagesimal,
        latitudeSexagesimal: station.Longitud_Sexagesimal,
        longitude: convertSexagesimalToDecimal(station.Latitud_Sexagesimal), // Convertir y renombrar
        latitude: convertSexagesimalToDecimal(station.Longitud_Sexagesimal), // Convertir y renombrar
        longitude_Radianes: station.Latitud_Radianes,
        latitude_Radianes: station.Longitud_Radianes,
        height: station.Altitud,
        localDirectory: station.Directorio_Local,
        cloudDirectory: station.Directorio_Nube,
        chipSize: station.Tamaño_Chip,
        chipOrientation: station.Orientación_Chip,
        resolution: formatResolution(station.Tamaño_Chip, station.Orientación_Chip),
        filter: station.Máscara,
        credit: station.Créditos,
        stationName: station.Nombre_Observatorio,
        state: station.Activo
    };
}

function transform(input) {
    if (Array.isArray(input)) {
        // Si es un array, transformar cada estación
        return input.map(transformStation);
    } else if (typeof input === 'object' && input !== null) {
        // Si es un solo objeto, transformarlo directamente
        return transformStation(input);
    } else {
        return null; // Manejo de errores para entradas no válidas
    }
}

function individuaConvertSexagesimalToDecimal(sexagesimalValue) {
    const parts = parseSexagesimalParts(sexagesimalValue);
    if (!parts) return null;

    return parseFloat((parts.degrees + parts.minutes / 60 + parts.seconds / 3600).toFixed(4));
}


module.exports = {
    convertSexagesimalToDecimal,
    convertSexagesimalToRadians,
    formatResolution,
    transform, 
    individuaConvertSexagesimalToDecimal
};
