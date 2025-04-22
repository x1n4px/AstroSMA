import React from 'react';

/**
 * Formats a given date string (potentially in ISO 8601 format) into the specified format,
 * considering potential time zone differences.
 * @param {string} dateString - The date string to format (e.g., '2023-07-09T22:00:00.000Z').
 * @param {string} [format='dd-mm-yyyy'] - The desired format ('dd-mm-yyyy' or 'yyyy-mm-dd').
 * @returns {string} - The formatted date string in the user's local time.
 */
export const formatDate = (dateString, format = 'dd-mm-yyyy') => {
    if (!dateString) return '';

    try {
        // Create a Date object. This will interpret the date string according to the browser's time zone.
        const date = new Date(dateString);

        // Get the day, month, and year from the Date object.
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        const year = date.getFullYear();

        // Format the date based on the specified format.
        if (format === 'yyyy-mm-dd') {
            return `${year}-${month}-${day}`;
        }

        if( format === 'mm/dd/yyyy') {
            return `${month}-${day}-${year}`;
        }

        // Default format: dd-mm-yyyy
        return `${day}-${month}-${year}`;

    } catch (error) {
        return ''; // Or handle the error as needed
    }
};

export default formatDate;