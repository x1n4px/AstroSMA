import React from 'react';
import ActiveRainGlobe from '@/components/three/ActiveRainGlobe.jsx'


const ActiveRain = ({ reportData }) => {
    return (
        <>
        <h1>Lluvia asociada: {reportData.Lluvia_Identificador}</h1>
            <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
                <ActiveRainGlobe />
            </div>
        </>
    );
};

export default ActiveRain;