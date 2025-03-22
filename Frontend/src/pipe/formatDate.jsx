import React from 'react';

/**
 * Formats a given date string into a readable format based on the browser's language.
 * @param {string} dateString - The date string to format.
 * @returns {string} - The formatted date string.
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);

    // Detect the browser's language using navigator.language
    const browserLanguage = navigator.language;
    return date.toLocaleDateString(browserLanguage, options);
};

const ExampleComponent = ({ dateToFormat }) => {
    return (
        <div>
            <p>Formatted Date: {formatDate(dateToFormat)}</p>
        </div>
    );
};

export default ExampleComponent;