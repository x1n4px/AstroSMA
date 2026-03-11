import React, { Suspense, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Canvas } from '@react-three/fiber';
import { Billboard, Line, OrbitControls, Sphere, Stars, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const EARTH_RADIUS_KM = 6371;
const SCENE_SCALE = 0.00105;
const EARTH_RADIUS_SCENE = EARTH_RADIUS_KM * SCENE_SCALE;
const ENTRY_ALTITUDE_FLOOR_KM = 220;
const ENTRY_ALTITUDE_PADDING_KM = 120;
const SIMULATED_ORIGIN_RADIUS_MULTIPLIER = 3.35;
const SURFACE_MARKER_RADIUS = 0.045;
const PATH_MARKER_RADIUS = 0.075;
const LABEL_OFFSET = 0.22;

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
  const match = cleaned.match(/[+-]?\d+(?:\.\d+)?/);
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

  const averagedStart = averageGeoPoint([startStation1, startStation2]);
  const averagedEnd = averageGeoPoint([endStation1, endStation2]);

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
  const cameraPosition = cameraDirection.multiplyScalar(EARTH_RADIUS_SCENE * 5.15);

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

function SceneMarker({ position, label, color, radius = PATH_MARKER_RADIUS, emissiveIntensity = 0.45 }) {
  return (
    <group position={position.toArray()}>
      <Sphere args={[radius, 24, 24]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} />
      </Sphere>
      {label ? (
        <Billboard follow position={[0, radius + LABEL_OFFSET, 0]}>
          <Text fontSize={0.18} color={color} anchorX="center" anchorY="middle">
            {label}
          </Text>
        </Billboard>
      ) : null}
    </group>
  );
}

SceneMarker.propTypes = {
  position: PropTypes.instanceOf(THREE.Vector3).isRequired,
  label: PropTypes.string,
  color: PropTypes.string.isRequired,
  radius: PropTypes.number,
  emissiveIntensity: PropTypes.number
};

SceneMarker.defaultProps = {
  label: null,
  radius: PATH_MARKER_RADIUS,
  emissiveIntensity: 0.45
};

function DirectionCone({ tail, tip }) {
  const coneTransform = useMemo(() => {
    const direction = tip.clone().sub(tail).normalize();
    const position = tip.clone().addScaledVector(direction, -0.28);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction
    );

    return { position, quaternion };
  }, [tail, tip]);

  return (
    <mesh position={coneTransform.position.toArray()} quaternion={coneTransform.quaternion}>
      <coneGeometry args={[0.11, 0.36, 18]} />
      <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={0.65} />
    </mesh>
  );
}

DirectionCone.propTypes = {
  tail: PropTypes.instanceOf(THREE.Vector3).isRequired,
  tip: PropTypes.instanceOf(THREE.Vector3).isRequired
};

