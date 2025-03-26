import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MultiMarkerMapChart = ({ data, lat = 36.7213, lon = -4.4216, zoom = 5 }) => {
    //lat = parseInt(data[0].latitud);
    //lon = parseInt(data[0].longitud);
    useEffect(() => {
        // Crear el mapa y centrarlo en la ubicación proporcionada
        const map = L.map('map').setView([lat, lon], zoom);

        // Añadir una capa de tiles (usando OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        // Añadir marcadores para cada punto en los datos
        data.forEach(point => {
            L.marker([point.latitud, point.longitud], {
                icon: new L.Icon({
                    iconUrl: '/map-green.png', // Icono por defecto
                    iconSize: [25, 25], // Tamaño del icono
                }),
            }).addTo(map)
                .bindPopup(`
                    <div>
                        <p>Ubicación:</p>
                        <p>Latitud: ${point.latitud}, Longitud: ${point.longitud}</p>
                    </div>
                `);
        });

        // Limpieza al desmontar el componente
        return () => {
            map.remove();
        };
    }, [data, lat, lon, zoom]);

    return <div id="map" style={{ width: '100%', height: '500px' }}></div>;
};

export default MultiMarkerMapChart;