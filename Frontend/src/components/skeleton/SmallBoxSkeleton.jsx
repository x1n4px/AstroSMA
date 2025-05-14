import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';

const SmallBoxSkeleton = () => {
    return (
          <Card className="h-100" style={{ backgroundColor: '#980100' }}>
            <Card.Body className="d-flex align-items-center justify-content-center">
              <div className="text-center w-100">
                <Placeholder as="span" animation="glow" className="d-block">
                  <Placeholder xs={8} style={{ backgroundColor: 'lightgray', height: '1rem' }} />
                </Placeholder>
                <Placeholder as="small" animation="glow" className="d-block mt-2">
                  <Placeholder xs={4} style={{ backgroundColor: 'white', height: '1.25rem' }} />
                </Placeholder>
              </div>
            </Card.Body>
          </Card>
    );
};

export default SmallBoxSkeleton;