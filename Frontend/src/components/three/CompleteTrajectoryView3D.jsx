import React, { Suspense, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls, Sphere, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const EARTH_RADIUS_KM = 6371;
const SCENE_SCALE = 0.00105;
const EARTH_RADIUS_SCENE = EARTH_RADIUS_KM * SCENE_SCALE;
const ENTRY_ALTITUDE_FLOOR_KM = 250;
const ENTRY_ALTITUDE_PADDING_KM = 120;
const SIMULATED_ORIGIN_RADIUS_MULTIPLIER = 3.35;
const completeTrajectoryStyles = `
  .complete-trajectory-3d {
    display: grid;
    gap: 1rem;
    width: 100%;
  }

  .complete-trajectory-3d__viewport {
    width: 100%;
    min-height: 34rem;
    height: min(76vh, 52rem);
    overflow: hidden;
    border: 1px solid rgba(122, 142, 188, 0.18);
    border-radius: 1.5rem;
    background: #07111f;
    box-shadow: 0 30px 60px rgba(3, 8, 18, 0.28);
  }

  .complete-trajectory-3d__info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: 0.85rem 1rem;
    padding: 1rem 1.1rem 1.15rem;
    border: 1px solid #d8dfeb;
    border-radius: 1.25rem;
    background: #ffffff;
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.04);
  }

  .complete-trajectory-3d__legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    color: #23324f;
    font-size: 0.95rem;
    line-height: 1.45;
  }

  .complete-trajectory-3d__swatch {
    width: 0.95rem;
    height: 0.95rem;
    flex: 0 0 auto;
    border-radius: 999px;
  }

  .complete-trajectory-3d__swatch--earth {
    background: #3b82f6;
  }

  .complete-trajectory-3d__swatch--incoming {
    background: #ffd166;
  }

  .complete-trajectory-3d__swatch--visible {
    background: #38bdf8;
  }

  .complete-trajectory-3d__swatch--impact {
    background: #f97316;
  }

  .complete-trajectory-3d__metrics {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
  }

  .complete-trajectory-3d__metric {
    padding: 0.5rem 0.78rem;
    border: 1px solid #e3e8f1;
    border-radius: 999px;
    background: #f8fafc;
    color: #1f2c45;
    font-size: 0.9rem;
  }

  .complete-trajectory-3d__note {
    grid-column: 1 / -1;
    color: #57657f;
    font-size: 0.92rem;
    line-height: 1.6;
  }

  .complete-trajectory-3d__message {
    width: 100%;
    padding: 1rem 1.1rem;
    border: 1px solid #f0d2d2;
    border-radius: 1rem;
    background: #fff6f6;
    color: #8b3030;
  }

  @media (max-width: 768px) {
    .complete-trajectory-3d__viewport {
      min-height: 24rem;
      height: 60vh;
      border-radius: 1rem;
    }

    .complete-trajectory-3d__info {
      grid-template-columns: 1fr;
      padding: 0.95rem;
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
  const match = cleaned.match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
  return match ? Number.parseFloat(match[0]) : NaN;
}

function average(values, fallback = NaN) {
  const validValues = values.filter(Number.isFinite);
  if (validValues.length === 0) {
    return fallback;
  }

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function geoToCartesian(lat, lon, altitudeKm = 0) {
  const radius = (EARTH_RADIUS_KM + altitudeKm) * SCENE_SCALE;
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function projectToSurface(point) {
  return point.clone().normalize().multiplyScalar(EARTH_RADIUS_SCENE);
}

function extendPointToRadius(point, direction, targetRadius) {
  const normalizedDirection = direction.clone().normalize();
  const b = 2 * point.dot(normalizedDirection);
  const c = point.lengthSq() - targetRadius ** 2;
  const discriminant = b ** 2 - 4 * c;

  if (discriminant < 0) {
    return null;
  }

  const sqrtDiscriminant = Math.sqrt(discriminant);
  const solutions = [(-b + sqrtDiscriminant) / 2, (-b - sqrtDiscriminant) / 2].filter(value => value > 0);

  if (solutions.length === 0) {
    return null;
  }

  return point.clone().addScaledVector(normalizedDirection, Math.max(...solutions));
}

function extractGeoPoint(point, altitudeOverride = null) {
  if (!point) {
    return null;
  }

  const latitude = toNumber(point.latitude);
  const longitude = toNumber(point.longitude);
  const altitudeKm = altitudeOverride !== null ? altitudeOverride : toNumber(point.height);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    altitudeKm: Number.isFinite(altitudeKm) ? altitudeKm : 0
  };
}

function averageGeoPoint(points) {
  const validPoints = points.filter(Boolean);
  if (validPoints.length === 0) {
    return null;
  }

  return {
    latitude: average(validPoints.map(point => point.latitude), 0),
    longitude: average(validPoints.map(point => point.longitude), 0),
    altitudeKm: average(validPoints.map(point => point.altitudeKm), 0)
  };
}

function buildVisibleSamples(reportData, trajectoryData) {
  const startStation1 = extractGeoPoint(reportData?.trajectoryStartStation1);
  const startStation2 = extractGeoPoint(reportData?.trajectoryStartStation2);
  const endStation1 = extractGeoPoint(reportData?.trajectoryEndStation1);
  const endStation2 = extractGeoPoint(reportData?.trajectoryEndStation2);

  const averagedStart = startStation1 || averageGeoPoint([startStation1, startStation2]);
  const averagedEnd = endStation1 || averageGeoPoint([endStation1, endStation2]);

  if (!averagedStart || !averagedEnd) {
    return { valid: false, message: 'No hay suficientes coordenadas para reconstruir la trayectoria.' };
  }

  const measuredSamples = Array.isArray(trajectoryData)
    ? trajectoryData
        .map(item => ({
          latitude: toNumber(item.phi),
          longitude: toNumber(item.lambda),
          distance: toNumber(item.s),
          time: toNumber(item.t)
        }))
        .filter(item => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
        .sort((left, right) => {
          const leftKey = Number.isFinite(left.distance) ? left.distance : left.time;
          const rightKey = Number.isFinite(right.distance) ? right.distance : right.time;
          return leftKey - rightKey;
        })
    : [];

  if (measuredSamples.length < 2) {
    return {
      valid: true,
      samples: [averagedStart, averagedEnd],
      averagedStart,
      averagedEnd
    };
  }

  const canUseDistance = measuredSamples.every(item => Number.isFinite(item.distance));
  const startReference = canUseDistance ? measuredSamples[0].distance : 0;
  const endReference = canUseDistance ? measuredSamples[measuredSamples.length - 1].distance : measuredSamples.length - 1;
  const denominator = Math.max(endReference - startReference, 1);

  const samples = measuredSamples.map((sample, index) => {
    const currentReference = canUseDistance ? sample.distance : index;
    const progress = THREE.MathUtils.clamp((currentReference - startReference) / denominator, 0, 1);

    return {
      latitude: sample.latitude,
      longitude: sample.longitude,
      altitudeKm: lerp(averagedStart.altitudeKm, averagedEnd.altitudeKm, progress)
    };
  });

  return {
    valid: true,
    samples,
    averagedStart,
    averagedEnd
  };
}

function buildTrajectoryScene(reportData, trajectoryData, observatory) {
  const visibleSamplesResult = buildVisibleSamples(reportData, trajectoryData);
  if (!visibleSamplesResult.valid) {
    return visibleSamplesResult;
  }

  const visiblePoints = visibleSamplesResult.samples.map(sample =>
    geoToCartesian(sample.latitude, sample.longitude, sample.altitudeKm)
  );

  const smoothVisiblePoints = visiblePoints.length >= 3
    ? new THREE.CatmullRomCurve3(visiblePoints, false, 'centripetal').getPoints(Math.max(visiblePoints.length * 6, 80))
    : visiblePoints;

  const visibleStartPoint = visiblePoints[0];
  const visibleEndPoint = visiblePoints[visiblePoints.length - 1];
  const nextPoint = visiblePoints[1] || visibleEndPoint;
  const outwardDirection = visibleStartPoint.clone().sub(nextPoint).normalize();
  const entryAltitudeKm = Math.max(
    visibleSamplesResult.averagedStart.altitudeKm + ENTRY_ALTITUDE_PADDING_KM,
    ENTRY_ALTITUDE_FLOOR_KM
  );
  const entryRadius = (EARTH_RADIUS_KM + entryAltitudeKm) * SCENE_SCALE;
  const entryPoint = extendPointToRadius(visibleStartPoint, outwardDirection, entryRadius)
    || visibleStartPoint.clone().addScaledVector(outwardDirection, entryAltitudeKm * SCENE_SCALE * 0.8);
  const simulatedOriginRadius = Math.max(entryRadius * 1.55, EARTH_RADIUS_SCENE * SIMULATED_ORIGIN_RADIUS_MULTIPLIER);
  const originPoint = extendPointToRadius(visibleStartPoint, outwardDirection, simulatedOriginRadius)
    || entryPoint.clone().addScaledVector(outwardDirection, EARTH_RADIUS_SCENE * 1.35);

  const entrySegment = [entryPoint, visibleStartPoint];
  const originSegment = [originPoint, entryPoint];
  const incomingGroundProjection = projectToSurface(visibleStartPoint);
  const endGroundProjection = projectToSurface(visibleEndPoint);
  const predictedImpact = extractGeoPoint(reportData?.predictedImpact, 0);
  const predictedImpactPoint = predictedImpact
    ? geoToCartesian(predictedImpact.latitude, predictedImpact.longitude, 0)
    : null;

  const trajectoryMidPoint = visibleStartPoint.clone().add(visibleEndPoint).multiplyScalar(0.5);
  const trajectoryMidDirection = trajectoryMidPoint.clone().normalize();
  const cameraDirection = trajectoryMidDirection
    .clone()
    .add(outwardDirection.clone().multiplyScalar(0.5))
    .add(new THREE.Vector3(0.35, 0.18, 0.3))
    .normalize();
  const focusTarget = trajectoryMidDirection.clone().multiplyScalar(EARTH_RADIUS_SCENE * 0.42);
  const cameraPosition = cameraDirection.multiplyScalar(EARTH_RADIUS_SCENE * 4.25);

  const detailStep = Math.max(1, Math.floor(visiblePoints.length / 10));
  const detailMarkers = visiblePoints.filter((_, index) => index > 0 && index < visiblePoints.length - 1 && index % detailStep === 0);
  const observatoryPoints = Array.isArray(observatory)
    ? observatory
        .map((item, index) => {
          const latitude = toNumber(item?.latitude);
          const longitude = toNumber(item?.longitude);
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
          }

          return {
            label: `OBS ${index + 1}`,
            point: geoToCartesian(latitude, longitude, 0.5)
          };
        })
        .filter(Boolean)
    : [];

  return {
    valid: true,
    focusTarget,
    cameraPosition,
    originPoint,
    originSegment,
    entryPoint,
    entrySegment,
    visiblePoints: smoothVisiblePoints,
    detailMarkers,
    visibleStartPoint,
    visibleEndPoint,
    incomingGroundProjection,
    endGroundProjection,
    observatoryPoints,
    predictedImpactPoint,
    sampleCount: visibleSamplesResult.samples.length,
    startAltitudeKm: visibleSamplesResult.averagedStart.altitudeKm,
    endAltitudeKm: visibleSamplesResult.averagedEnd.altitudeKm,
    entryAltitudeKm
  };
}

function Earth({ textureUrl }) {
  const texture = useTexture(textureUrl || '/earthmap10k.jpg');

  if (texture && 'colorSpace' in texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  return (
    <group>
      <Sphere args={[EARTH_RADIUS_SCENE, 64, 64]}>
        <meshStandardMaterial
          map={texture}
          color="#ffffff"
          roughness={1}
          metalness={0}
        />
      </Sphere>
      <Sphere args={[EARTH_RADIUS_SCENE * 1.022, 48, 48]}>
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.025} side={THREE.BackSide} />
      </Sphere>
    </group>
  );
}

Earth.propTypes = {
  textureUrl: PropTypes.string
};

Earth.defaultProps = {
  textureUrl: '/earthmap10k.jpg'
};

export default function CompleteTrajectoryView3D({
  reportData,
  trajectoryData,
  observatory,
  earthTexture
}) {
  const sceneData = useMemo(
    () => buildTrajectoryScene(reportData, trajectoryData, observatory),
    [reportData, trajectoryData, observatory]
  );

  if (!sceneData.valid) {
    return (
      <>
        <style>{completeTrajectoryStyles}</style>
        <div className="complete-trajectory-3d__message">{sceneData.message}</div>
      </>
    );
  }

  return (
    <>
      <style>{completeTrajectoryStyles}</style>
      <div className="complete-trajectory-3d">
        <div className="complete-trajectory-3d__viewport">
          <Canvas
            camera={{
              position: sceneData.cameraPosition.toArray(),
              fov: 34,
              near: 0.1,
              far: 200
            }}
            dpr={[1, 1.75]}
          >
            <color attach="background" args={['#040b18']} />
            <ambientLight intensity={0.36} />
            <hemisphereLight args={['#dbeafe', '#0f172a', 0.72]} />
            <directionalLight position={[EARTH_RADIUS_SCENE * 2.1, EARTH_RADIUS_SCENE * 1.2, EARTH_RADIUS_SCENE * 2.3]} intensity={0.82} color="#fff2cf" />
            <Stars radius={EARTH_RADIUS_SCENE * 12} depth={EARTH_RADIUS_SCENE * 5} count={2400} factor={3.4} fade />

            <Suspense fallback={null}>
              <Earth textureUrl={earthTexture} />
            </Suspense>

            <Line points={sceneData.visiblePoints} color="#ef4444" lineWidth={5.2} />

            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              enableDamping
              dampingFactor={0.08}
              rotateSpeed={0.42}
              zoomSpeed={1.55}
              panSpeed={0.7}
              screenSpacePanning={false}
              minPolarAngle={0.18}
              maxPolarAngle={Math.PI - 0.16}
              minDistance={EARTH_RADIUS_SCENE * 0.42}
              maxDistance={EARTH_RADIUS_SCENE * 16}
              target={sceneData.focusTarget.toArray()}
            />
          </Canvas>
        </div>

        <div className="complete-trajectory-3d__info">
          <div className="complete-trajectory-3d__note">
            Arrastre para rotar la escena, use la rueda del ratón para acercar o alejar y mantenga el botón derecho para desplazar el encuadre.
          </div>
        </div>
      </div>
    </>
  );
}

CompleteTrajectoryView3D.propTypes = {
  reportData: PropTypes.shape({
    trajectoryStartStation1: PropTypes.object,
    trajectoryEndStation1: PropTypes.object,
    trajectoryStartStation2: PropTypes.object,
    trajectoryEndStation2: PropTypes.object,
    predictedImpact: PropTypes.object,
    averageVelocity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    accelerationKms: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }),
  trajectoryData: PropTypes.arrayOf(PropTypes.shape({
    lambda: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    phi: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    s: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    t: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  })),
  observatory: PropTypes.arrayOf(PropTypes.shape({
    latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  })),
  earthTexture: PropTypes.string
};

CompleteTrajectoryView3D.defaultProps = {
  reportData: null,
  trajectoryData: [],
  observatory: [],
  earthTexture: '/earthmap10k.jpg'
};
