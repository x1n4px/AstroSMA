import { useNavigate } from "react-router-dom";
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const MapChart = ({ data, stations, activePopUp = true }) => {
    const navigate = useNavigate();

    // Calcular el punto medio y el zoom usando useMemo
    const { centerLat, centerLon, zoom } = useMemo(() => {
        if (!data || data.length === 0) {
            return { centerLat: 40.4165, centerLon: -3.70256, zoom: 11 };
        }

        let sumLat = 0;
        let sumLon = 0;
        let maxDist = 0;

        for (let i = 0; i < data.length; i++) {
            sumLat += data[i].lat;
            sumLon += data[i].lon;

            for (let j = i + 1; j < data.length; j++) {
                const dist = L.latLng(data[i].lat, data[i].lon).distanceTo(L.latLng(data[j].lat, data[j].lon));
                maxDist = Math.max(maxDist, dist);
            }
        }

        const centerLat = sumLat / data.length;
        const centerLon = sumLon / data.length;

        let zoomLevel = 11; // Zoom predeterminado

        if (maxDist < 100000) { // 100 km
            zoomLevel = 9;
        } else if (maxDist < 500000) { // 500 km
            zoomLevel = 7;
        } else if (maxDist < 1000000) { // 1000 km
            zoomLevel = 6;
        } else {
            zoomLevel = 5;
        }

        return { centerLat, centerLon, zoom: zoomLevel };
    }, [data]);

     const polylinePoints = data.map((punto) => [punto.lat, punto.lon]);

    // Crear un array de segmentos de Polyline con colores basados en la pendiente
    const polylineSegments = useMemo(() => {
        if (!data || data.length < 2) return [];

        const segments = [];
        for (let i = 0; i < data.length - 1; i++) {
            const start = data[i];
            const end = data[i + 1];
            const heightDiff = end.height - start.height;

            let color = 'blue'; // Color predeterminado
            if (heightDiff > 0) {
                color = 'green'; // Pendiente ascendente
            } else if (heightDiff < 0) {
                color = 'red'; // Pendiente descendente
            }

            segments.push({
                positions: [[start.lat, start.lon], [end.lat, end.lon]],
                color: color,
            });
        }
        return segments;
    }, [data]);

    return (
        <MapContainer center={[centerLat, centerLon]} zoom={zoom} style={{ width: '100%', height: '500px' }} scrollWheelZoom={false} >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Polyline para conectar los puntos con colores basados en la pendiente */}
            {polylineSegments.map((segment, index) => (
                <Polyline key={index} positions={segment.positions} color={segment.color} />
            ))}
            {/* Marcadores de datos */}
            {data.map((punto, index) => (
                <Marker
                    key={index}
                    position={[punto.lat, punto.lon]}
                    icon={new L.Icon({ iconUrl: 'asteroide.png', iconSize: [25, 25] })}
                >
                    {activePopUp && (
                        <Popup>
                            <div>
                                <p>Altura: {punto.height}km</p>
                            </div>
                        </Popup>
                    )}
                </Marker>
            ))}
            {/* Marcadores de estaciones (verdes) */}
            {stations.map((station, index) => (
                <Marker
                    key={index}
                    position={[station.lat, station.lon]}
                    icon={new L.Icon({ 
                        iconUrl: 'antena.png', // Puedes cambiar el icono si lo deseas
                        iconSize: [25, 25],
                        iconAnchor: [12, 25], // Ajustar el ancla para que la punta del icono apunte a la ubicación
                    })}
                >
                    {activePopUp && (
                        <Popup>
                            <div>
                                <p>{station.title}</p> {/* Mostrar el título de la estación en el Popup */}
                            </div>
                        </Popup>
                    )}
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapChart;