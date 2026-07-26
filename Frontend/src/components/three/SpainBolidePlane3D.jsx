import React, { Suspense, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const IBERIA_BOUNDS = {
  minLat: 35.4,
  maxLat: 43.95,
  minLon: -10.1,
  maxLon: 4.8
};

const MAP_MARGIN = {
  latitude: 0.85,
  longitude: 1.25
};

const PLANE_WIDTH = 15.2;
const PLANE_HEIGHT = 9.9;
const MIN_POINTS_TO_RENDER = 2;
const MAP_ZOOM = 6;
const KM_PER_DEGREE_LATITUDE = 111.32;
const TRAJECTORY_VERTICAL_EXAGGERATION = 1.25;
const TERRAIN_HEIGHT_SCALE = 0.34;
const TERRAIN_BIAS = -0.02;
const TERRAIN_SHADOW_Z = 0.12;
const OPENTOPOMAP_URL = 'https://tile.opentopomap.org/{z}/{x}/{y}.png';
const OPENSTREETMAP_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TERRARIUM_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';

const spainBolideStyles = `
  .spain-bolide-3d {
    display: grid;
    gap: 0.9rem;
    width: 100%;
  }

  .spain-bolide-3d__viewport {
    width: 100%;
    min-height: 30rem;
    height: min(72vh, 48rem);
    overflow: hidden;
    border: 1px solid #d8e2ee;
    border-radius: 1.3rem;
    background: radial-gradient(circle at 20% 12%, #f8fbff 0%, #eef4fb 45%, #e5eef8 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 18px 38px rgba(15, 23, 42, 0.12);
  }

  .spain-bolide-3d__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 0.9rem;
    color: #1f2d47;
    font-size: 0.9rem;
  }

  .spain-bolide-3d__chip {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.38rem 0.68rem;
    border-radius: 999px;
    border: 1px solid #d4deea;
    background: #ffffff;
  }

  .spain-bolide-3d__dot {
    width: 0.72rem;
    height: 0.72rem;
    border-radius: 999px;
  }

  @media (max-width: 768px) {
    .spain-bolide-3d__viewport {
      min-height: 22rem;
      height: 58vh;
      border-radius: 1rem;
    }
  }
`;

function toNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : NaN;
  }

  if (typeof value !== 'string') {
    return NaN;
  }

  const cleaned = value.trim().replace(',', '.');
  const matchedNumber = cleaned.match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
  return matchedNumber ? Number.parseFloat(matchedNumber[0]) : NaN;
}

function average(values) {
  const validValues = values.filter(Number.isFinite);
  if (validValues.length === 0) {
    return NaN;
  }

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function clamp01(value) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function padBounds(bounds, margin = MAP_MARGIN) {
  return {
    minLat: bounds.minLat - margin.latitude,
    maxLat: bounds.maxLat + margin.latitude,
    minLon: bounds.minLon - margin.longitude,
    maxLon: bounds.maxLon + margin.longitude
  };
}

function buildMapBounds(points = []) {
  const bounds = { ...IBERIA_BOUNDS };

  points.forEach(point => {
    if (!point) {
      return;
    }

    const latitude = toNumber(point.latitude);
    const longitude = toNumber(point.longitude);

    if (Number.isFinite(latitude)) {
      bounds.minLat = Math.min(bounds.minLat, latitude);
      bounds.maxLat = Math.max(bounds.maxLat, latitude);
    }

    if (Number.isFinite(longitude)) {
      bounds.minLon = Math.min(bounds.minLon, longitude);
      bounds.maxLon = Math.max(bounds.maxLon, longitude);
    }
  });

  return padBounds(bounds);
}

function geoToPlane(lat, lon, bounds) {
  const lonRatio = clamp01((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon));
  const latRatio = clamp01((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat));

  const x = lonRatio * PLANE_WIDTH - PLANE_WIDTH / 2;
  const y = latRatio * PLANE_HEIGHT - PLANE_HEIGHT / 2;

  return new THREE.Vector3(x, y, 0);
}

function getKmPerPlaneUnit(bounds) {
  const centerLatitude = (bounds.minLat + bounds.maxLat) / 2;
  const latitudeKm = (bounds.maxLat - bounds.minLat) * KM_PER_DEGREE_LATITUDE;
  const longitudeKm = (bounds.maxLon - bounds.minLon)
    * KM_PER_DEGREE_LATITUDE
    * Math.cos(THREE.MathUtils.degToRad(centerLatitude));

  return average([
    latitudeKm / PLANE_HEIGHT,
    longitudeKm / PLANE_WIDTH
  ]);
}

function extractPoint(source) {
  if (!source) {
    return null;
  }

  const latitude = toNumber(source.latitude ?? source.phi);
  const longitude = toNumber(source.longitude ?? source.lambda);
  const height = toNumber(source.height);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    height: Number.isFinite(height) ? height : NaN,
    sortDistance: toNumber(source.s),
    sortTime: toNumber(source.t)
  };
}

