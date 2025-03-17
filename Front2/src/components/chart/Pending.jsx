import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

function PendienteChart  ({ data })  {
    if (!Array.isArray(data) || data.length < 2) {
        return <p>Se requieren al menos dos puntos para mostrar la pendiente.</p>;
    }

    const distances = [0]; // Distancia inicial es 0
    let totalDistance = 0;
    for (let i = 1; i < data.length; i++) {
        const distance = calculateDistance(
            data[i - 1].lat,
            data[i - 1].lon,
            data[i].lat,
            data[i].lon
        );
        totalDistance += distance;
        distances.push(totalDistance);
    }

    const alturas = data.map((punto) => punto.height); // Alturas para el eje Y






    const chartData = {
        labels: distances.map((dist) => dist.toFixed(2) + ' km'), // Distancia en el eje X
        datasets: [
            {
                label: 'Altura (km)',
                data: alturas,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: false, // No comenzar en cero en el eje Y
               
            },
        },
        animation: {
            duration: 1000,
            easing: 'easeInQuad',
        },
    };

    return <Line data={chartData} options={chartOptions} />;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
};

const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};

export default PendienteChart;