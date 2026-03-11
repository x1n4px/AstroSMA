import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-bootstrap";
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API_ENDPOINTS, buildQueryUrl, fetchApi } from "../config/api";

import "./InteractiveMap.css";

const DEFAULT_CENTER = [39.5, -0.5];
const DEFAULT_ZOOM = 7;
const TRAJECTORY_ZOOM = 9;

const createMarkerIcon = variant =>
    L.divIcon({
        className: `workflow-leaflet-icon workflow-leaflet-icon-${variant}`,
        html: "<span></span>",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -12]
    });

const MARKER_ICONS = {
    observatory: createMarkerIcon("observatory"),
    start: createMarkerIcon("start"),
    end: createMarkerIcon("end")
};

const parseCoordinate = coord => {
    if (typeof coord === "string") {
        const dmsColon = coord.match(/^([+-]?)(\d+):(\d+):([\d.]+)$/);
        const dmsSpace = coord.match(/^([+-]?\d+)(?: ([+-]?\d+)(?: ([+-]?\d+(\.\d+)?))?)?$/);

        if (dmsColon) {
            const [, sign, deg, min, sec] = dmsColon;
            const multiplier = sign === "-" ? -1 : 1;
            return multiplier * (parseInt(deg, 10) + parseInt(min, 10) / 60 + parseFloat(sec) / 3600);
        }

        if (dmsSpace) {
            const [, deg, min, sec] = dmsSpace;
            const sign = deg.startsWith("-") ? -1 : 1;
            const absDeg = Math.abs(parseFloat(deg));
            const absMin = min ? Math.abs(parseFloat(min)) : 0;
            const absSec = sec ? Math.abs(parseFloat(sec)) : 0;
            return sign * (absDeg + absMin / 60 + absSec / 3600);
        }

        if (!Number.isNaN(Number(coord))) {
            return parseFloat(coord);
        }
    }

    return coord;
};

const parseTrajectoryPoint = pointValue => {
    if (!pointValue) {
        return null;
    }

    try {
        if (typeof pointValue === "string") {
            if (pointValue.includes(",")) {
                const parts = pointValue.split(",");
                if (parts.length >= 2) {
                    return {
                        lat: parseFloat(parts[1].trim()),
                        lng: parseFloat(parts[0].trim()),
                        alt: parts.length > 2 ? parseFloat(parts[2].trim()) : undefined
                    };
                }
            }

            if (pointValue.includes(" ")) {
                const parts = pointValue.trim().split(/\s+/);
                if (parts.length >= 2) {
                    return {
                        lat: parseFloat(parts[1]),
                        lng: parseFloat(parts[0]),
                        alt: parts.length > 2 ? parseFloat(parts[2]) : undefined
                    };
                }
            }

            if (pointValue.includes(":")) {
                const coord = parseCoordinate(pointValue);
                if (!Number.isNaN(coord)) {
                    return null;
                }
            }
        }

        if (typeof pointValue === "object" && pointValue.lat !== undefined && pointValue.lng !== undefined) {
            return {
                lat: parseFloat(pointValue.lng),
                lng: parseFloat(pointValue.lat),
                alt: pointValue.alt ? parseFloat(pointValue.alt) : undefined
            };
        }
    } catch (error) {
        console.error("Error parsing trajectory point:", error);
    }

    return null;
};

const MapViewportController = ({ positions }) => {
    const map = useMap();

    useEffect(() => {
        if (!positions.length) {
            map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: false });
            return;
        }

        if (positions.length === 1) {
            map.setView(positions[0], TRAJECTORY_ZOOM, { animate: false });
            return;
        }

        map.fitBounds(L.latLngBounds(positions), {
            padding: [36, 36],
            animate: false
        });
    }, [map, positions]);

    return null;
};