function isValidTrajectoryPoint(point) {
  return point
    && Number.isFinite(point.latitude)
    && Number.isFinite(point.longitude);
}

function buildTrajectoryPoints(reportData, trajectoryData) {
  const startStation1 = extractPoint(reportData?.trajectoryStartStation1);
  const startStation2 = extractPoint(reportData?.trajectoryStartStation2);
  const endStation1 = extractPoint(reportData?.trajectoryEndStation1);
  const endStation2 = extractPoint(reportData?.trajectoryEndStation2);

  const avgStart = {
    latitude: average([startStation1?.latitude, startStation2?.latitude]),
    longitude: average([startStation1?.longitude, startStation2?.longitude]),
    height: average([startStation1?.height, startStation2?.height])
  };

  const avgEnd = {
    latitude: average([endStation1?.latitude, endStation2?.latitude]),
    longitude: average([endStation1?.longitude, endStation2?.longitude]),
    height: average([endStation1?.height, endStation2?.height])
  };

  const segmentStart = isValidTrajectoryPoint(avgStart) ? avgStart : null;
  const segmentEnd = isValidTrajectoryPoint(avgEnd) ? avgEnd : null;

  if (segmentStart && segmentEnd) {
    return [segmentStart, segmentEnd];
  }

  const measuredPoints = Array.isArray(trajectoryData)
    ? trajectoryData
        .map(extractPoint)
        .filter(Boolean)
        .sort((left, right) => {
          const leftKey = Number.isFinite(left.sortDistance) ? left.sortDistance : left.sortTime;
          const rightKey = Number.isFinite(right.sortDistance) ? right.sortDistance : right.sortTime;
          if (Number.isFinite(leftKey) && Number.isFinite(rightKey)) {
            return leftKey - rightKey;
          }
          return 0;
        })
    : [];

  if (measuredPoints.length >= MIN_POINTS_TO_RENDER) {
    const startHeight = Number.isFinite(avgStart.height) ? avgStart.height : 95;
    const endHeight = Number.isFinite(avgEnd.height) ? avgEnd.height : 28;
    const firstMeasuredPoint = measuredPoints[0];
    const lastMeasuredPoint = measuredPoints[measuredPoints.length - 1];

    return [
      {
        latitude: firstMeasuredPoint.latitude,
        longitude: firstMeasuredPoint.longitude,
        height: Number.isFinite(firstMeasuredPoint.height) ? firstMeasuredPoint.height : startHeight
      },
      {
        latitude: lastMeasuredPoint.latitude,
        longitude: lastMeasuredPoint.longitude,
        height: Number.isFinite(lastMeasuredPoint.height) ? lastMeasuredPoint.height : endHeight
      }
    ];
  }

  return [segmentStart, segmentEnd].filter(Boolean);
}

function latLonToTile(lat, lon, zoom) {
  const latRad = THREE.MathUtils.degToRad(lat);
  const n = 2 ** zoom;
  const x = n * ((lon + 180) / 360);
  const y = n * (1 - (Math.log(Math.tan(latRad) + (1 / Math.cos(latRad))) / Math.PI)) / 2;
  return { x, y };
}

function createFallbackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 896;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#f5f9ff');
  gradient.addColorStop(1, '#e4edf8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.strokeStyle = 'rgba(45, 79, 118, 0.22)';
  ctx.lineWidth = 2;
  for (let lon = 0; lon <= 4; lon += 1) {
    const x = 120 + lon * 220;
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, canvas.height - 40);
    ctx.stroke();
  }
  for (let lat = 0; lat <= 3; lat += 1) {
    const y = 80 + lat * 200;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(canvas.width - 40, y);
    ctx.stroke();
  }
  ctx.restore();

  const outline = [
    [0.16, 0.20],
    [0.23, 0.14],
    [0.34, 0.12],
    [0.46, 0.13],
    [0.58, 0.16],
    [0.71, 0.20],
    [0.80, 0.26],
    [0.84, 0.34],
    [0.83, 0.43],
    [0.79, 0.53],
    [0.74, 0.61],
    [0.69, 0.69],
    [0.64, 0.78],
    [0.56, 0.85],
    [0.45, 0.89],
    [0.34, 0.87],
    [0.26, 0.80],
    [0.19, 0.70],
    [0.14, 0.58],
    [0.12, 0.45],
    [0.13, 0.32]
  ];

  ctx.save();
  ctx.beginPath();
  outline.forEach(([x, y], index) => {
    const px = x * canvas.width;
    const py = y * canvas.height;
    if (index === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  });
  ctx.closePath();
  ctx.fillStyle = '#f4e8c8';
  ctx.strokeStyle = '#244766';
  ctx.lineWidth = 10;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#1f3b59';
  ctx.font = '700 46px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText('Península Ibérica', 44, 78);
  ctx.font = '500 26px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText('Mapa de respaldo sin teselas remotas', 44, 116);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return { texture, mapProvider: 'Fallback', hasTerrain3D: false };
}

function buildTileUrl(template, zoom, x, y) {
  return template
    .replace('{z}', String(zoom))
    .replace('{x}', String(x))
    .replace('{y}', String(y));
}

async function loadTileCanvas(template, bounds, zoom = MAP_ZOOM) {
  const tileSize = 256;
  const northWest = latLonToTile(bounds.maxLat, bounds.minLon, zoom);
  const southEast = latLonToTile(bounds.minLat, bounds.maxLon, zoom);

  const minTileX = Math.floor(Math.min(northWest.x, southEast.x));
  const maxTileX = Math.ceil(Math.max(northWest.x, southEast.x));
  const minTileY = Math.floor(Math.min(northWest.y, southEast.y));
  const maxTileY = Math.ceil(Math.max(northWest.y, southEast.y));

  const columns = maxTileX - minTileX + 1;
  const rows = maxTileY - minTileY + 1;

  const stitchedCanvas = document.createElement('canvas');
  stitchedCanvas.width = columns * tileSize;
  stitchedCanvas.height = rows * tileSize;
  const ctx = stitchedCanvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  const tilePromises = [];

  for (let x = minTileX; x <= maxTileX; x += 1) {
    for (let y = minTileY; y <= maxTileY; y += 1) {
      tilePromises.push(new Promise(resolve => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
          const drawX = (x - minTileX) * tileSize;
          const drawY = (y - minTileY) * tileSize;
          ctx.drawImage(image, drawX, drawY, tileSize, tileSize);
          resolve(true);
        };
        image.onerror = () => resolve(false);
        image.src = buildTileUrl(template, zoom, x, y);
      }));
    }
  }

  const results = await Promise.all(tilePromises);
  if (!results.some(Boolean)) {
    return null;
  }

  const cropX = (northWest.x - minTileX) * tileSize;
  const cropY = (northWest.y - minTileY) * tileSize;
  const cropWidth = (southEast.x - northWest.x) * tileSize;
  const cropHeight = (southEast.y - northWest.y) * tileSize;

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = Math.max(1, Math.round(cropWidth));
  croppedCanvas.height = Math.max(1, Math.round(cropHeight));
  const croppedContext = croppedCanvas.getContext('2d');
  if (!croppedContext) {
    return null;
  }

  croppedContext.drawImage(
    stitchedCanvas,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    croppedCanvas.width,
    croppedCanvas.height
  );

  const texture = new THREE.CanvasTexture(croppedCanvas);
  texture.needsUpdate = true;
  return { canvas: croppedCanvas, bounds: { ...bounds }, texture };
}

