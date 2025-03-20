import React from 'react';
import GlobeWithObject from '@/components/three/GlobeWithObject.jsx'


const OrbitReport = ({orbit}) => {
    console.log(orbit)
    return (
        <div style={{ width: '100%', height: '80vh' }}>
             <GlobeWithObject orbitalElements={orbit[0]} />
        </div>
    );
};

export default OrbitReport;