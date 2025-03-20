import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

// Internationalization
import { useTranslation } from 'react-i18next';

const StationMapChart = ({ data, activePopUp, latitude = 36.7213, longitude = -4.4216, zoom = 11, useStatinIcon = false }) => {
  const { t } = useTranslation(['text']);
  const navigate = useNavigate();

  // Función para determinar el color del marcador según el estado
  const getMarkerColor = (state) => {
    switch (state) {
      case 0:
        return '/map-green.png'; // Verde para state = 0
      case 1:
        return '/map-yellow.png'; // Amarillo para state = 1
      case 2:
        return '/map-blue.png'; // Azul para state = 2
      default:
        return '/map-gray.png'; // Color por defecto
    }
  };

  useEffect(() => {
    // Crear el mapa y centrarlo en una ubicación específica
    const map = L.map('map').setView([latitude, longitude], zoom);

    // Añadir una capa de tiles (puedes usar OpenStreetMap, por ejemplo)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Añadir marcadores dinámicos
    data.forEach((punto) => {
      const marker = L.marker([punto.latitude, punto.longitude], {
        icon: new L.Icon({
          iconUrl: (useStatinIcon ? '/antena.png' : getMarkerColor(punto.state)),
          iconSize: [25, 25],
        }),
      }).addTo(map);

      // Añadir popup si activePopUp está habilitado
      if (activePopUp) {
        marker.bindPopup(`
          <div>
            <h5>${t('STATION.STATION.NAME')}: ${punto.stationName} (${punto.name})</h5>
            <p>${t('STATION.STATION.DESCRIPTION')}: ${punto.description}</p>
            <p>${t('STATION.STATION.COORDINATES')}: ${punto.latitude}, ${punto.longitude}</p>
            <p> ${t('STATION.STATION.HEIGHT.TITLE')}: ${punto.height} ${t('STATION.STATION.HEIGHT.MEASURE')}</p>
            <p> ${t('STATION.STATION.CHIP.SIZE')}: ${punto.chipSize} , ${t('STATION.STATION.CHIP.ORIENTATION')}: ${punto.chipOrientation}</p>
            <p> ${t('STATION.STATION.FILTER')}: ${punto.filter} </p>
            <img src="/station/${punto.stationName}.webp" alt="Imagen" width="250" height="auto" />
          </div>
        `);
      }


    });

    // Limpieza al desmontar el componente
    return () => {
      map.remove();
    };
  }, [data, activePopUp, latitude, longitude, zoom, navigate]);

  return <div id="map" style={{ width: '100%', height: '800px' }}></div>;
};

export default StationMapChart;

