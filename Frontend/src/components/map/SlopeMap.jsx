import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SlopeMap = ({ startPoint, endPoint, observatory, secondStartPoint, secondEndPoint }) => {
    console.log(observatory);
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
        const φ1 = parseFloat(startPoint.lat) * Math.PI / 180;
        const φ2 = parseFloat(endPoint.lat) * Math.PI / 180;
        const Δφ = (parseFloat(endPoint.lat) - parseFloat(startPoint.lat)) * Math.PI / 180;
        const Δλ = (parseFloat(endPoint.lng) - parseFloat(startPoint.lng)) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const calculatedDistance = R * c;
        setDistance(calculatedDistance);

        const elevationDifference = parseFloat(endPoint.elevation) - parseFloat(startPoint.elevation);
        const calculatedSlope = (elevationDifference / calculatedDistance) * 100;
        setSlope(calculatedSlope);

        const calculatedSlopeAngle = Math.atan(elevationDifference / calculatedDistance) * (180 / Math.PI);
        setSlopeAngle(calculatedSlopeAngle);

        const numPoints = 10;
        const profile = Array.from({ length: numPoints + 1 }, (_, i) => {
            const fraction = i / numPoints;
            const lat = parseFloat(startPoint.lat) + fraction * (parseFloat(endPoint.lat) - parseFloat(startPoint.lat));
            const lng = parseFloat(startPoint.lng) + fraction * (parseFloat(endPoint.lng) - parseFloat(startPoint.lng));
            const elevation = parseFloat(startPoint.elevation) + fraction * (parseFloat(endPoint.elevation) - parseFloat(startPoint.elevation));
            const dist = fraction * calculatedDistance;
            return { distance: dist, elevation: elevation };
        });
        setElevationProfile(profile);
    };

    const chartData = {
        labels: elevationProfile.map(point => `${point.distance.toFixed(2)} km`),
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
                        return `Elevación: ${context.raw} km`;
                    },
                },
            },
        },
        scales: {
            y: {
                title: {
                    display: true,
                    text: 'Elevación (km)',
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
        iconUrl: '/opacityOff.webp',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    const endIcon = new L.Icon({
        iconUrl: '/opacityOff.webp',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    const observatoryIcon = new L.Icon({
        iconUrl: '/antena.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    return (
        <div className="slope-map-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 2 }}>
                <MapContainer
                    center={startPoint ? [parseFloat(startPoint.lat), parseFloat(startPoint.lng)] : [0, 0]}
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
                                    [parseFloat(startPoint.lat), parseFloat(startPoint.lng)],
                                    [parseFloat(endPoint.lat), parseFloat(endPoint.lng)],
                                ]}
                                color="blue"
                            />
                            <Marker position={[parseFloat(startPoint.lat), parseFloat(startPoint.lng)]} icon={startIcon}>
                                <Popup>
                                    <div>
                                        <h4>Punto de Inicio</h4>
                                        <p>Lat: {startPoint.lat}</p>
                                        <p>Lng: {startPoint.lng}</p>
                                        <p>Elevación: {startPoint.elevation} m</p>
                                    </div>
                                </Popup>
                            </Marker>
                            <Marker position={[parseFloat(endPoint.lat), parseFloat(endPoint.lng)]} icon={endIcon}>
                                <Popup>
                                    <div>
                                        <h4>Punto Final</h4>
                                        <p>Lat: {endPoint.lat}</p>
                                        <p>Lng: {endPoint.lng}</p>
                                        <p>Elevación: {endPoint.elevation} m</p>
                                        <p>Distancia: {(distance / 1000).toFixed(2)} km</p>
                                        <p>Pendiente: {slope.toFixed(2)}% ({slopeAngle.toFixed(2)}°)</p>
                                    </div>
                                </Popup>
                            </Marker>
                        </>
                    )}
                    {secondStartPoint && secondEndPoint && (
                        <>
                            <Polyline
                                positions={[
                                    [parseFloat(secondStartPoint.lat), parseFloat(secondStartPoint.lng)],
                                    [parseFloat(secondEndPoint.lat), parseFloat(secondEndPoint.lng)],
                                ]}
                                color="orange"
                                dashArray="5, 10" // Dotted Line
                            />
                            <Marker position={[parseFloat(secondStartPoint.lat), parseFloat(secondStartPoint.lng)]} icon={startIcon}>
                                <Popup>
                                    <div>
                                        <h4>Segundo Punto de Inicio</h4>
                                        <p>Lat: {secondStartPoint.lat}</p>
                                        <p>Lng: {secondStartPoint.lng}</p>
                                        <p>Elevación: {secondStartPoint.elevation} m</p>
                                    </div>
                                </Popup>
                            </Marker>
                            <Marker position={[parseFloat(secondEndPoint.lat), parseFloat(secondEndPoint.lng)]} icon={endIcon}>
                                <Popup>
                                    <div>
                                        <h4>Segundo Punto Final</h4>
                                        <p>Lat: {secondEndPoint.lat}</p>
                                        <p>Lng: {secondEndPoint.lng}</p>
                                        <p>Elevación: {secondEndPoint.elevation} m</p>
                                    </div>
                                </Popup>
                            </Marker>
                        </>
                    )}
                    {observatory && observatory.map((station, index) => (
                        <Marker key={index} position={[parseFloat(station.latitude), parseFloat(station.longitude)]} icon={observatoryIcon}>
                            <Popup>
                                <div>
                                    <h4>Estación del Observatorio {index + 1}</h4>
                                    <p>Lat: {station.latitude}</p>
                                    <p>Lng: {station.longitude}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

        </div>
    );
};

export default SlopeMap;