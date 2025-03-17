import React from 'react';
import ReportMapChart from '@/components/map/ReportMap';

function MapReport (data, data2) {
    return (
        <div>
            <ReportMapChart lat={data.lat} lon={data.lon} zoom={7} />
        </div>
    );
};

export default MapReport;