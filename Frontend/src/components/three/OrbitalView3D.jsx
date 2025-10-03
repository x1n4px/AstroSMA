// src/components/OrbitalView3D.jsx
import React, { useMemo, useRef } from 'react'; // useRef podría no ser necesario si Earth está completamente eliminado
import PropTypes from 'prop-types';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

const SUN_RADIUS_SCENE = 1.5; 
const ORBIT_SEMI_MAJOR_AXIS_SCENE = 15; 
const AU_TO_SCENE_UNITS = ORBIT_SEMI_MAJOR_AXIS_SCENE / 1.0; 
const EARTH_ORBITAL_ECCENTRICITY = 0.0167; 
const DAYS_IN_ANOMALISTIC_YEAR = 365.259635; 
const PERIHELION_DAY_OF_YEAR = 4; 
const OTHER_OBJECT_RADIUS_SCENE = 0.3;

// Constantes para la línea de dirección del Punto de Aries desde la órbita terrestre
const ARIES_FROM_ORBIT_COLOR = 'red';
const ARIES_FROM_ORBIT_LINE_WIDTH = 2; 
const ARIES_FROM_ORBIT_LINE_LENGTH = 4; 


// Función para obtener el día del año
function getDayOfYear(date) {
  const startDate = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startDate.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

const OtherObject = ({ position }) => {
  return (
    <Sphere position={position} args={[OTHER_OBJECT_RADIUS_SCENE, 32, 32]}>
      <meshStandardMaterial color="crimson" roughness={0.8} metalness={0.1} />
    </Sphere>
  );
};

OtherObject.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
};


