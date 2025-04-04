import React from 'react';

/**
 * Formats a given date string (potentially in ISO 8601 format) into the dd/mm/yyyy format,
 * considering potential time zone differences.
 * @param {string} dateString - The date string to format (e.g., '2023-07-09T22:00:00.000Z').
 * @returns {string} - The formatted date string (dd/mm/yyyy) in the user's local time.
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
        // Create a Date object. This will interpret the date string according to the browser's time zone.
        const date = new Date(dateString);

        // Get the day, month, and year from the Date object.
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        const year = date.getFullYear();

        const formattedDate = `${day}-${month}-${year}`;
        return formattedDate;

    } catch (error) {
        return ''; // Or handle the error as needed
    }
};

export default formatDate;