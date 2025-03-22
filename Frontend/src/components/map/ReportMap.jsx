import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getNearbyStation } from '@/services/stationService';

// Internationalization
import { useTranslation } from 'react-i18next';

const ReportMapChart = ({
  observatory,
  activePopUp,
  lat = 36.7213,
  lon = -4.4216,
  lat2, // Nuevo punto
  lon2, // Nuevo punto
  zoom = 11,
}) => {
  const { t } = useTranslation(['text']);
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
    observatory.forEach((punto) => {
      L.marker([punto.latitude, punto.longitude], {
        icon: new L.Icon({
          iconUrl: '/antena.png',
          iconSize: [25, 25],
        }),
      })
        .addTo(map)
        .bindPopup(`
           <div>
            <h5>${t('STATION.STATION.NAME')}: ${punto.stationName} (${punto.name})</h5>
            <p>${t('STATION.STATION.DESCRIPTION')}: ${punto.description}</p>
            <p>${t('STATION.STATION.COORDINATES')}: ${punto.latitude.toString().substring(0, 8)}, ${punto.longitude.toString().substring(0, 8)}</p>
            <p> ${t('STATION.STATION.HEIGHT.TITLE')}: ${punto.height} ${t('STATION.STATION.HEIGHT.MEASURE')}</p>
            <p> ${t('STATION.STATION.CHIP.SIZE')}: ${punto.chipSize} , ${t('STATION.STATION.CHIP.ORIENTATION')}: ${punto.chipOrientation}</p>
            <p> ${t('STATION.STATION.FILTER')}: ${punto.filter} </p>
            <img src="/station/${punto.stationName}.webp" alt="Imagen" width="250" height="auto" />
          </div>
        `);
    });

    if (lat2 !== undefined && lon2 !== undefined) {
      const marker2 = L.marker([lat2, lon2], {
        icon: new L.Icon({
          iconUrl: '/asteroide.png',  
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

      map.fitBounds(polyline.getBounds());
    }
  }, [map, stations, lat, lon, lat2, lon2]); // Dependencias actualizadas

  return <div id="map" style={{ width: '100%', height: '500px' }}></div>;
};

export default ReportMapChart;