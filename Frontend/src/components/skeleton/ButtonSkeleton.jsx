import React from 'react';
import { Placeholder, Button } from 'react-bootstrap';


const ButtonSkeleton = ({ count = 3 }) => {
    return (
        <div>
    {Array.from({ length: count }).map((_, i) => (
      <Placeholder key={i} as={Button} variant="outline-danger" animation="glow" className="w-100 mb-3" style={{ height: '38px', borderRadius: '10px' }}>
        <Placeholder xs={12} />
      </Placeholder>
    ))}
  </div>
    );
};

export default ButtonSkeleton;