function decodeTerrariumToHeightCanvas(terrariumCanvas) {
  const sourceContext = terrariumCanvas.getContext('2d');
  if (!sourceContext) {
    return null;
  }

  const { width, height } = terrariumCanvas;
  const sourceImageData = sourceContext.getImageData(0, 0, width, height);
  const sourcePixels = sourceImageData.data;
  const heights = new Float32Array(width * height);

  let minHeight = Number.POSITIVE_INFINITY;
  let maxHeight = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < heights.length; index += 1) {
    const pixelOffset = index * 4;
    const red = sourcePixels[pixelOffset];
    const green = sourcePixels[pixelOffset + 1];
    const blue = sourcePixels[pixelOffset + 2];
    const elevationMeters = (red * 256 + green + blue / 256) - 32768;

    heights[index] = elevationMeters;
    minHeight = Math.min(minHeight, elevationMeters);
    maxHeight = Math.max(maxHeight, elevationMeters);
  }

  const range = Math.max(maxHeight - minHeight, 1);
  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = width;
  heightCanvas.height = height;
  const targetContext = heightCanvas.getContext('2d');
  if (!targetContext) {
    return null;
  }

  const targetImageData = targetContext.createImageData(width, height);
  for (let index = 0; index < heights.length; index += 1) {
    const normalized = Math.round(((heights[index] - minHeight) / range) * 255);
    const pixelOffset = index * 4;
    targetImageData.data[pixelOffset] = normalized;
    targetImageData.data[pixelOffset + 1] = normalized;
    targetImageData.data[pixelOffset + 2] = normalized;
    targetImageData.data[pixelOffset + 3] = 255;
  }

  targetContext.putImageData(targetImageData, 0, 0);
  return heightCanvas;
}

async function loadColorTexture(bounds) {
  const topoMap = await loadTileCanvas(OPENTOPOMAP_URL, bounds);
  const colorMap = topoMap || await loadTileCanvas(OPENSTREETMAP_URL, bounds);
  if (!colorMap) {
    return null;
  }

  const colorTexture = colorMap.texture;
  colorTexture.anisotropy = 8;
  if ('colorSpace' in colorTexture) {
    colorTexture.colorSpace = THREE.SRGBColorSpace;
  }
  colorTexture.needsUpdate = true;

  return {
    texture: colorTexture,
    bounds: colorMap.bounds,
    mapProvider: topoMap ? 'OpenTopoMap' : 'OpenStreetMap'
  };
}

async function loadHeightTexture(bounds) {
  let elevationMap = null;
  try {
    elevationMap = await loadTileCanvas(TERRARIUM_URL, bounds);
  } catch (error) {
    elevationMap = null;
  }

  if (!elevationMap) {
    return null;
  }

  let heightCanvas = null;
  try {
    heightCanvas = decodeTerrariumToHeightCanvas(elevationMap.canvas);
  } catch (error) {
    heightCanvas = null;
  }

  if (!heightCanvas) {
    return null;
  }

  const heightTexture = new THREE.CanvasTexture(heightCanvas);
  heightTexture.anisotropy = 8;
  heightTexture.needsUpdate = true;

  return heightTexture;
}

function TrajectoryScene({ points, planeTexture, heightTexture, bounds, hasTerrain3D }) {
  const trajectory = useMemo(() => {
    const kmPerPlaneUnit = getKmPerPlaneUnit(bounds);
    const zScale = Number.isFinite(kmPerPlaneUnit) && kmPerPlaneUnit > 0
      ? TRAJECTORY_VERTICAL_EXAGGERATION / kmPerPlaneUnit
      : 0.012;

    const elevated = points.map(point => {
      const flatPoint = geoToPlane(point.latitude, point.longitude, bounds);
      const heightKm = Number.isFinite(toNumber(point.height)) ? Math.max(0, toNumber(point.height)) : 0;
      return new THREE.Vector3(
        flatPoint.x,
        flatPoint.y,
        Math.max(TERRAIN_SHADOW_Z + 0.06, heightKm * zScale)
      );
    });

    const shadow = elevated.map(point => new THREE.Vector3(point.x, point.y, TERRAIN_SHADOW_Z));
    const middleIndex = Math.floor(elevated.length / 2);

    return {
      elevated,
      shadow,
      connector: [elevated[middleIndex], shadow[middleIndex]]
    };
  }, [bounds, points]);

  return (
    <>
      <ambientLight intensity={0.78} />
      <directionalLight intensity={0.45} position={[4, -3, 8]} />
      <directionalLight intensity={0.2} position={[-5, 2, 5]} />

      <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[PLANE_WIDTH, PLANE_HEIGHT, 220, 160]} />
        <meshStandardMaterial
          map={planeTexture}
          displacementMap={heightTexture || undefined}
          displacementScale={hasTerrain3D ? TERRAIN_HEIGHT_SCALE : 0}
          displacementBias={hasTerrain3D ? TERRAIN_BIAS : 0}
          metalness={0.03}
          roughness={0.92}
          toneMapped={false}
        />
      </mesh>

      <Line points={trajectory.elevated} color="#dc2626" lineWidth={3} />
      <Line
        points={trajectory.shadow}
        color="#ef4444"
        lineWidth={2.2}
        depthTest={false}
        depthWrite={false}
        transparent
        opacity={0.95}
        renderOrder={20}
      />
      <Line
        points={trajectory.connector}
        color="#fca5a5"
        lineWidth={1}
        dashed
        dashScale={12}
        dashSize={0.28}
        gapSize={0.26}
        opacity={0.5}
        transparent
        depthTest={false}
        depthWrite={false}
        renderOrder={21}
      />

      <OrbitControls
        makeDefault
        enablePan
        enableRotate
        enableZoom
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        minDistance={4}
        maxDistance={24}
      />
    </>
  );
}

