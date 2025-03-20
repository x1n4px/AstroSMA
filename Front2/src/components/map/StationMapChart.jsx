import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

const StationMapChart = ({ data, activePopUp, latitude = 36.7213, longitude = -4.4216, zoom = 11, useStatinIcon=false }) => {
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
          iconUrl: (useStatinIcon ? '/antena.png':getMarkerColor(punto.state)),
          iconSize: [25, 25],
        }),
      }).addTo(map);

      // Añadir popup si activePopUp está habilitado
      if (activePopUp) {
        marker.bindPopup(`
          <div>
            <p>${punto.stationName}</p>
            <p>${punto.description}</p>
            <p>${punto.latitude}, ${punto.longitude}</p>
            <p> Chip: ${punto.chipSize} , ${punto.chipOrientation}</p>
            <p> Filtro: ${punto.filter} </p>
            <img src="${punto.img}" alt="Imagen" width="250" height="auto" />
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

