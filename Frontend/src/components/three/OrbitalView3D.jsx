import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Canvas } from '@react-three/fiber';
import { Billboard, OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

const SUN_RADIUS_SCENE = 1.6;
const EARTH_ORBIT_SEMI_MAJOR_AXIS_SCENE = 15;
const AU_TO_SCENE_UNITS = EARTH_ORBIT_SEMI_MAJOR_AXIS_SCENE;
const EARTH_ORBITAL_ECCENTRICITY = 0.0167;
const DAYS_IN_ANOMALISTIC_YEAR = 365.259635;
const PERIHELION_DAY_OF_YEAR = 4;
const EARTH_MARKER_RADIUS = 0.38;
const REFERENCE_MARKER_RADIUS = 0.3;
const DEFAULT_SCENE_RADIUS = 18;
const LABEL_OFFSET_FACTOR = 2.8;

const orbitalView3DStyles = `
  .orbital-view-3d {
    display: grid;
    gap: 1rem;
    width: 100%;
  }

  .orbital-view-3d__viewport {
    width: 100%;
    min-height: 28rem;
    height: min(68vh, 42rem);
    border: 1px solid #d8dfeb;
    border-radius: 1.25rem;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgba(255, 255, 255, 0.92), rgba(248, 250, 255, 0.92)),
      linear-gradient(180deg, #f7f9fd 0%, #eef3fb 100%);
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
  }

  .orbital-view-3d__legend {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: 0.75rem 1rem;
    padding: 1rem 1.1rem 1.15rem;
    border: 1px solid #d8dfeb;
    border-radius: 1.25rem;
    background: #ffffff;
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.05);
  }

  .orbital-view-3d__legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    color: #22314f;
    font-size: 0.96rem;
    line-height: 1.4;
  }

  .orbital-view-3d__swatch {
    width: 0.9rem;
    height: 0.9rem;
    flex: 0 0 auto;
    border-radius: 999px;
    box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
  }

  .orbital-view-3d__swatch--sun {
    background: #ffcc33;
  }

  .orbital-view-3d__swatch--earth {
    background: linear-gradient(90deg, #d96c6c 0%, #2a6fd6 100%);
  }

  .orbital-view-3d__swatch--object {
    background: #1f77d4;
  }

  .orbital-view-3d__swatch--nodes {
    background: #2f9e44;
  }

  .orbital-view-3d__note {
    grid-column: 1 / -1;
    padding-top: 0.1rem;
    color: #51607c;
    font-size: 0.92rem;
    line-height: 1.55;
  }

  .orbital-view-3d__metrics {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .orbital-view-3d__metrics span {
    padding: 0.45rem 0.7rem;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    background: #f8fafc;
    color: #1e293b;
    font-size: 0.9rem;
  }

  .orbital-view-3d__message {
    width: 100%;
    padding: 1rem 1.1rem;
    border: 1px solid #f0d2d2;
    border-radius: 1rem;
    background: #fff6f6;
    color: #8b3030;
  }

  @media (max-width: 768px) {
    .orbital-view-3d__viewport {
      min-height: 21rem;
      height: 55vh;
      border-radius: 1rem;
    }

    .orbital-view-3d__legend {
      grid-template-columns: 1fr;
      padding: 0.95rem;
      border-radius: 1rem;
    }

    .orbital-view-3d__metrics {
      gap: 0.55rem;
    }

    .orbital-view-3d__metrics span {
      width: fit-content;
      max-width: 100%;
    }
  }
`;

function getDayOfYear(date) {
  const startDate = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startDate.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function parseOrbitalNumber(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value !== 'string') {
    return NaN;
  }

  const match = value.trim().match(/[+-]?\d+(?:[.,]\d+)?/);
  return match ? Number.parseFloat(match[0].replace(',', '.')) : NaN;
}

function normalizeAngle(angle) {
  let normalized = angle;
  while (normalized < 0) normalized += Math.PI * 2;
  while (normalized >= Math.PI * 2) normalized -= Math.PI * 2;
  return normalized;
}

function solveEccentricAnomaly(meanAnomaly, eccentricity) {
  let eccentricAnomaly = meanAnomaly;

  for (let i = 0; i < 12; i += 1) {
    const numerator = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
    const denominator = 1 - eccentricity * Math.cos(eccentricAnomaly);
    eccentricAnomaly -= numerator / denominator;
  }

  return eccentricAnomaly;
}

function orbitalPointToScene({ radius, trueAnomaly, inclination, argumentOfPerihelion, ascendingNode }) {
  const cosInclination = Math.cos(inclination);
  const sinInclination = Math.sin(inclination);
  const cosAscendingNode = Math.cos(ascendingNode);
  const sinAscendingNode = Math.sin(ascendingNode);
  const cosArgument = Math.cos(argumentOfPerihelion + trueAnomaly);
  const sinArgument = Math.sin(argumentOfPerihelion + trueAnomaly);

  return new THREE.Vector3(
    radius * (cosAscendingNode * cosArgument - sinAscendingNode * sinArgument * cosInclination),
    radius * (sinArgument * sinInclination),
    radius * (sinAscendingNode * cosArgument + cosAscendingNode * sinArgument * cosInclination)
  );
}

function buildEarthOrbitData(date) {
  if (!date) {
    return { valid: false, message: 'Proporciona una fecha válida para representar la órbita.' };
  }

  const currentDate = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(currentDate.getTime())) {
    return { valid: false, message: 'La fecha proporcionada no es válida.' };
  }

  const dayOfYear = getDayOfYear(currentDate);
  let daysSincePerihelion = dayOfYear - PERIHELION_DAY_OF_YEAR;
  while (daysSincePerihelion < 0) {
    daysSincePerihelion += DAYS_IN_ANOMALISTIC_YEAR;
  }

  const meanAnomaly = (2 * Math.PI * daysSincePerihelion) / DAYS_IN_ANOMALISTIC_YEAR;
  const eccentricAnomaly = solveEccentricAnomaly(meanAnomaly, EARTH_ORBITAL_ECCENTRICITY);
  const trueAnomaly = normalizeAngle(
    2 * Math.atan2(
      Math.sqrt(1 + EARTH_ORBITAL_ECCENTRICITY) * Math.sin(eccentricAnomaly / 2),
      Math.sqrt(1 - EARTH_ORBITAL_ECCENTRICITY) * Math.cos(eccentricAnomaly / 2)
    )
  );

  const earthDistance = EARTH_ORBIT_SEMI_MAJOR_AXIS_SCENE * (1 - EARTH_ORBITAL_ECCENTRICITY * Math.cos(eccentricAnomaly));
  const earthPosition = [earthDistance * Math.cos(trueAnomaly), 0, earthDistance * Math.sin(trueAnomaly)];

  const semiLatusRectum = EARTH_ORBIT_SEMI_MAJOR_AXIS_SCENE * (1 - EARTH_ORBITAL_ECCENTRICITY ** 2);
  const orbitPoints = [];
  for (let index = 0; index <= 192; index += 1) {
    const orbitTrueAnomaly = (index / 192) * Math.PI * 2;
    const orbitRadius = semiLatusRectum / (1 + EARTH_ORBITAL_ECCENTRICITY * Math.cos(orbitTrueAnomaly));
    orbitPoints.push(new THREE.Vector3(orbitRadius * Math.cos(orbitTrueAnomaly), 0, orbitRadius * Math.sin(orbitTrueAnomaly)));
  }

  return {
    valid: true,
    earthPosition,
    earthOrbitPoints: orbitPoints
  };
}

