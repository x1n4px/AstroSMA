import React from 'react';

import MoonPhase from '@/components/three/MoonPhase.jsx';


const MoonReport = () => {


    const moonData = {
        fraction: 0.6264846836632374,
        phase: 0.7092964058867136,
        angle: 1.1740668741673308
      };


    return (
        <div>
            <MoonPhase moonData={moonData} />
        </div>
    );
};

export default MoonReport;