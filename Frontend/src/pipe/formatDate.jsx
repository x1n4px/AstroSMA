/**
 * Formats a given date string (potentially in ISO 8601 format) into the specified format,
 * considering potential time zone differences.
 * @param {string} dateString - The date string to format (e.g., '2023-07-09T22:00:00.000Z').
 * @param {string} [format='yyyy-mm-dd'] - The desired format.
 * @returns {string} - The formatted date string in the user's local time.
 */
export const formatDate = (dateString, format = 'yyyy-mm-dd') => {
    if (!dateString) return '';

    try {
        const rawDate = String(dateString).trim();
        const dateOnlyMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (dateOnlyMatch) {
            const [, year, month, day] = dateOnlyMatch;

            if (format === 'dd-mm-yyyy') {
                return `${day}-${month}-${year}`;
            }

            if (format === 'mm/dd/yyyy') {
                return `${month}-${day}-${year}`;
            }

            return `${year}-${month}-${day}`;
        }

        // Create a Date object. This will interpret the date string according to the browser's time zone.
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '';

        // Get the day, month, and year from the Date object.
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        const year = date.getFullYear();

        // Format the date based on the specified format.
        if( format === 'mm/dd/yyyy') {
            return `${month}-${day}-${year}`;
        }

        if (format === 'dd-mm-yyyy') {
            return `${day}-${month}-${year}`;
        }

        return `${year}-${month}-${day}`;

    } catch (error) {
        return ''; // Or handle the error as needed
    }
};

export default formatDate;
