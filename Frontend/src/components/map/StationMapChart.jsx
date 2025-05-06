import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const StationMapChart = ({ data, activePopUp, latitude = 36.7213, longitude = -4.4216, zoom = 11, useStatinIcon = false }) => {
  const { t } = useTranslation(['text']);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  const getMarkerColor = (state) => {
    switch (state) {
      case 0:
        return '/map-green.png';
      case 1:
        return '/map-yellow.png';
      case 2:
        return '/map-blue.png';
      default:
        return '/map-gray.png';
    }
  };

  useEffect(() => {
    const mapContainer = mapRef.current;

    // Check if the map container exists and the map instance hasn't been created yet
    if (mapContainer && !mapInstance.current) {
      const map = L.map(mapContainer).setView([latitude, longitude], zoom);
      mapInstance.current = map; // Store the map instance in the ref

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      data?.forEach((punto) => {
        const marker = L.marker([punto.latitude, punto.longitude], {
          icon: new L.Icon({
            iconUrl: (useStatinIcon ? '/antena.png' : getMarkerColor(punto.state)),
            iconSize: [25, 25],
          }),
        }).addTo(map);

        if (activePopUp) {
          marker.bindPopup(`
            <div>
              <h5>${t('STATION.STATION.NAME')}: ${punto.stationName} (${punto.name})</h5>
              <p>${t('STATION.STATION.DESCRIPTION')}: ${punto.description}</p>
              <p>${t('STATION.STATION.COORDINATES')}: ${punto.latitude.toString().substring(0, 8)}, ${punto.longitude.toString().substring(0, 8)}</p>
              <p> ${t('STATION.STATION.HEIGHT.TITLE')}: ${punto.height} ${t('STATION.STATION.HEIGHT.MEASURE')}</p>
              <p> ${t('STATION.STATION.CHIP.SIZE')}: ${punto.chipSize} , ${t('STATION.STATION.CHIP.ORIENTATION')}: ${punto.chipOrientation}</p>
              <p> ${t('STATION.STATION.FILTER')}: ${punto.filter} </p>
              <img src="/station/${punto.stationName}.webp" alt="Imagen" width="250" height="auto" />
            </div>
          `);
        }
      });
    } else if (mapInstance.current && (latitude !== mapInstance.current.getCenter().lat || longitude !== mapInstance.current.getCenter().lng || zoom !== mapInstance.current.getZoom())) {
      // If the map instance exists and the view parameters have changed, update the view
      mapInstance.current.setView([latitude, longitude], zoom);

      // You might also want to clear existing markers and re-add them if the data has changed significantly
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      data.forEach((punto) => {
        const marker = L.marker([punto.latitude, punto.longitude], {
          icon: new L.Icon({
            iconUrl: (useStatinIcon ? '/antena.png' : getMarkerColor(punto.state)),
            iconSize: [25, 25],
          }),
        }).addTo(mapInstance.current);

        if (activePopUp) {
          marker.bindPopup(`
            <div>
              <h5>${t('STATION.STATION.NAME')}: ${punto.stationName} (${punto.name})</h5>
              <p>${t('STATION.STATION.DESCRIPTION')}: ${punto.description}</p>
              <p>${t('STATION.STATION.COORDINATES')}: ${punto.latitude.toString().substring(0, 8)}, ${punto.longitude.toString().substring(0, 8)}</p>
              <p> ${t('STATION.STATION.HEIGHT.TITLE')}: ${punto.height} ${t('STATION.STATION.HEIGHT.MEASURE')}</p>
              <p> ${t('STATION.STATION.CHIP.SIZE')}: ${punto.chipSize} , ${t('STATION.STATION.CHIP.ORIENTATION')}: ${punto.chipOrientation}</p>
              <p> ${t('STATION.STATION.FILTER')}: ${punto.filter} </p>
              <img src="/station/${punto.stationName}.webp" alt="Imagen" width="250" height="auto" />
            </div>
          `);
        }
      });
    }

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null; // Reset the ref
      }
    };
  }, [data, activePopUp, latitude, longitude, zoom, navigate, t, useStatinIcon]);

  return <div id="map2" style={{ width: '100%', height: '800px' }} ref={mapRef}></div>;
};

export default StationMapChart;