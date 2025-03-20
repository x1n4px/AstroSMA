import React from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const RadarChart = ({ meteoros }) => {

    console.log("Datos recibidos:", meteoros);

    const data = {
        labels: ['Semieje Mayor (a)', 'Excentricidad (e)', 'Inclinación (i)', 'Nodo Ascendente (Omega)', 'Argumento del Perihelio (w)'],
        datasets: meteoros.map((meteoro, index) => ({
            label: meteoro.nombre,
            data: [meteoro.a, meteoro.e, meteoro.i, meteoro.Omega, meteoro.w],
            backgroundColor: `rgba(${index * 50 + 100}, 99, 132, 0.2)`,
            borderColor: `rgba(${index * 50 + 100}, 99, 132, 1)`,
            borderWidth: 1,
        }))
    };

    return <Radar data={data} />;
};

export default RadarChart;
