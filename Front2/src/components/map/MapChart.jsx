import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

const MapChart = ({ data, activePopUp, lat = 36.7213, lon = -4.4216, zoom = 11 }) => {
    useEffect(() => {
        // Crear el mapa y centrarlo en la ubicación proporcionada
        const map = L.map('map').setView([lat, lon], zoom);
    
        // Añadir una capa de tiles (usando OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);
    
        // Añadir un único marcador en la ubicación proporcionada
        const marker = L.marker([lat, lon], {
          icon: new L.Icon({
            iconUrl: '/map-green.png', // Icono por defecto
            iconSize: [25, 25], // Tamaño del icono
          }),
        }).addTo(map);
    
        // Añadir un popup al marcador
        marker.bindPopup(`
          <div>
            <p>Ubicación:</p>
            <p>Latitud: ${lat}, Longitud: ${lon}</p>
          </div>
        `);
    
        // Limpieza al desmontar el componente
        return () => {
          map.remove();
        };
      }, [lat, lon, zoom]);
    
      return <div id="map" style={{ width: '100%', height: '500px' }}></div>;
};

export default MapChart;