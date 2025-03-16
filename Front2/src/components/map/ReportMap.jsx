import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getNearbyStation } from '../../services/stationService';

const ReportMapChart = ({ data, activePopUp, lat = 36.7213, lon = -4.4216, zoom = 11 }) => {
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

    // Limpia todos los marcadores existentes
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Marcador con icono 'asteroide.png' para la posición original
    const originalMarker = L.marker([lat, lon], {
      icon: new L.Icon({
        iconUrl: '/asteroide.png',
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
    stations.forEach((station) => {
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
  }, [map, stations, lat, lon]); // Dependencias: map, stations, lat, lon

  return <div id="map" style={{ width: '100%', height: '500px' }}></div>;
};

export default ReportMapChart;