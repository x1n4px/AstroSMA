import React from 'react';

const MoonPhaseImage = ({ phaseName, ewidth, eheight, className = '', alt }) => {
  // Construct the image path
  const imagePath = `/moon/${phaseName}.webp`; // Assuming images are named moon.png

  return (
    <div className={`moon-phase-image ${className}`}>
      {/* Display the image */}
      <img
        src={imagePath}
        alt={alt || `${phaseName} Moon`} // Alt text for accessibility
        style={{ width: ewidth, height: eheight }} // Adjust size as needed
        onError={(e) => {
          console.error(`Failed to load moon image for phase: ${phaseName}`, e);
        }}
      />
      {/* <p>Phase: {phaseName}</p> */}
    </div>
  );
};

export default MoonPhaseImage;
