import React from 'react';

/**
 * Formats a given date string into the dd/mm/yyyy format.
 * @param {string} dateString - The date string to format.
 * @returns {string} - The formatted date string.
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
};
 

export default formatDate;
