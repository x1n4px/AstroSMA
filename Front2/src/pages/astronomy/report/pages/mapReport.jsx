import React from 'react';
import ReportMapChart from '@/components/map/ReportMap';
import PendienteChart from '@/components/chart/Pending';

function MapReport (data, data2) {
    return (
        <div>
            <ReportMapChart lat={data.lat} lon={data.lon} zoom={7} />
            <PendienteChart data={data2} />
        </div>
    );
};

export default MapReport;