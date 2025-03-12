import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Link } from "react-router-dom";

import { getAllBolideLastSixMonthsWithInfo } from '../services/bolideService'

// Registrar los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ showTable = false, isHome = false }) => {
  const [selectedData, setSelectedData] = useState(null); // Estado para guardar los datos seleccionados
  const [labels, setLabels] = useState([]);
  const [bolides, setBolides] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllBolideLastSixMonthsWithInfo();
        setBolides(data.filteredData);

        // Extraemos los meses de los datos
        const monthsRange = data.monthlyCounts.map(item => item.month); // Extraemos los meses de los datos
        const uniqueMonths = [...new Set(monthsRange)]; // Aseguramos que no haya meses repetidos

        // Crear las etiquetas dinámicamente basadas en los meses


        const labels = uniqueMonths.map(month => monthNames[month]); // Crear etiquetas para los meses que aparecen

        // Inicializar el array de datos de conteo, asegurando que sea un array con 0 en los meses que no aparecen
        const formattedCounts = new Array(12).fill(0); // 12 meses en el año, inicializado con 0
        data.monthlyCounts.forEach(({ month, count }) => {
          formattedCounts[month] = count; // Aseguramos que se mapeen los datos al mes correcto
        });

        // Filtrar solo los últimos 6 meses según los datos disponibles
        const lastSixMonths = labels.slice(-6); // Obtener los últimos 6 meses de la lista de etiquetas
        const lastSixCounts = lastSixMonths.map(month => formattedCounts[monthNames.indexOf(month)]);

        setChartData(lastSixCounts); // Actualizar los datos del gráfico
        setLabels(lastSixMonths); // Actualizar las etiquetas del gráfico
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const data = {
    labels: labels, // Etiquetas de los últimos 6 meses (según el orden de los datos)
    datasets: [
      {
        label: 'Bólidos por mes',
        data: chartData, // Datos de conteo de bólidos por mes
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };



  // Opciones de configuración del gráfico
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Bólidos de los últimos 6 meses',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    onClick: (event, elements) => {
      if (!showTable) return;
      if (elements && elements.length > 0) {
        const index = elements[0].index; // Obtener el índice de la barra seleccionada
        const selectedMonth = labels[index]; // Obtener el nombre del mes seleccionado

        // Convertir el nombre del mes a su índice numérico (0-11)
        const monthIndex = monthNames.indexOf(selectedMonth);

        // Filtrar los datos de bolides por el mes seleccionado
        const filteredData = bolides.filter((item) => {
          const itemMonth = new Date(item.date).getMonth(); // Obtener el mes del item
          return itemMonth === monthIndex; // Compara con el mes seleccionado
        });

        setSelectedData({
          month: selectedMonth,
          data: filteredData,
        });
      }
    },
  };


  const formatearFecha = (fecha) => {
    const opciones = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
    const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', opciones);

    return fechaFormateada.replace(',', '').replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$1/$2/$3');
  };

  return (
    <div style={{ width: '80%', margin: '0 auto', paddingTop: '50px', height: '500px' }}>
      {!isHome &&
        <h2>Gráfico de Bólidos</h2>
      }
      <Bar data={data} options={options} />

      {showTable && selectedData && (
        <div style={{ marginTop: '30px', paddingBottom: '100px' }}>
          <h3>Detalles del mes: {selectedData.month}</h3>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            margin: '20px 0',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#007bff',
                color: 'white',
                textAlign: 'left',
                padding: '12px 15px',
              }}>
                <th style={{ padding: '12px 15px' }}>ID</th>
                <th style={{ padding: '12px 15px' }}>Título</th>
                <th style={{ padding: '12px 15px' }}>Fecha</th>
                <th style={{ padding: '12px 15px' }}>Latitud</th>
                <th style={{ padding: '12px 15px' }}>Longitud</th>
                <th style={{ padding: '12px 15px' }}></th>
              </tr>
            </thead>
            <tbody>
              {selectedData.data.map((item) => (
                <tr key={item.id} style={{
                  borderBottom: '1px solid #ddd',
                  transition: 'background-color 0.3s ease',
                }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                  <td style={{ padding: '10px 15px' }}>{item.id}</td>
                  <td style={{ padding: '10px 15px' }}>{item.title}</td>
                  <td style={{ padding: '10px 15px' }}>{formatearFecha(item.date)}</td>
                  <td style={{ padding: '10px 15px' }}>{item.lat}</td>
                  <td style={{ padding: '10px 15px' }}>{item.lon}</td>
                  <td style={{ padding: '10px 15px' }} ><Link to={`/bolide/${item.id}`}>Ver</Link></td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}
    </div>
  );
};

export default BarChart;