function buildObjectOrbitData(orbit) {
  if (!orbit) {
    return { valid: false, message: 'No hay datos orbitales disponibles.' };
  }

  const semiMajorAxisAu = parseOrbitalNumber(orbit.a);
  const eccentricity = parseOrbitalNumber(orbit.e);
  const inclinationDeg = parseOrbitalNumber(orbit.i);
  const argumentOfPerihelionDeg = parseOrbitalNumber(orbit.omega);
  const ascendingNodeDeg = parseOrbitalNumber(orbit.Omega_grados_votos_max_min);

  const hasInvalidValues = [semiMajorAxisAu, eccentricity, inclinationDeg, argumentOfPerihelionDeg, ascendingNodeDeg].some(Number.isNaN);
  if (hasInvalidValues) {
    return { valid: false, message: 'Faltan elementos orbitales necesarios para reconstruir la órbita 3D.' };
  }

  if (semiMajorAxisAu <= 0 || eccentricity < 0 || eccentricity >= 1) {
    return { valid: false, message: 'Los elementos orbitales recibidos no son válidos para una órbita elíptica.' };
  }

  const semiMajorAxis = semiMajorAxisAu * AU_TO_SCENE_UNITS;
  const inclination = THREE.MathUtils.degToRad(inclinationDeg);
  const argumentOfPerihelion = THREE.MathUtils.degToRad(argumentOfPerihelionDeg);
  const ascendingNode = THREE.MathUtils.degToRad(ascendingNodeDeg);
  const semiLatusRectum = semiMajorAxis * (1 - eccentricity ** 2);

  const orbitPoints = [];
  for (let index = 0; index <= 320; index += 1) {
    const trueAnomaly = (index / 320) * Math.PI * 2;
    const radius = semiLatusRectum / (1 + eccentricity * Math.cos(trueAnomaly));
    orbitPoints.push(
      orbitalPointToScene({
        radius,
        trueAnomaly,
        inclination,
        argumentOfPerihelion,
        ascendingNode
      })
    );
  }

  const perihelionRadius = semiMajorAxis * (1 - eccentricity);
  const aphelionRadius = semiMajorAxis * (1 + eccentricity);
  const perihelionPosition = orbitalPointToScene({
    radius: perihelionRadius,
    trueAnomaly: 0,
    inclination,
    argumentOfPerihelion,
    ascendingNode
  });
  const aphelionPosition = orbitalPointToScene({
    radius: aphelionRadius,
    trueAnomaly: Math.PI,
    inclination,
    argumentOfPerihelion,
    ascendingNode
  });

  const ascendingNodeAnomaly = normalizeAngle(-argumentOfPerihelion);
  const descendingNodeAnomaly = normalizeAngle(Math.PI - argumentOfPerihelion);
  const ascendingNodeRadius = semiLatusRectum / (1 + eccentricity * Math.cos(ascendingNodeAnomaly));
  const descendingNodeRadius = semiLatusRectum / (1 + eccentricity * Math.cos(descendingNodeAnomaly));
  const ascendingNodePosition = orbitalPointToScene({
    radius: ascendingNodeRadius,
    trueAnomaly: ascendingNodeAnomaly,
    inclination,
    argumentOfPerihelion,
    ascendingNode
  });
  const descendingNodePosition = orbitalPointToScene({
    radius: descendingNodeRadius,
    trueAnomaly: descendingNodeAnomaly,
    inclination,
    argumentOfPerihelion,
    ascendingNode
  });

  return {
    valid: true,
    orbitPoints,
    perihelionPosition,
    aphelionPosition,
    ascendingNodePosition,
    descendingNodePosition,
    summary: {
      semiMajorAxisAu,
      eccentricity,
      inclinationDeg,
      argumentOfPerihelionDeg,
      ascendingNodeDeg
    }
  };
}

