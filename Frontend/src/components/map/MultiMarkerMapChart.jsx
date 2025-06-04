import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MultiMarkerMapChart = ({ data, observatory = [], lat = 40.4168, lon = -3.7038, zoom = 6, eminHeight=500 }) => {
    const mapRef = useRef(null);
    const polylineRefs = useRef([]);
    const markerRefs = useRef([]);
    const mapContainerRef = useRef(null);

    useEffect(() => {
        if (!data || data.length === 0) {
            return;
        }

        if (!mapRef.current && mapContainerRef.current) {
            const map = L.map(mapContainerRef.current).setView([lat, lon], zoom);
            mapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
            }).addTo(map);
        }

        if (mapRef.current) {
            polylineRefs.current.forEach(polyline => polyline.remove());
            markerRefs.current.forEach(marker => marker.remove());
            polylineRefs.current = [];
            markerRefs.current = [];

            data.forEach((trajectorySet, index) => {
                Object.entries(trajectorySet).forEach(([stationId, stationData]) => {
                    const { start, end, id } = stationData;

                    const startLat = parseFloat(start.latitude);
                    const startLon = parseFloat(start.longitude);
                    const endLat = parseFloat(end.latitude);
                    const endLon = parseFloat(end.longitude);

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

                    // --- Modificación aquí para el botón en el popup de la polilínea ---
                    const polylinePopupContent = `
                        <button onclick="window.location.href='/report/${id}'">Ver Reporte</button>
                    `;
                    polyline.bindPopup(polylinePopupContent);
                    // -------------------------------------------------------------------

                    polylineRefs.current.push(polyline);

                    const startMarker = L.marker([startLat, startLon], {
                        icon: L.divIcon({
                            className: `custom-marker ${stationId}`,
                            html: `<div></div>`,
                            iconSize: [24, 24]
                        })
                    }).addTo(mapRef.current);

                    // --- Modificación aquí para el botón en el popup del marcador de inicio ---
                    const startMarkerPopupContent = `
                        Inicio <br>
                        Lat: ${startLat.toFixed(6)}<br>
                        Lon: ${startLon.toFixed(6)}<br>
                        <button onclick="window.location.href='/report/${id}'">Ver Reporte</button>
                    `;
                    startMarker.bindPopup(startMarkerPopupContent);
                    // --------------------------------------------------------------------------

                    const endMarker = L.marker([endLat, endLon], {
                        icon: L.divIcon({
                            className: `custom-marker ${stationId}-end`,
                            html: `<div></div>`,
                            iconSize: [24, 24]
                        })
                    }).addTo(mapRef.current);

                    // --- Modificación aquí para el botón en el popup del marcador final ---
                    const endMarkerPopupContent = `
                        Fin <br>
                        Lat: ${endLat.toFixed(6)}<br>
                        Lon: ${endLon.toFixed(6)}<br>
                        <button onclick="window.location.href='/report/${id}'">Ver Reporte</button>
                    `;
                    endMarker.bindPopup(endMarkerPopupContent);
                    // -----------------------------------------------------------------------

                    markerRefs.current.push(startMarker, endMarker);
                });
            });

            observatory?.forEach((obs) => {
                const { latitude, longitude } = obs;
                const marker = L.marker([latitude, longitude], {
                    icon: new L.Icon({
                        iconUrl: ('/antena4.png'),
                        iconSize: [25, 25],
                    }),
                }).addTo(mapRef.current);

                // --- Modificación aquí para el botón en el popup del observatorio ---
                const observatoryPopupContent = `
                    Observatorio<br>
                    Lat: ${latitude.toFixed(6)}<br>
                    Lon: ${longitude.toFixed(6)}<br>
                    <button onclick="window.location.href='/observatory-report/${latitude}-${longitude}'">Ver Reporte del Observatorio</button>
                `;
                marker.bindPopup(observatoryPopupContent);
                // -------------------------------------------------------------------

                markerRefs.current.push(marker);
            });

            // Añadir el observatorio principal al mapa (si es diferente de los observatorios del array)
            // Considera si este marcador es realmente necesario si ya estás iterando sobre `observatory`
            const mainObservatoryMarker = L.marker([lat, lon], {
                icon: L.divIcon({
                    className: 'custom-marker observatory',
                    html: `<div></div>`,
                    iconSize: [24, 24]
                })
            }).addTo(mapRef.current);

            // --- Modificación aquí para el botón en el popup del observatorio principal ---
            const mainObservatoryPopupContent = `
                Observatorio Principal<br>
                Lat: ${lat.toFixed(6)}<br>
                Lon: ${lon.toFixed(6)}<br>
                <button onclick="window.location.href='/main-observatory-report'">Ver Reporte Principal</button>
            `;
            mainObservatoryMarker.bindPopup(mainObservatoryPopupContent);
            // ----------------------------------------------------------------------------
            markerRefs.current.push(mainObservatoryMarker);


            if (polylineRefs.current.length > 0) {
                const group = new L.featureGroup(polylineRefs.current);
                mapRef.current.fitBounds(group.getBounds().pad(0.2));
            }
        }

        return () => {
            polylineRefs.current = [];
            markerRefs.current = [];
        };
    }, [data, lat, lon, zoom, observatory]); // Añadido 'observatory' a las dependencias

    return <div ref={mapContainerRef} id="map" style={{ width: '100%', height: '100%', minHeight: eminHeight }}></div>;
};

export default MultiMarkerMapChart;