require('dotenv').config();

function convertCoordinates(input) {
    console.log(input);
    
    // Regex modificado para capturar los 4 valores
    const regex = /([-+]?\d+):([-+]?\d+):([-+]?\d*\.?\d+)\s+([-+]?\d+):([-+]?\d+):([-+]?\d*\.?\d+)\s+([-+]?\d*\.?\d+)\s+([-+]?\d*\.?\d+)/;
    
    function gmsToDecimal(degrees, minutes, seconds) {
        let sign = degrees < 0 || minutes < 0 || seconds < 0 ? -1 : 1;
        let decimal = Math.abs(degrees) + Math.abs(minutes) / 60 + Math.abs(seconds) / 3600;
        return decimal * sign;
    }
    
    const match = input.match(regex);
    if (!match) {
        throw new Error("Formato incorrecto. Debe ser 'grados:min:seg grados:min:seg distance velocity'");
    }
     
    // Extraer y convertir coordenadas
    let longitude = gmsToDecimal(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
    let latitude = gmsToDecimal(parseFloat(match[4]), parseFloat(match[5]), parseFloat(match[6]));
    
    // Normalizar si están fuera de [-180, 180]
    if (Math.abs(longitude) > 180) longitude += longitude > 0 ? -360 : 360;
    if (Math.abs(latitude) > 180) latitude += latitude > 0 ? -360 : 360;

    // Extraer distance y velocity (sin modificar)
    const distance = match[7];
    const height = match[8];

    return {
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        distance,  // Se mantiene como string (o se puede parsear a float si es necesario)
        height   // Se mantiene como string (o se puede parsear a float)
    };
}


module.exports = {
    convertCoordinates
};