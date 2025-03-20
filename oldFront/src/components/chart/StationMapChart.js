import { useNavigate } from "react-router-dom";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const MapChart = ({ data, activePopUp, lat = 36.7213, lon = -4.4216 , zoom = 11 }) => {

    const navigate = useNavigate();

    // Función para determinar el color del marcador según el estado
    const getMarkerColor = (state) => {
        switch (state) {
            case 0:
                return '/map-green.png';  // Verde para state = 0
            case 1:
                return '/map-yellow.png';    // Rojo para state = 1
            case 2:
                return '/map-blue.png';   // Azul para state = 2
            default:
                return 'gray';   // Color por defecto
        }
    };

    return (
        <MapContainer center={[lat, lon]} zoom={[zoom]} style={{ width: '100%', height: '800px' }} scrollWheelZoom={false}  >
            {/* Capa base del mapa (Mapa de OpenStreetMap) */}
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Marcadores */}
            {data.map((punto, index) => (
                <Marker
                    key={index}
                    position={[punto.lat, punto.lon]}
                    icon={new L.Icon({
                        iconUrl: `${getMarkerColor(punto.state)}`,
                        iconSize: [25, 25],
                        iconColor: getMarkerColor(punto.state)  // Cambiar el color del icono según el estado
                    })}
                >
                    {activePopUp && (
                        <Popup>
                            <div>
                                <p>{punto.title}</p>
                                <p>{punto.lat}, {punto.lon}</p>
                            </div>
                        </Popup>
                    )}
                </Marker>
            ))}
        </MapContainer>
    );
}

export default MapChart;
