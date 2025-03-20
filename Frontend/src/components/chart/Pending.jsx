import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';


Chart.register(...registerables);

function PendienteChart({ data }) {
  const { t } = useTranslation(['text']);
  if (!Array.isArray(data) || data.length < 2) {
    return <p>Se requieren al menos dos puntos para mostrar la pendiente.</p>;
  }

  // Preparar los datasets para cada estación
  const datasets = data.map((punto) => ({
    label: `Estación ${punto.id} - Pendiente (km)`,
    data: [punto.initialHeight, punto.finalHeight],
    fill: false,
    borderColor: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
      Math.random() * 256
    )}, ${Math.floor(Math.random() * 256)})`, // Colores aleatorios
    tension: 0.1,
  }));

  // Calcular la altura máxima y mínima
  const allHeights = data.flatMap((punto) => [
    punto.initialHeight,
    punto.finalHeight,
  ]);
  const maxAltura = Math.max(...allHeights);
  const minAltura = Math.min(...allHeights);

  // Datos para el gráfico
  const chartData = {
    labels: ['Altura Inicial', 'Altura Final'],
    datasets: datasets,
  };

  // Opciones del gráfico
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: false, // No comenzar en cero
        min: minAltura - (maxAltura - minAltura) * 0.1, // Ajustar el mínimo
        max: maxAltura + (maxAltura - minAltura) * 0.1, // Ajustar el máximo
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