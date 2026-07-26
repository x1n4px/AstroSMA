import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import {
  formatResolution,
  formatSexagesimalDisplay,
  sortStationsByObservatoryAndId,
} from '@/utils/stationDisplay';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCoordinateValue(station, primaryKey, fallbackKey) {
  if (station && station[primaryKey] !== undefined && station[primaryKey] !== null && station[primaryKey] !== '') {
    return station[primaryKey];
  }

  return station?.[fallbackKey];
}

function getGroupLabel(point) {
  return point?.stationName || point?.title || point?.name || point?.id || '-';
}

function groupStationsByObservatory(points) {
  const groups = new Map();

  points.forEach((point) => {
    const groupKey = getGroupLabel(point);
    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        stationName: point.stationName || point.title || point.name || point.id,
        latitude: point.latitude,
        longitude: point.longitude,
        latitudeSexagesimal: point.latitudeSexagesimal,
        longitudeSexagesimal: point.longitudeSexagesimal,
        height: point.height,
        credit: point.credit,
        state: point.state,
        stations: [point],
      });
      return;
    }

    groups.get(groupKey).stations.push(point);
  });

  return Array.from(groups.values())
    .sort((left, right) => String(left.stationName ?? '').localeCompare(String(right.stationName ?? ''), 'es', {
      ignorePunctuation: true,
      numeric: true,
      sensitivity: 'base',
    }))
    .map((group) => ({
      ...group,
      stations: [...group.stations].sort(sortStationsByObservatoryAndId),
    }));
}

const StationMapChart = ({
  data,
  activePopUp,
  latitude,
  longitude,
  lat,
  lon,
  zoom = 11,
  useStatinIcon = false,
  height = 800,
}) => {
  const { t } = useTranslation(['text']);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const resolvedLatitude = Number.isFinite(Number(latitude))
    ? Number(latitude)
    : (Number.isFinite(Number(lat)) ? Number(lat) : 36.7213);
  const resolvedLongitude = Number.isFinite(Number(longitude))
    ? Number(longitude)
    : (Number.isFinite(Number(lon)) ? Number(lon) : -4.4216);

  const hasCoordinate = (coordinate) => coordinate !== null
    && coordinate !== undefined
    && coordinate !== ''
    && Number.isFinite(Number(coordinate));

  const hasValidCoordinates = (station) => (
    hasCoordinate(getCoordinateValue(station, 'latitude', 'lat'))
    && hasCoordinate(getCoordinateValue(station, 'longitude', 'lon'))
  );

  const formatDecimalCoordinate = (coordinate) => {
    const numericCoordinate = Number(coordinate);
    return Number.isFinite(numericCoordinate) ? numericCoordinate.toFixed(6) : '-';
  };

  const getMarkerColor = (state) => {
    switch (state) {
      case 0:
        return '/map-yellow.png';
      case 1:
        return '/map-green.png';
      case 2:
        return '/map-blue.png';
      default:
        return '/map-gray.png';
    }
  };

  const buildPopupHtml = (group) => {
    const representative = group.stations[0] || group;
    const observableName = escapeHtml(group.stationName || '-');
    const latitudeText = escapeHtml(
      formatSexagesimalDisplay(representative.latitudeSexagesimal)
      === '-'
        ? formatDecimalCoordinate(getCoordinateValue(representative, 'latitude', 'lat'))
        : formatSexagesimalDisplay(representative.latitudeSexagesimal)
    );
    const longitudeText = escapeHtml(
      formatSexagesimalDisplay(representative.longitudeSexagesimal)
      === '-'
        ? formatDecimalCoordinate(getCoordinateValue(representative, 'longitude', 'lon'))
        : formatSexagesimalDisplay(representative.longitudeSexagesimal)
    );
    const altitudeText = escapeHtml(group.height ?? representative.height ?? '-');
    const creditsText = escapeHtml(group.credit || representative.credit || '-');
    const resolutionItems = group.stations
      .filter((station) => station.chipSize !== undefined || station.chipOrientation !== undefined)
      .map((station) => {
        const resolution = station.resolution || formatResolution(station.chipSize, station.chipOrientation);
        if (!resolution || resolution === '-') {
          return '';
        }

        return `<li><strong>${t('STATION.STATION.RESOLUTION')} ${escapeHtml(station.id)}:</strong> ${escapeHtml(resolution)}</li>`;
      })
      .filter(Boolean)
      .join('');

    return `
      <div class="station-popup">
        <h5>${t('STATION.STATION.NAME')}: ${observableName}</h5>
        <p>${t('STATION.STATION.COORDINATES')}: ${latitudeText}, ${longitudeText}</p>
        <p>${t('STATION.STATION.ALTITUDE')}: ${altitudeText} ${t('STATION.STATION.HEIGHT.MEASURE')}</p>
        <p>${t('STATION.STATION.CREDITS')}: ${creditsText}</p>
        ${resolutionItems ? `<ul class="mb-2 ps-3">${resolutionItems}</ul>` : ''}
      </div>
    `;
  };

  const buildMarkers = (map, stations) => {
    const groupedStations = groupStationsByObservatory(stations.filter(hasValidCoordinates));

    groupedStations.forEach((group) => {
      const markerStation = group.stations.find((station) => station.state === 1) || group.stations[0];
      const markerLatitude = Number(getCoordinateValue(markerStation, 'latitude', 'lat'));
      const markerLongitude = Number(getCoordinateValue(markerStation, 'longitude', 'lon'));

      const marker = L.marker([markerLatitude, markerLongitude], {
        icon: new L.Icon({
          iconUrl: (useStatinIcon ? '/antena.png' : getMarkerColor(markerStation.state)),
          iconSize: [25, 25],
        }),
      }).addTo(map);

      if (activePopUp) {
        marker.bindPopup(buildPopupHtml(group));
      }
    });
  };

  useEffect(() => {
    const mapContainer = mapRef.current;

    // Check if the map container exists and the map instance hasn't been created yet
    if (mapContainer && !mapInstance.current) {
      const map = L.map(mapContainer).setView([resolvedLatitude, resolvedLongitude], zoom);
      mapInstance.current = map; // Store the map instance in the ref

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      buildMarkers(map, data || []);
    } else if (mapInstance.current && (resolvedLatitude !== mapInstance.current.getCenter().lat || resolvedLongitude !== mapInstance.current.getCenter().lng || zoom !== mapInstance.current.getZoom())) {
      // If the map instance exists and the view parameters have changed, update the view
      mapInstance.current.setView([resolvedLatitude, resolvedLongitude], zoom);

      // You might also want to clear existing markers and re-add them if the data has changed significantly
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      buildMarkers(mapInstance.current, data || []);
    }

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null; // Reset the ref
      }
    };
  }, [data, activePopUp, resolvedLatitude, resolvedLongitude, zoom, t, useStatinIcon]);

  return <div id="map2" style={{ width: '100%', height }} ref={mapRef}></div>;
};

export default StationMapChart;