const OrbitalView3D = ({ date, orbit }) => {
  // Cálculo de la órbita y posición de la Tierra
  const earthOrbitalData = useMemo(() => {
    if (!date) return null;
    const currentDate = (typeof date === 'string') ? new Date(date) : date;
    if (isNaN(currentDate.getTime())) {
      console.error("Fecha inválida proporcionada a OrbitalView3D para la Tierra");
      return null;
    }

    const dayOfYear = getDayOfYear(currentDate);
    let daysSincePerihelion = dayOfYear - PERIHELION_DAY_OF_YEAR;
    while (daysSincePerihelion < 0) {
      daysSincePerihelion += DAYS_IN_ANOMALISTIC_YEAR;
    }

    const meanAnomalyRad = (2 * Math.PI * daysSincePerihelion) / DAYS_IN_ANOMALISTIC_YEAR;

    let eccentricAnomalyRad = meanAnomalyRad;
    for (let i = 0; i < 10; i++) {
      eccentricAnomalyRad = meanAnomalyRad + EARTH_ORBITAL_ECCENTRICITY * Math.sin(eccentricAnomalyRad);
    }

    // Cálculo de la Anomalía Verdadera (v) desde la Anomalía Excéntrica (E)
    const tanTrueAnomalyHalf = Math.sqrt((1 + EARTH_ORBITAL_ECCENTRICITY) / (1 - EARTH_ORBITAL_ECCENTRICITY)) * Math.tan(eccentricAnomalyRad / 2);
    let trueAnomalyRad = 2 * Math.atan(tanTrueAnomalyHalf);

    while (trueAnomalyRad < 0) trueAnomalyRad += 2 * Math.PI;
    while (trueAnomalyRad >= 2 * Math.PI) trueAnomalyRad -= 2 * Math.PI;

    // Distancia del Sol a la Tierra
    const distanceFromSun = ORBIT_SEMI_MAJOR_AXIS_SCENE * (1 - EARTH_ORBITAL_ECCENTRICITY * Math.cos(eccentricAnomalyRad));

    // Posición de la Tierra relativa al Sol (en [0,0,0])
    const earthX = distanceFromSun * Math.cos(trueAnomalyRad);
    const earthY = 0;
    const earthZ = distanceFromSun * Math.sin(trueAnomalyRad);

    // Puntos para la elipse de la órbita de la Tierra
    const earthOrbitPoints = [];
    const numOrbitPoints = 128;
    const A_earth = ORBIT_SEMI_MAJOR_AXIS_SCENE;
    const E_earth = EARTH_ORBITAL_ECCENTRICITY;
    const p_earth = A_earth * (1 - E_earth * E_earth);

    for (let i = 0; i <= numOrbitPoints; i++) {
      const v_orbit = (i / numOrbitPoints) * 2 * Math.PI;
      const r_orbit = p_earth / (1 + E_earth * Math.cos(v_orbit));
      earthOrbitPoints.push(new THREE.Vector3(r_orbit * Math.cos(v_orbit), 0, r_orbit * Math.sin(v_orbit)));
    }

    return {
      earthPosition: [earthX, earthY, earthZ],
      earthOrbitPoints,
      currentDate,
    };
  }, [date]);

  // Cálculo de la órbita y posición del otro objeto
  const otherOrbitalData = useMemo(() => {
    if (!orbit || typeof orbit.a === 'undefined' || typeof orbit.e === 'undefined' ||
      typeof orbit.i === 'undefined' || typeof orbit.omega === 'undefined' || typeof orbit.Omega_grados_votos_max_min === 'undefined') {
      return null;
    }

    const a_other = parseFloat(orbit.a) * AU_TO_SCENE_UNITS;
    const e_other = parseFloat(orbit.e);
    const i_rad = THREE.MathUtils.degToRad(parseFloat(orbit.i));
    const omega_rad = THREE.MathUtils.degToRad(parseFloat(orbit.omega));
    const Omega_rad = THREE.MathUtils.degToRad(parseFloat(orbit.Omega_grados_votos_max_min));

    if (isNaN(a_other) || isNaN(e_other) || isNaN(i_rad) || isNaN(omega_rad) || isNaN(Omega_rad) || a_other <= 0 || e_other < 0 || e_other >= 1) {
      console.error("Datos de órbita no válidos para el segundo objeto", orbit);
      return null;
    }

    const cos_i = Math.cos(i_rad);
    const sin_i = Math.sin(i_rad);
    const cos_Omega = Math.cos(Omega_rad);
    const sin_Omega = Math.sin(Omega_rad);
    const p_other = a_other * (1 - e_other * e_other);
    if (isNaN(p_other) || p_other <= 0) {
      console.error("Error calculando semilatus rectum para el segundo objeto");
      return null;
    }

    const otherOrbitPoints = [];
    const numOrbitPointsOther = 256;

    for (let i = 0; i <= numOrbitPointsOther; i++) {
      const trueAnomaly_v = (i / numOrbitPointsOther) * 2 * Math.PI;
      const r = p_other / (1 + e_other * Math.cos(trueAnomaly_v));

      const cos_w_plus_v = Math.cos(omega_rad + trueAnomaly_v);
      const sin_w_plus_v = Math.sin(omega_rad + trueAnomaly_v);

      const x_scene = r * (cos_Omega * cos_w_plus_v - sin_Omega * sin_w_plus_v * cos_i);
      const z_scene = r * (sin_Omega * cos_w_plus_v + cos_Omega * sin_w_plus_v * cos_i);
      const y_scene = r * (sin_w_plus_v * sin_i);

      otherOrbitPoints.push(new THREE.Vector3(x_scene, y_scene, z_scene));
    }

    let trueAnomaly_ascending_node = (2 * Math.PI - omega_rad);
    while (trueAnomaly_ascending_node < 0) trueAnomaly_ascending_node += 2 * Math.PI;
    while (trueAnomaly_ascending_node >= 2 * Math.PI) trueAnomaly_ascending_node -= 2 * Math.PI;

    const r_node_pos_asc = p_other / (1 + e_other * Math.cos(trueAnomaly_ascending_node));
    const cos_w_plus_v_node_asc = Math.cos(omega_rad + trueAnomaly_ascending_node);
    const sin_w_plus_v_node_asc = Math.sin(omega_rad + trueAnomaly_ascending_node);

    const x_node_scene_asc = r_node_pos_asc * (cos_Omega * cos_w_plus_v_node_asc - sin_Omega * sin_w_plus_v_node_asc * cos_i);
    const z_node_scene_asc = r_node_pos_asc * (sin_Omega * cos_w_plus_v_node_asc + cos_Omega * sin_w_plus_v_node_asc * cos_i);
    const y_node_scene_asc = r_node_pos_asc * (sin_w_plus_v_node_asc * sin_i);

    const ascendingNodePosition = new THREE.Vector3(x_node_scene_asc, y_node_scene_asc, z_node_scene_asc);

    let trueAnomaly_descending_node = (Math.PI - omega_rad);
    while (trueAnomaly_descending_node < 0) trueAnomaly_descending_node += 2 * Math.PI;
    while (trueAnomaly_descending_node >= 2 * Math.PI) trueAnomaly_descending_node -= 2 * Math.PI;

    const r_node_pos_desc = p_other / (1 + e_other * Math.cos(trueAnomaly_descending_node));
    const cos_w_plus_v_node_desc = Math.cos(omega_rad + trueAnomaly_descending_node);
    const sin_w_plus_v_node_desc = Math.sin(omega_rad + trueAnomaly_descending_node);

    const x_node_scene_desc = r_node_pos_desc * (cos_Omega * cos_w_plus_v_node_desc - sin_Omega * sin_w_plus_v_node_desc * cos_i);
    const z_node_scene_desc = r_node_pos_desc * (sin_Omega * cos_w_plus_v_node_desc + cos_Omega * sin_w_plus_v_node_desc * cos_i);
    const y_node_scene_desc = r_node_pos_desc * (sin_w_plus_v_node_desc * sin_i);

    const descendingNodePosition = new THREE.Vector3(x_node_scene_desc, y_node_scene_desc, z_node_scene_desc);


    return {
      otherOrbitPoints,
      otherObjectPosition: [x_node_scene_asc, y_node_scene_asc, z_node_scene_asc],
      objectName: orbit.Informe_Z_IdInforme ? `Objeto ${orbit.Informe_Z_IdInforme}` : 'Otro Objeto',
      semiMajorAxis: orbit.a,
      eccentricity: orbit.e,
      ascendingNodePosition,
      descendingNodePosition,
    };

  }, [orbit]);

  const ariesLineFromOrbitPoints = useMemo(() => {
    const earthPerihelionDistance = ORBIT_SEMI_MAJOR_AXIS_SCENE * (1 - EARTH_ORBITAL_ECCENTRICITY);
    return [new THREE.Vector3(earthPerihelionDistance, 0, 0), new THREE.Vector3(earthPerihelionDistance + ARIES_FROM_ORBIT_LINE_LENGTH, 0, 0),];
  }, []);


  if (!earthOrbitalData) {
    return (
      <div style={{ width: '100%', height: '500px', border: '1px solid grey', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f0f0' }}>
        Proporciona una fecha válida.
      </div>
    );
  }

  const { earthOrbitPoints } = earthOrbitalData;
  const { otherOrbitPoints, otherObjectPosition, ascendingNodePosition, descendingNodePosition } = otherOrbitalData || {};


  return (
    <div style={{ width: '100%', height: '600px', minWidth: '900px', margin: 'auto', border: '1px solid #ccc', touchAction: 'none' }}>
      <Canvas camera={{ position: [0, ORBIT_SEMI_MAJOR_AXIS_SCENE * 2.5, ORBIT_SEMI_MAJOR_AXIS_SCENE * 2.5], fov: 100 }}>
        <ambientLight intensity={0.5} />
        <pointLight
          position={[0, 0, 0]}
          intensity={Math.PI * 200}
          decay={2}
          distance={ORBIT_SEMI_MAJOR_AXIS_SCENE * 6}
          color="white"
        />

        {/* Sol */}
        <Sphere position={[0, 0, 0]} args={[SUN_RADIUS_SCENE, 32, 32]}>
          <meshStandardMaterial emissive="yellow" emissiveIntensity={2.5} color="yellow" />
        </Sphere>

        {/* Punto de Aries desde la órbita terrestre */}
        <Line
          points={ariesLineFromOrbitPoints}
          color={ARIES_FROM_ORBIT_COLOR}
          lineWidth={ARIES_FROM_ORBIT_LINE_WIDTH}
        />
        <Text
          position={[(ORBIT_SEMI_MAJOR_AXIS_SCENE * (1 - EARTH_ORBITAL_ECCENTRICITY)) + ARIES_FROM_ORBIT_LINE_LENGTH + 0.5, 0.2, 0]}
          fontSize={0.7} // Tamaño de la etiqueta γ
          color={ARIES_FROM_ORBIT_COLOR}
          anchorX="left"
          anchorY="middle"
        >

        </Text>

        {/* Trayectoria de la Órbita de la Tierra */}
        <Line points={earthOrbitPoints} color="red" lineWidth={1} />
        {otherOrbitalData && (
          <>
            <OtherObject position={otherObjectPosition} />
            <Line points={otherOrbitPoints} color="dodgerblue" lineWidth={1} />

            {ascendingNodePosition && descendingNodePosition && (
              <Line
                points={[descendingNodePosition, new THREE.Vector3(0, 0, 0), ascendingNodePosition]}
                color="limegreen" // Color ligeramente diferente para la línea de nodos
                lineWidth={2}
              />
            )}

          </>
        )}

        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>

    </div>
  );
};

OrbitalView3D.propTypes = {
  date: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
  ]).isRequired,
  orbit: PropTypes.shape({
    Informe_Z_IdInforme: PropTypes.number,
    a: PropTypes.string.isRequired,
    e: PropTypes.string.isRequired,
    i: PropTypes.string.isRequired,
    omega: PropTypes.string.isRequired,
    Omega_grados_votos_max_min: PropTypes.string.isRequired,
    Fecha: PropTypes.string,
  })
};

export default OrbitalView3D;