export default function InteractiveMap({ selectedMeteorData }) {
    const [meteorObservatories, setMeteorObservatories] = useState([]);
    const [meteorTrajectory, setMeteorTrajectory] = useState(null);
    const [loading, setLoading] = useState(false);

    const meteorId = selectedMeteorData?.identifier || selectedMeteorData?.Identificador;

    useEffect(() => {
        if (!meteorId) {
            setMeteorObservatories([]);
            setMeteorTrajectory(null);
            return;
        }

        const loadMeteorData = async () => {
            setLoading(true);
            setMeteorTrajectory(null);

            try {
                const observatoriesQuery = `SELECT DISTINCT o.\`Número\` as Numero, o.Nombre_Observatorio, o.Latitud_Sexagesimal, o.Longitud_Sexagesimal FROM Observatorio o WHERE o.\`Número\` IN (SELECT iz.\`Observatorio_Número\` FROM Informe_Z iz WHERE iz.Meteoro_Identificador = ${meteorId} UNION SELECT iz.\`Observatorio_Número2\` FROM Informe_Z iz WHERE iz.Meteoro_Identificador = ${meteorId} AND iz.\`Observatorio_Número2\` IS NOT NULL UNION SELECT ir.\`Observatorio_Número\` FROM Informe_Radiante ir WHERE ir.Meteoro_Identificador = ${meteorId})`;
                const observatoriesResponse = await fetchApi(
                    buildQueryUrl(API_ENDPOINTS.workflows.runQuery, { query: observatoriesQuery })
                );

                if (observatoriesResponse.ok) {
                    const observatories = await observatoriesResponse.json();
                    setMeteorObservatories(Array.isArray(observatories) ? observatories : []);
                } else {
                    setMeteorObservatories([]);
                }

                const trajectoryQuery = `
                    SELECT 
                        iz.Inicio_de_la_trayectoria_Estacion_1,
                        iz.Fin_de_la_trayectoria_Estacion_1,
                        iz.Inicio_de_la_trayectoria_Estacion_2,
                        iz.Fin_de_la_trayectoria_Estacion_2,
                        te.Alt_Inicio,
                        te.Alt_Final
                    FROM Informe_Z iz
                    LEFT JOIN Informe_Radiante ir ON iz.Meteoro_Identificador = ir.Meteoro_Identificador
                    LEFT JOIN Trayectoria_estimada te ON ir.Identificador = te.Informe_Radiante_Identificador
                    WHERE iz.Meteoro_Identificador = ${meteorId}
                `;
                const trajectoryResponse = await fetchApi(
                    buildQueryUrl(API_ENDPOINTS.workflows.runQuery, { query: trajectoryQuery })
                );

                if (!trajectoryResponse.ok) {
                    setMeteorTrajectory(null);
                    return;
                }

                const trajectoryRows = await trajectoryResponse.json();
                if (!Array.isArray(trajectoryRows) || trajectoryRows.length === 0) {
                    setMeteorTrajectory(null);
                    return;
                }

                const trajectoryRow = trajectoryRows[0];
                const candidates = [
                    [trajectoryRow.Inicio_de_la_trayectoria_Estacion_1, trajectoryRow.Fin_de_la_trayectoria_Estacion_1],
                    [trajectoryRow.Inicio_de_la_trayectoria_Estacion_2, trajectoryRow.Fin_de_la_trayectoria_Estacion_2]
                ];

                let parsedTrajectory = null;

                for (const [startValue, endValue] of candidates) {
                    const startPoint = parseTrajectoryPoint(startValue);
                    const endPoint = parseTrajectoryPoint(endValue);

                    if (startPoint && endPoint) {
                        if (trajectoryRow.Alt_Inicio !== null) {
                            startPoint.alt = parseFloat(trajectoryRow.Alt_Inicio);
                        }
                        if (trajectoryRow.Alt_Final !== null) {
                            endPoint.alt = parseFloat(trajectoryRow.Alt_Final);
                        }

                        parsedTrajectory = { start: startPoint, end: endPoint };
                        break;
                    }
                }

                setMeteorTrajectory(parsedTrajectory);
            } catch (error) {
                console.error("Error loading meteor map data:", error);
                setMeteorObservatories([]);
                setMeteorTrajectory(null);
            } finally {
                setLoading(false);
            }
        };

        loadMeteorData();
    }, [meteorId]);

    const observatoryMarkers = useMemo(
        () =>
            meteorId
                ? meteorObservatories
                      .map(obs => {
                          const lat = parseCoordinate(obs.Longitud_Sexagesimal);
                          const lng = parseCoordinate(obs.Latitud_Sexagesimal);

                          if (Number.isNaN(lat) || Number.isNaN(lng)) {
                              return null;
                          }

                          return {
                              key: `obs-${obs.Numero}`,
                              kind: "observatory",
                              position: [lat, lng],
                              label: obs.Nombre_Observatorio
                          };
                      })
                      .filter(Boolean)
                : [],
        [meteorId, meteorObservatories]
    );

    const { trajectoryMarkers, linePath } = useMemo(() => {
        if (!meteorTrajectory?.start || !meteorTrajectory?.end) {
            return { trajectoryMarkers: [], linePath: [] };
        }

        const coordinateDistance = Math.sqrt(
            Math.pow(meteorTrajectory.start.lat - meteorTrajectory.end.lat, 2) +
                Math.pow(meteorTrajectory.start.lng - meteorTrajectory.end.lng, 2)
        );
        const offsetAmount = coordinateDistance < 0.01 ? 0.005 : 0;

        return {
            trajectoryMarkers: [
                {
                    key: "trajectory-start",
                    kind: "start",
                    position: [meteorTrajectory.start.lat - offsetAmount, meteorTrajectory.start.lng - offsetAmount],
                    label: "Inicio",
                    alt: meteorTrajectory.start.alt
                },
                {
                    key: "trajectory-end",
                    kind: "end",
                    position: [meteorTrajectory.end.lat + offsetAmount, meteorTrajectory.end.lng + offsetAmount],
                    label: "Final",
                    alt: meteorTrajectory.end.alt
                }
            ],
            linePath: [
                [meteorTrajectory.start.lat, meteorTrajectory.start.lng],
                [meteorTrajectory.end.lat, meteorTrajectory.end.lng]
            ]
        };
    }, [meteorTrajectory]);

    const allPositions = useMemo(
        () => [
            ...observatoryMarkers.map(marker => marker.position),
            ...trajectoryMarkers.map(marker => marker.position),
            ...linePath
        ],
        [linePath, observatoryMarkers, trajectoryMarkers]
    );

    return (
        <div className="interactive-map-container">
            <div className="interactive-map-header">
                <h4>Mapa de trayectoria</h4>
                <p>Visualiza observatorios asociados y la trayectoria estimada del meteoro seleccionado.</p>
            </div>

            {selectedMeteorData ? (
                <Alert variant="info" className="mb-3 interactive-map-alert">
                    <strong>Meteoro activo:</strong> ID {meteorId} ({selectedMeteorData.date || selectedMeteorData.Fecha} {selectedMeteorData.time || selectedMeteorData.Hora})
                    <br />
                    <small>
                        {loading
                            ? "Cargando observatorios y trayectoria..."
                            : `Se muestran ${observatoryMarkers.length} observatorios relacionados con este meteoro.`}
                    </small>
                </Alert>
            ) : (
                <div className="interactive-map-empty no-print">
                    <i className="fa fa-map-marker"></i>
                    Selecciona un meteoro en el widget de entrada para centrar el mapa en datos reales.
                </div>
            )}

            <div className="interactive-map-shell exportable-content">
                <MapContainer
                    center={DEFAULT_CENTER}
                    zoom={DEFAULT_ZOOM}
                    scrollWheelZoom
                    className="workflow-leaflet-map"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapViewportController positions={allPositions} />

                    {observatoryMarkers.map(marker => (
                        <Marker key={marker.key} position={marker.position} icon={MARKER_ICONS.observatory}>
                            <Tooltip direction="top" offset={[0, -10]} className="workflow-leaflet-tooltip">
                                {marker.label}
                            </Tooltip>
                            <Popup>{marker.label}</Popup>
                        </Marker>
                    ))}

                    {trajectoryMarkers.map(marker => {
                        const markerLabel = marker.alt !== undefined ? `${marker.label} · ${marker.alt.toFixed(1)} km` : marker.label;

                        return (
                            <Marker key={marker.key} position={marker.position} icon={MARKER_ICONS[marker.kind]}>
                                <Tooltip
                                    direction="top"
                                    offset={[0, -10]}
                                    permanent
                                    className="workflow-leaflet-tooltip"
                                >
                                    {markerLabel}
                                </Tooltip>
                                <Popup>{markerLabel}</Popup>
                            </Marker>
                        );
                    })}

                    {linePath.length === 2 && (
                        <Polyline
                            positions={linePath}
                            pathOptions={{
                                color: "#980100",
                                opacity: 0.85,
                                weight: 4
                            }}
                        />
                    )}
                </MapContainer>
            </div>
        </div>
    );
}
