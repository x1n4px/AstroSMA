import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getNearbyStation } from '@/services/stationService';

const ReportMapChart = ({
  report,
  observatory,
  activePopUp,
  lat = 36.7213,
  lon = -4.4216,
  lat2 = 38.1, // Nuevo punto
  lon2 = -4.21, // Nuevo punto
  zoom = 11,
}) => {
  const [radius, setRadius] = useState(200);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stations, setStations] = useState([]);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await getNearbyStation(lat, lon, radius);
        setStations(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();

    const newMap = L.map('map').setView([lat, lon], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(newMap);

    setMap(newMap);

    return () => {
      newMap.remove();
    };
  }, [lat, lon, zoom]);

  useEffect(() => {
    if (!map) return;

    // Limpia todos los marcadores y líneas existentes
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Marcador con icono 'asteroide.png' para la posición original
    const originalMarker = L.marker([lat, lon], {
      icon: new L.Icon({
        iconUrl: (lat2 != undefined) ? '/red-point.png':'/asteroide.png',
        iconSize: [25, 25],
      }),
    }).addTo(map);

    originalMarker.bindPopup(`
      <div>
        <p>Posición Original:</p>
        <p>Latitud: ${lat}, Longitud: ${lon}</p>
      </div>
    `);

    // Marcadores para las estaciones
    observatory.forEach((station) => {
      L.marker([station.lat, station.lon], {
        icon: new L.Icon({
          iconUrl: '/antena.png',
          iconSize: [25, 25],
        }),
      })
        .addTo(map)
        .bindPopup(`
          <div>
            <p>Estación: ${station.title || 'Desconocida'}</p>
            <p>Latitud: ${station.lat}, Longitud: ${station.lon}</p>
          </div>
        `);
    });

    // Agregar la lógica para los nuevos puntos y la línea
    if (lat2 !== null && lon2 !== null) {
      const marker2 = L.marker([lat2, lon2], {
        icon: new L.Icon({
          iconUrl: '/asteroide.png', // Puedes cambiar el icono si lo deseas
          iconSize: [25, 25],
        }),
      }).addTo(map);

      marker2.bindPopup(`
        <div>
          <p>Punto 2:</p>
          <p>Latitud: ${lat2}, Longitud: ${lon2}</p>
        </div>
      `);

      const polyline = L.polyline(
        [
          [lat, lon],
          [lat2, lon2],
        ],
        { color: 'red' }
      ).addTo(map);

      // Ajustar el zoom para que la línea sea visible
      map.fitBounds(polyline.getBounds());
    }
  }, [map, stations, lat, lon, lat2, lon2]); // Dependencias actualizadas

  return <div id="map" style={{ width: '100%', height: '500px' }}></div>;
};

export default ReportMapChart;