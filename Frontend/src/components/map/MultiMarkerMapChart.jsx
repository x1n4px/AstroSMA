import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MultiMarkerMapChart = ({ data, observatory, lat = 40.4168, lon = -3.7038, zoom = 6 }) => {
    const mapRef = useRef(null);
    const polylineRefs = useRef([]);
    const markerRefs = useRef([]);
    const mapContainerRef = useRef(null); // Referencia al contenedor del mapa

    useEffect(() => {
        if (!data || data.length === 0) {
            return;
        }

        // Inicializar el mapa solo si no existe
        if (!mapRef.current && mapContainerRef.current) {
            const map = L.map(mapContainerRef.current).setView([lat, lon], zoom);
            mapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
            }).addTo(map);
        }

        // Asegurarse de que el mapa esté inicializado antes de continuar
        if (mapRef.current) {
            // Limpiar elementos anteriores
            polylineRefs.current.forEach(polyline => polyline.remove());
            markerRefs.current.forEach(marker => marker.remove());
            polylineRefs.current = [];
            markerRefs.current = [];

            // Procesar cada conjunto de trayectorias
            data.forEach((trajectorySet, index) => {
                Object.entries(trajectorySet).forEach(([stationId, stationData]) => {
                    const { start, end, id } = stationData;

                    // Convertir coordenadas a números
                    const startLat = parseFloat(start.latitude);
                    const startLon = parseFloat(start.longitude);
                    const endLat = parseFloat(end.latitude);
                    const endLon = parseFloat(end.longitude);

                    // Crear línea con estilo basado en el stationId
                    const color = stationId === 'st1' ? '#3388ff' : '#ff7800';
                    const weight = stationId === 'st1' ? 7 : 5;

                    const polyline = L.polyline(
                        [
                            [startLat, startLon],
                            [endLat, endLon]
                        ],
                        {
                            color,
                            weight,
                            opacity: 1,
                            dashArray: stationId === 'st1' ? null : '5, 5'
                        }
                    ).addTo(mapRef.current);

                    polyline.bindPopup(`Trayectoria ${stationId} - Conjunto ${index + 1}`);
                    polylineRefs.current.push(polyline);

                    // Añadir marcadores
                    const startMarker = L.marker([startLat, startLon], {
                        icon: L.divIcon({
                            className: `custom-marker ${stationId}`,
                            html: `<div></div>`,
                            iconSize: [24, 24]
                        })
                    })
                        .bindPopup(`Inicio ${stationId} - Conjunto ${id}<br>Lat: ${startLat.toFixed(6)}<br>Lon: ${startLon.toFixed(6)}`)
                        .addTo(mapRef.current);

                    const endMarker = L.marker([endLat, endLon], {
                        icon: L.divIcon({
                            className: `custom-marker ${stationId}-end`,
                            html: `<div></div>`,
                            iconSize: [24, 24]
                        })
                    })
                        .bindPopup(`Fin ${stationId} - Conjunto ${index + 1}<br>Lat: ${endLat.toFixed(6)}<br>Lon: ${endLon.toFixed(6)}`)
                        .addTo(mapRef.current);

                    markerRefs.current.push(startMarker, endMarker);
                });
            });

            observatory.forEach((obs) => {
                const { latitude, longitude } = obs;
                const marker = L.marker([latitude, longitude], {
                    icon: new L.Icon({
                        iconUrl: ('/antena4.png'),
                        iconSize: [25, 25],
                    }),
                })
                    .bindPopup(`Observatorio<br>Lat: ${latitude.toFixed(6)}<br>Lon: ${longitude.toFixed(6)}`)
                    .addTo(mapRef.current);

                markerRefs.current.push(marker);
            });

            // Añadir el observatorio al mapa
            const observatoryMarker = L.marker([lat, lon], {
                icon: L.divIcon({
                    className: 'custom-marker observatory',
                    html: `<div></div>`,
                    iconSize: [24, 24]
                })
            })
                .bindPopup(`Observatorio<br>Lat: ${lat.toFixed(6)}<br>Lon: ${lon.toFixed(6)}`)
                .addTo(mapRef.current);
            markerRefs.current.push(observatoryMarker);

            // Ajustar el zoom para mostrar todas las trayectorias
            if (polylineRefs.current.length > 0) {
                const group = new L.featureGroup(polylineRefs.current);
                mapRef.current.fitBounds(group.getBounds().pad(0.2));
            }
        }

        // Función de limpieza
        return () => {
            // No eliminar el mapa aquí, solo limpiar las referencias
            polylineRefs.current = [];
            markerRefs.current = [];
        };
    }, [data, lat, lon, zoom]);

    return <div ref={mapContainerRef} id="map" style={{ width: '100%', height: '100%', minHeight: '500px' }}></div>;
};

export default MultiMarkerMapChart;