TrajectoryScene.propTypes = {
  points: PropTypes.arrayOf(PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    height: PropTypes.number
  })).isRequired,
  planeTexture: PropTypes.object,
  heightTexture: PropTypes.object,
  bounds: PropTypes.shape({
    minLat: PropTypes.number.isRequired,
    maxLat: PropTypes.number.isRequired,
    minLon: PropTypes.number.isRequired,
    maxLon: PropTypes.number.isRequired
  }),
  hasTerrain3D: PropTypes.bool
};

TrajectoryScene.defaultProps = {
  planeTexture: null,
  heightTexture: null,
  bounds: padBounds(IBERIA_BOUNDS),
  hasTerrain3D: false
};

export default function SpainBolidePlane3D({ reportData, trajectoryData }) {
  const points = useMemo(() => buildTrajectoryPoints(reportData, trajectoryData), [reportData, trajectoryData]);
  const mapBounds = useMemo(() => buildMapBounds(points), [points]);
  const [planeTexture, setPlaneTexture] = useState(null);
  const [heightTexture, setHeightTexture] = useState(null);
  const [bounds, setBounds] = useState(mapBounds);
  const [hasTerrain3D, setHasTerrain3D] = useState(false);

  useEffect(() => {
    let mounted = true;
    let createdColorTexture = null;
    let createdHeightTexture = null;
    const fallback = createFallbackTexture();
    createdColorTexture = fallback.texture;
    setBounds(mapBounds);
    setPlaneTexture(fallback.texture);
    setHeightTexture(null);
    setHasTerrain3D(false);

    loadColorTexture(mapBounds)
      .then(result => {
        if (!mounted) {
          result?.texture?.dispose?.();
          return;
        }

        if (!result?.texture) {
          return;
        }

        createdColorTexture?.dispose?.();
        createdColorTexture = result.texture;
        setBounds(result.bounds || mapBounds);
        setPlaneTexture(result.texture);
      })
      .catch(() => {
        // Keep the local fallback already mounted.
      });

    loadHeightTexture(mapBounds)
      .then(heightTexture => {
        if (!mounted) {
          heightTexture?.dispose?.();
          return;
        }

        if (!heightTexture) {
          return;
        }

        createdHeightTexture?.dispose?.();
        createdHeightTexture = heightTexture;
        setHeightTexture(heightTexture);
        setHasTerrain3D(true);
      })
      .catch(() => {
        // Keep the local fallback terrain profile disabled.
      });

    return () => {
      mounted = false;
      createdColorTexture?.dispose?.();
      createdHeightTexture?.dispose?.();
    };
  }, [mapBounds]);

  if (!points || points.length < MIN_POINTS_TO_RENDER) {
    return (
      <div className="spain-bolide-3d">
        <style>{spainBolideStyles}</style>
        <div className="spain-bolide-3d__viewport d-flex align-items-center justify-content-center px-3">
          <span style={{ color: '#42546e', textAlign: 'center' }}>
            No hay suficientes coordenadas para representar la trayectoria 3D sobre el plano de Espana.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="spain-bolide-3d">
      <style>{spainBolideStyles}</style>
      <div className="spain-bolide-3d__viewport">
        <Canvas
          camera={{ position: [0, -12.2, 8.6], fov: 52, near: 0.1, far: 120 }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <TrajectoryScene
              points={points}
              planeTexture={planeTexture}
              heightTexture={heightTexture}
              bounds={bounds}
              hasTerrain3D={hasTerrain3D}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="spain-bolide-3d__legend">
        <span className="spain-bolide-3d__chip">
          Arrastra para rotar, rueda para zoom, click derecho para desplazar
        </span>
      </div>
    </div>
  );
}

SpainBolidePlane3D.propTypes = {
  reportData: PropTypes.object,
  trajectoryData: PropTypes.arrayOf(PropTypes.object)
};

SpainBolidePlane3D.defaultProps = {
  reportData: null,
  trajectoryData: []
};
