import React from 'react';

const MoonPhaseImage = ({ phaseName, ewidth, eheight }) => {
  // Construct the image path
  const imagePath = `/moon/${phaseName}.webp`; // Assuming images are named moon.png

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      {/* Display the image */}
      <img
        src={imagePath}
        alt={`${phaseName} Moon`} // Alt text for accessibility
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