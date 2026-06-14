require('dotenv').config();

function convertCoordinates(input, fullReturn = true) {
    const emptyResult = () => (
        fullReturn
            ? { latitude: null, longitude: null, distance: null, height: null }
            : { latitude: null, longitude: null }
    );

    if (typeof input !== 'string') {
        return emptyResult();
    }

    const trimmed = input.trim();
    if (!trimmed) {
        return emptyResult();
    }

    const sexagesimalToken = /^[+-]?\d+:\d{1,2}:\d{1,2}(?:\.\d+)?$/;
    const numericToken = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;

    function gmsToDecimal(degrees, minutes, seconds) {
        const sign = [degrees, minutes, seconds].some(value => value < 0) ? -1 : 1;
        const decimal = Math.abs(degrees) + Math.abs(minutes) / 60 + Math.abs(seconds) / 3600;
        return decimal * sign;
    }

    const tokens = trimmed.split(/\s+/).filter(Boolean);
    let pairStartIndex = -1;

    for (let index = 0; index < tokens.length - 1; index += 1) {
        if (sexagesimalToken.test(tokens[index]) && sexagesimalToken.test(tokens[index + 1])) {
            pairStartIndex = index;
        }
    }

    if (pairStartIndex === -1) {
        return emptyResult();
    }

    const [longitudeToken, latitudeToken] = tokens.slice(pairStartIndex, pairStartIndex + 2);
    const [longitudeDegrees, longitudeMinutes, longitudeSeconds] = longitudeToken.split(':').map(Number);
    const [latitudeDegrees, latitudeMinutes, latitudeSeconds] = latitudeToken.split(':').map(Number);

    if (![longitudeDegrees, longitudeMinutes, longitudeSeconds, latitudeDegrees, latitudeMinutes, latitudeSeconds].every(Number.isFinite)) {
        return emptyResult();
    }

    let longitude = gmsToDecimal(longitudeDegrees, longitudeMinutes, longitudeSeconds);
    let latitude = gmsToDecimal(latitudeDegrees, latitudeMinutes, latitudeSeconds);

    if (Math.abs(longitude) > 180) longitude += longitude > 0 ? -360 : 360;
    if (Math.abs(latitude) > 180) latitude += latitude > 0 ? -360 : 360;

    const beforePair = tokens.slice(0, pairStartIndex).filter(token => numericToken.test(token));
    const afterPair = tokens.slice(pairStartIndex + 2).filter(token => numericToken.test(token));

    let distance = null;
    let height = null;

    if (afterPair.length >= 2) {
        [distance, height] = afterPair;
    } else if (beforePair.length >= 2) {
        [distance, height] = beforePair.slice(-2);
    }

    const result = {
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6)
    };

    if (fullReturn) {
        result.distance = distance;
        result.height = height;
    }

    return result;
}


module.exports = {
    convertCoordinates
};
