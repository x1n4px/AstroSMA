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
    const labeledDistanceToken = /^d:\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/i;
    const labeledHeightToken = /^h:\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/i;

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

    const parseMetricToken = (token) => {
        if (numericToken.test(token)) {
            return { type: 'number', value: token };
        }

        const distanceMatch = token.match(labeledDistanceToken);
        if (distanceMatch) {
            return { type: 'distance', value: distanceMatch[1] };
        }

        const heightMatch = token.match(labeledHeightToken);
        if (heightMatch) {
            return { type: 'height', value: heightMatch[1] };
        }

        return null;
    };

    const collectMetrics = (metricTokens) => metricTokens
        .map(parseMetricToken)
        .filter(Boolean);

    const beforePair = collectMetrics(tokens.slice(0, pairStartIndex));
    const afterPair = collectMetrics(tokens.slice(pairStartIndex + 2));

    let distance = null;
    let height = null;

    const assignMetrics = (metrics) => {
        if (!metrics.length) {
            return false;
        }

        const labeledDistance = metrics.find(metric => metric.type === 'distance');
        const labeledHeight = metrics.find(metric => metric.type === 'height');

        if (labeledDistance) {
            distance = labeledDistance.value;
        }

        if (labeledHeight) {
            height = labeledHeight.value;
        }

        if (distance !== null && height !== null) {
            return true;
        }

        const numericValues = metrics
            .filter(metric => metric.type === 'number')
            .map(metric => metric.value);

        if (numericValues.length >= 2) {
            [distance, height] = numericValues.slice(-2);
            return true;
        }

        return distance !== null || height !== null;
    };

    if (!assignMetrics(afterPair)) {
        assignMetrics(beforePair);
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