function SceneMarker({ position, radius, color, label, emissiveIntensity = 0.2 }) {
  const labelOffset = radius * LABEL_OFFSET_FACTOR;

  return (
    <group position={position}>
      <Sphere args={[radius, 24, 24]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} />
      </Sphere>
      {label ? (
        <Billboard follow position={[0, labelOffset, 0]}>
          <Text fontSize={radius * 1.85} color={color} anchorX="center" anchorY="middle">
            {label}
          </Text>
        </Billboard>
      ) : null}
    </group>
  );
}

SceneMarker.propTypes = {
  position: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.instanceOf(THREE.Vector3)
  ]).isRequired,
  radius: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  label: PropTypes.string,
  emissiveIntensity: PropTypes.number,
};

SceneMarker.defaultProps = {
  label: null,
  emissiveIntensity: 0.2,
};

const OrbitalView3D = ({ date, orbit }) => {
  const earthData = useMemo(() => buildEarthOrbitData(date), [date]);
  const objectData = useMemo(() => buildObjectOrbitData(orbit), [orbit]);

  const sceneRadius = useMemo(() => {
    const earthExtent = earthData.valid
      ? Math.max(...earthData.earthOrbitPoints.map(point => point.length()))
      : DEFAULT_SCENE_RADIUS;
    const objectExtent = objectData.valid
      ? Math.max(...objectData.orbitPoints.map(point => point.length()))
      : 0;

    return Math.max(DEFAULT_SCENE_RADIUS, earthExtent, objectExtent);
  }, [earthData, objectData]);

  const cameraPosition = useMemo(
    () => [sceneRadius * 1.45, sceneRadius * 0.95, sceneRadius * 1.45],
    [sceneRadius]
  );

  const ariesReferencePoints = useMemo(
    () => [
      new THREE.Vector3(EARTH_ORBIT_SEMI_MAJOR_AXIS_SCENE * (1 - EARTH_ORBITAL_ECCENTRICITY), 0, 0),
      new THREE.Vector3(sceneRadius * 1.1, 0, 0)
    ],
    [sceneRadius]
  );

  if (!earthData.valid) {
    return (
      <>
        <style>{orbitalView3DStyles}</style>
        <div className="orbital-view-3d__message">{earthData.message}</div>
      </>
    );
  }

  if (!objectData.valid) {
    return (
      <>
        <style>{orbitalView3DStyles}</style>
        <div className="orbital-view-3d__message">{objectData.message}</div>
      </>
    );
  }

  const summary = objectData.summary;

  const legendItems = [
    { swatchClass: 'orbital-view-3d__swatch--sun', label: 'Sol' },
    { swatchClass: 'orbital-view-3d__swatch--earth', label: 'Órbita terrestre y posición de la Tierra' },
    { swatchClass: 'orbital-view-3d__swatch--object', label: 'Órbita del meteoro' },
    { swatchClass: 'orbital-view-3d__swatch--nodes', label: 'Línea de nodos' }
  ];

  const metricItems = [
    { key: 'a', value: `${summary.semiMajorAxisAu.toFixed(3)} AU` },
    { key: 'e', value: summary.eccentricity.toFixed(4) },
    { key: 'i', value: `${summary.inclinationDeg.toFixed(2)}°` },
    { key: 'ω', value: `${summary.argumentOfPerihelionDeg.toFixed(2)}°` },
    { key: 'Ω', value: `${summary.ascendingNodeDeg.toFixed(2)}°` }
  ];

  return (
    <>
      <style>{orbitalView3DStyles}</style>
      <div className="orbital-view-3d">
        <div className="orbital-view-3d__viewport">
          <Canvas camera={{ position: cameraPosition, fov: 42 }} dpr={[1, 1.75]}>
            <color attach="background" args={["#fbfcff"]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[sceneRadius * 1.8, sceneRadius, sceneRadius * 1.2]} intensity={1.15} />
            <pointLight position={[0, 0, 0]} intensity={65} decay={2} distance={sceneRadius * 6} color="#ffd166" />

            <gridHelper args={[sceneRadius * 2.8, 24, '#d6dbe6', '#eef1f7']} />

            <Sphere position={[0, 0, 0]} args={[SUN_RADIUS_SCENE, 40, 40]}>
              <meshStandardMaterial emissive="#ffcc33" emissiveIntensity={2.8} color="#ffcc33" />
            </Sphere>

            <Line points={ariesReferencePoints} color="#980100" lineWidth={1.8} />
            <Billboard follow position={[sceneRadius * 1.14, 0.7, 0]}>
              <Text fontSize={0.72} color="#980100" anchorX="center" anchorY="middle">
                γ
              </Text>
            </Billboard>

            <Line points={earthData.earthOrbitPoints} color="#d96c6c" lineWidth={1.2} />
            <SceneMarker position={earthData.earthPosition} radius={EARTH_MARKER_RADIUS} color="#2a6fd6" label="Tierra" emissiveIntensity={0.35} />

            <Line points={objectData.orbitPoints} color="#1f77d4" lineWidth={1.35} />
            <Line
              points={[
                objectData.descendingNodePosition,
                new THREE.Vector3(0, 0, 0),
                objectData.ascendingNodePosition
              ]}
              color="#2f9e44"
              lineWidth={1.8}
            />

            <SceneMarker position={objectData.perihelionPosition} radius={REFERENCE_MARKER_RADIUS} color="#c1121f" label="q" emissiveIntensity={0.3} />
            <SceneMarker position={objectData.aphelionPosition} radius={REFERENCE_MARKER_RADIUS} color="#f4a261" label="Q" emissiveIntensity={0.25} />
            <SceneMarker position={objectData.ascendingNodePosition} radius={REFERENCE_MARKER_RADIUS * 0.9} color="#2f9e44" label="Ω↑" emissiveIntensity={0.2} />
            <SceneMarker position={objectData.descendingNodePosition} radius={REFERENCE_MARKER_RADIUS * 0.9} color="#6c757d" label="Ω↓" emissiveIntensity={0.15} />

            <OrbitControls
              enableZoom
              enablePan
              minDistance={sceneRadius * 0.8}
              maxDistance={sceneRadius * 5}
              target={[0, 0, 0]}
            />
          </Canvas>
        </div>

        <div className="orbital-view-3d__legend">
          {legendItems.map(item => (
            <div key={item.label} className="orbital-view-3d__legend-item">
              <span className={`orbital-view-3d__swatch ${item.swatchClass}`}></span>
              {item.label}
            </div>
          ))}
          <div className="orbital-view-3d__note">
            La posición roja marca el perihelio del objeto. Con los datos actuales no llega una anomalía u época orbital suficiente para deducir una posición instantánea físicamente fiable.
          </div>
          <div className="orbital-view-3d__metrics">
            {metricItems.map(item => (
              <span key={item.key}>
                <strong>{item.key}</strong> {item.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

OrbitalView3D.propTypes = {
  date: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
  ]).isRequired,
  orbit: PropTypes.shape({
    Informe_Z_IdInforme: PropTypes.number,
    a: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    e: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    i: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    omega: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    Omega_grados_votos_max_min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    Fecha: PropTypes.string,
  }).isRequired,
};

export default OrbitalView3D;
