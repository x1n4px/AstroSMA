import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SlopeMap = ({ startPoint, endPoint }) => {
    const [distance, setDistance] = useState(0);
    const [slope, setSlope] = useState(0);
    const [slopeAngle, setSlopeAngle] = useState(0);
    const [elevationProfile, setElevationProfile] = useState([]);
    const mapRef = useRef(0);

    useEffect(() => {
        calculateMetrics();
    }, [startPoint, endPoint]);

    const calculateMetrics = () => {
        if (!startPoint || !endPoint) {
            setDistance(0);
            setSlope(0);
            setSlopeAngle(0);
            setElevationProfile([]);
            return;
        }

        const R = 6371e3;
        const φ1 = startPoint.lat * Math.PI / 180;
        const φ2 = endPoint.lat * Math.PI / 180;
        const Δφ = (endPoint.lat - startPoint.lat) * Math.PI / 180;
        const Δλ = (endPoint.lng - startPoint.lng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const calculatedDistance = R * c;
        setDistance(calculatedDistance);

        const elevationDifference = endPoint.elevation - startPoint.elevation;
        const calculatedSlope = (elevationDifference / calculatedDistance) * 100;
        setSlope(calculatedSlope);

        const calculatedSlopeAngle = Math.atan(elevationDifference / calculatedDistance) * (180 / Math.PI);
        setSlopeAngle(calculatedSlopeAngle);

        const numPoints = 10;
        const profile = Array.from({ length: numPoints + 1 }, (_, i) => {
            const fraction = i / numPoints;
            const lat = startPoint.lat + fraction * (endPoint.lat - startPoint.lat);
            const lng = startPoint.lng + fraction * (endPoint.lng - startPoint.lng);
            const elevation = startPoint.elevation + fraction * (endPoint.elevation - startPoint.elevation);
            const dist = fraction * calculatedDistance;
            return { distance: dist, elevation: elevation };
        });
        setElevationProfile(profile);
    };

    const chartData = {
        labels: elevationProfile.map(point => `${(point.distance / 1000).toFixed(1)} km`),
        datasets: [
            {
                label: 'Perfil de Elevación',
                data: elevationProfile.map(point => point.elevation),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: `Perfil de Elevación - Pendiente`,
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return `Elevación: ${context.raw} m`;
                    },
                },
            },
        },
        scales: {
            y: {
                title: {
                    display: true,
                    text: 'Elevación (metros)',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Distancia (km)',
                },
            },
        },
    };

    const startIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    const endIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    return (
        <div className="slope-map-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 2 }}>
                <MapContainer
                    center={startPoint ? [startPoint.lat, startPoint.lng] : [0, 0]}
                    zoom={8}
                    style={{ height: '500px', width: '100%' }}
                    ref={mapRef}
                >
                    {startPoint && endPoint && (
                        <>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Polyline
                                positions={[
                                    [startPoint.lat, startPoint.lng],
                                    [endPoint.lat, endPoint.lng],
                                ]}
                                color="blue"
                            />
                            <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon}>
                                <Popup>
                                    <div>
                                        <h4>Punto de Inicio</h4>
                                        <p>Lat: {startPoint.lat.toFixed(6)}</p>
                                        <p>Lng: {startPoint.lng.toFixed(6)}</p>
                                        <p>Elevación: {startPoint.elevation.toFixed(1)} m</p>
                                    </div>
                                </Popup>
                            </Marker>
                            <Marker position={[endPoint.lat, endPoint.lng]} icon={endIcon}>
                                <Popup>
                                    <div>
                                        <h4>Punto Final</h4>
                                        <p>Lat: {endPoint.lat.toFixed(6)}</p>
                                        <p>Lng: {endPoint.lng.toFixed(6)}</p>
                                        <p>Elevación: {endPoint.elevation.toFixed(1)} m</p>
                                        <p>Distancia: {(distance / 1000).toFixed(2)} km</p>
                                        <p>Pendiente: {slope.toFixed(2)}% ({slopeAngle.toFixed(2)}°)</p>
                                    </div>
                                </Popup>
                            </Marker>
                        </>
                    )}
                </MapContainer>
            </div>
            <div style={{ flex: 1, padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ flex: 1, marginRight: '10px' }}>
                        <h3>Información de la Ruta</h3>
                        <p><strong>Distancia:</strong> {(distance / 1000).toFixed(2)} km</p>
                        <p><strong>Diferencia de elevación:</strong> {((endPoint.elevation - startPoint.elevation)/1000).toFixed(1)} Km</p>
                        <p><strong>Pendiente promedio:</strong> {slope.toFixed(2)}%</p>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3>Clasificación de Pendiente</h3>
                        <p>
                            {Math.abs(slope) < 2 ? 'Plano' :
                                Math.abs(slope) < 5 ? 'Suave' :
                                    Math.abs(slope) < 10 ? 'Moderado' :
                                        Math.abs(slope) < 15 ? 'Empinado' : 'Muy empinado'}
                        </p>
                        <p>
                            {slope > 0 ? 'Subida' : 'Bajada'}
                        </p>
                    </div>
                </div>
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default SlopeMap;