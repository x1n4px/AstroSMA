export default function truncateDecimal(value, decimalPlaces = 3) {
    if (value === null || value === undefined || isNaN(Number(value))) {
        return '0.0000'; // Valor por defecto si la entrada no es válida
    }
    return Number(value).toFixed(decimalPlaces);

}