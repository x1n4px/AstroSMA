import React from 'react';

const MoonPhaseImage = ({ moonData }) => {
  const { phase } = moonData;

  // Determine moon phase name based on phase value
  const getPhaseName = (p) => {
    if (p < 0.01 || p > 0.99) return 'New Moon';
    if (p >= 0.01 && p < 0.24) return 'Waxing Crescent';
    if (p >= 0.24 && p < 0.26) return 'First Quarter';
    if (p >= 0.26 && p < 0.49) return 'Waxing Gibbous';
    if (p >= 0.49 && p < 0.51) return 'Full Moon';
    if (p >= 0.51 && p < 0.74) return 'Waning Gibbous';
    if (p >= 0.74 && p < 0.76) return 'Last Quarter';
    if (p >= 0.76 && p < 0.99) return 'Waning Crescent';
    return 'Unknown'; // Fallback, should not happen
  };

  const phaseName = getPhaseName(phase);

  // Construct the image path
  const imagePath = `/moon/${phaseName}.png`; // Assuming images are named moon.png

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      {/* Display the image */}
      <img
        src={imagePath}
        alt={`${phaseName} Moon`} // Alt text for accessibility
        style={{ width: '250px', height: '250px' }} // Adjust size as needed
        onError={(e) => {
          // Optional: Handle image loading errors (e.g., display a placeholder)
          console.error(`Failed to load moon image for phase: ${phaseName}`, e);
          // e.target.src = '/path/to/placeholder.png'; // Example placeholder
        }}
      />
      <p>Phase: {phaseName}</p>
      {/* You can add other data if needed */}
      {/* <p>Fraction: {moonData.fraction.toFixed(2)}</p> */}
      {/* <p>Angle: {moonData.angle.toFixed(2)} radians</p> */}
    </div>
  );
};

export default MoonPhaseImage;