export default function CompleteTrajectoryView3D({
  reportData,
  trajectoryData,
  regressionTrajectory,
  observatory,
  earthTexture
}) {
  const sceneData = useMemo(
    () => buildTrajectoryScene(reportData, trajectoryData, observatory),
    [reportData, trajectoryData, observatory]
  );

  const metrics = useMemo(() => {
    if (!sceneData.valid) {
      return [];
    }

    return [
      `Entrada estimada: ${sceneData.entryAltitudeKm.toFixed(1)} km`,
      `Inicio visible: ${sceneData.startAltitudeKm.toFixed(1)} km`,
      `Fin visible: ${sceneData.endAltitudeKm.toFixed(1)} km`,
      `Muestras reconstruidas: ${sceneData.sampleCount}`,
      `Velocidad media: ${Number.isFinite(toNumber(reportData?.averageVelocity)) ? `${toNumber(reportData.averageVelocity).toFixed(3)} km/s` : 'sin dato'}`,
      `Aceleracion: ${Number.isFinite(toNumber(reportData?.accelerationKms)) ? `${toNumber(reportData.accelerationKms).toFixed(3)} km/s²` : 'sin dato'}`
    ];
  }, [reportData, sceneData]);

  const regressionCount = Array.isArray(regressionTrajectory) ? regressionTrajectory.length : 0;

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

            <Line points={sceneData.originSegment} color="#fef3c7" lineWidth={1.6} dashed dashSize={0.26} gapSize={0.14} />
            <Line points={sceneData.entrySegment} color="#ffd166" lineWidth={2.4} dashed dashSize={0.22} gapSize={0.12} />
            <DirectionCone tail={sceneData.originPoint} tip={sceneData.entryPoint} />
            <Line points={sceneData.visiblePoints} color="#38bdf8" lineWidth={2.8} />
            <Line points={[sceneData.visibleStartPoint, sceneData.incomingGroundProjection]} color="#94a3b8" lineWidth={1.3} dashed dashSize={0.1} gapSize={0.08} />
            <Line points={[sceneData.visibleEndPoint, sceneData.endGroundProjection]} color="#f97316" lineWidth={1.3} dashed dashSize={0.1} gapSize={0.08} />

            <SceneMarker position={sceneData.originPoint} label="Origen simulado" color="#fef3c7" radius={PATH_MARKER_RADIUS * 0.82} emissiveIntensity={0.28} />
            <SceneMarker position={sceneData.entryPoint} label="Entrada" color="#ffd166" radius={PATH_MARKER_RADIUS * 0.95} />
            <SceneMarker position={sceneData.visibleStartPoint} label="Inicio visible" color="#38bdf8" />
            <SceneMarker position={sceneData.visibleEndPoint} label="Desaparicion" color="#f97316" />
            <SceneMarker position={sceneData.incomingGroundProjection} label="Suelo" color="#94a3b8" radius={SURFACE_MARKER_RADIUS} emissiveIntensity={0.18} />

            {sceneData.predictedImpactPoint ? (
              <>
                <Line points={[sceneData.visibleEndPoint, sceneData.predictedImpactPoint]} color="#fb7185" lineWidth={1.2} dashed dashSize={0.08} gapSize={0.08} />
                <SceneMarker position={sceneData.predictedImpactPoint} label="Impacto" color="#fb7185" radius={SURFACE_MARKER_RADIUS} emissiveIntensity={0.25} />
              </>
            ) : null}

            {sceneData.detailMarkers.map((point, index) => (
              <SceneMarker
                key={`detail-${index}`}
                position={point}
                color="#7dd3fc"
                radius={PATH_MARKER_RADIUS * 0.45}
                emissiveIntensity={0.18}
              />
            ))}

            {sceneData.observatoryPoints.map(item => (
              <SceneMarker
                key={item.label}
                position={item.point}
                label={item.label}
                color="#a78bfa"
                radius={SURFACE_MARKER_RADIUS}
                emissiveIntensity={0.22}
              />
            ))}

            <OrbitControls
              enablePan
              enableZoom
              zoomSpeed={1.25}
              panSpeed={0.85}
              minDistance={EARTH_RADIUS_SCENE * 1.18}
              maxDistance={EARTH_RADIUS_SCENE * 8.5}
              target={sceneData.focusTarget.toArray()}
            />
          </Canvas>
        </div>

        <div className="complete-trajectory-3d__info">
          <div className="complete-trajectory-3d__legend-item">
            <span className="complete-trajectory-3d__swatch complete-trajectory-3d__swatch--earth"></span>
            Globo terrestre y contexto espacial
          </div>
          <div className="complete-trajectory-3d__legend-item">
            <span className="complete-trajectory-3d__swatch complete-trajectory-3d__swatch--incoming"></span>
            Llegada simulada desde fuera de la Tierra
          </div>
          <div className="complete-trajectory-3d__legend-item">
            <span className="complete-trajectory-3d__swatch complete-trajectory-3d__swatch--visible"></span>
            Tramo visible reconstruido con la secuencia de trayectoria
          </div>
          <div className="complete-trajectory-3d__legend-item">
            <span className="complete-trajectory-3d__swatch complete-trajectory-3d__swatch--impact"></span>
            Desaparicion y proyecciones sobre la superficie
          </div>

          <div className="complete-trajectory-3d__metrics">
            {metrics.map(metric => (
              <div key={metric} className="complete-trajectory-3d__metric">{metric}</div>
            ))}
            {regressionCount > 0 ? (
              <div className="complete-trajectory-3d__metric">Puntos de regresion: {regressionCount}</div>
            ) : null}
          </div>

          <div className="complete-trajectory-3d__note">
            El tramo visible se apoya en la trayectoria medida y se suaviza en 3D. La extension exterior simula la aproximacion previa al contacto con la atmosfera usando la direccion de entrada inferida a partir del inicio de la trayectoria.
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
  regressionTrajectory: PropTypes.arrayOf(PropTypes.shape({
    t: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    s: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    v_Kms: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
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
  regressionTrajectory: [],
  observatory: [],
  earthTexture: '/earthmap10k.jpg'
};
