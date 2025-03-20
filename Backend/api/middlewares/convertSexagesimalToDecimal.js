require('dotenv').config(); // Asegúrate de que dotenv esté configurado

function convertSexagesimalToDecimal(sexagesimalValue) {
    if (!sexagesimalValue) return null; // Manejar valores nulos o indefinidos

    // Split the string into parts using space as a separator
    const parts = sexagesimalValue.split(' ');

    if (parts.length < 3) return null; // Validar el formato correcto

    // Extract degrees, minutes, and seconds
    const degrees = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);

    // Determine the sign (negative for west or south)
    const sign = degrees < 0 ? -1 : 1;

    // Calculate the decimal value
    return sign * (Math.abs(degrees) + Math.abs(minutes) / 60 + Math.abs(seconds) / 3600);
}

function transformStation(station) {
    if (!station) return null; // Manejo de valores nulos o indefinidos

    return {
        id: station.Número,
        name: station.Nombre_Camara,
        description: station.Descripción,
        longitude: convertSexagesimalToDecimal(station.Latitud_Sexagesimal), // Convertir y renombrar
        latitude: convertSexagesimalToDecimal(station.Longitud_Sexagesimal), // Convertir y renombrar
        longitude_Radianes: station.Longitud_Radianes,
        latitude_Radianes: station.Latitud_Radianes,
        height: station.Altitud,
        chipSize: station.Tamaño_Chip,
        chipOrientation: station.Orientación_Chip,
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

module.exports = {
    convertSexagesimalToDecimal,
    transform
};
