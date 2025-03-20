import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Container, Row, Col } from 'react-bootstrap';

Chart.register(...registerables);

function PendienteChart({ data }) {
  if (!Array.isArray(data) || data.length < 2) {
    return <p>Se requieren al menos dos puntos para mostrar la pendiente.</p>;
  }

  // Obtener las distancias y alturas de los datos
  const distances = data.map((punto) => punto.distancia);
  const alturas = data.map((punto) => punto.tiempo); // Usamos tiempo como altura

  // Calcular la altura máxima
  const maxAltura = Math.max(...alturas);

  // Datos para el gráfico
  const chartData = {
    labels: data.map((punto) => punto.name), // Nombres de las estaciones como labels
    datasets: [
      {
        label: 'Tiempo', // Cambiamos el label a Tiempo
        data: alturas,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  // Opciones del gráfico
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: false,
        max: maxAltura,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInQuad',
    },
  };

  return (
    <Container>
      
      <Line data={chartData} options={chartOptions} />
    </Container>
  );
}

export default PendienteChart;