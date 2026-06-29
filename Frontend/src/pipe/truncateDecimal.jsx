export default function truncateDecimal(value, decimalPlaces = 3) {
    const normalizedValue = typeof value === 'string'
        ? value.trim().replace(/,/g, '.')
        : value;

    if (normalizedValue === null || normalizedValue === undefined || isNaN(Number(normalizedValue))) {
        return '0.0000'; // Valor por defecto si la entrada no es válida
    }
    return Number(normalizedValue).toFixed(decimalPlaces);

}
