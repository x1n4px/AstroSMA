import React from 'react';
import { Placeholder } from 'react-bootstrap';

const MapSkeleton = ({ height = '300px' }) => {
    return (
        <div style={{ height, width: '100%', backgroundColor: '#f0f0f0', borderRadius: '4px', position: 'relative' }}>
            <Placeholder animation="glow" className="h-100 w-100 d-flex align-items-center justify-content-center">
                <Placeholder xs={12} style={{ height: '100%' }} />
            </Placeholder>
        </div>
    );
};

export default MapSkeleton;