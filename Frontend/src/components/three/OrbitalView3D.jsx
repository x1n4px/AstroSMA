// src/components/OrbitalView3D.jsx
import React, { useMemo, useRef } from 'react'; // useRef podría no ser necesario si Earth está completamente eliminado
import PropTypes from 'prop-types';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

// Constantes de visualización y astronómicas (ajustables)
const SUN_RADIUS_SCENE = 1.5; // Radio del Sol en unidades de la escena
// const EARTH_RADIUS_SCENE = 0.3; // No directamente usado si la línea de la Tierra está oculta
const ORBIT_SEMI_MAJOR_AXIS_SCENE = 15; // Semieje mayor de la órbita de la Tierra en unidades de la escena

// Asumimos que 1 AU (semieje mayor de la Tierra) corresponde a ORBIT_SEMI_MAJOR_AXIS_SCENE unidades
const AU_TO_SCENE_UNITS = ORBIT_SEMI_MAJOR_AXIS_SCENE / 1.0; // 1 AU = 15 unidades

const EARTH_ORBITAL_ECCENTRICITY = 0.0167; // Excentricidad orbital de la Tierra
const DAYS_IN_ANOMALISTIC_YEAR = 365.259635; // Duración del año anomalístico de la Tierra
const PERIHELION_DAY_OF_YEAR = 4; // Día del año aproximado del perihelio de la Tierra (ej. 4 para 2025)

// const EARTH_AXIAL_TILT_DEG = 23.44; // No usado si la línea de la Tierra está oculta

const OTHER_OBJECT_RADIUS_SCENE = 0.3; // Radio del otro objeto en unidades de la escena

// Constantes para la raya que representa la Tierra (AHORA OCULTA)
// const EARTH_LINE_LENGTH_SCENE = EARTH_RADIUS_SCENE * 15;
// const EARTH_LINE_COLOR = 'red';
// const EARTH_LINE_WIDTH = 2;

// Constantes para la línea de dirección del Punto de Aries desde la órbita terrestre
const ARIES_FROM_ORBIT_COLOR = 'red'; // Color de la línea de Aries (solicitado)
const ARIES_FROM_ORBIT_LINE_WIDTH = 2; // Ancho de la línea de Aries
const ARIES_FROM_ORBIT_LINE_LENGTH = 4; // Longitud de la "pequeña línea" que sale de la órbita
const ARIES_FROM_ORBIT_LABEL_TEXT = "γ"; // Etiqueta más corta para Aries (símbolo del Equinoccio Vernal)


// Función para obtener el día del año
function getDayOfYear(date) {
  const startDate = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startDate.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Componente interno para la Tierra (AHORA OCULTO Y NO USADO)
/*
const Earth = ({ position, date }) => {
  const earthGroupRef = useRef();

  const earthTiltQuaternion = useMemo(() => {
    const tiltRad = THREE.MathUtils.degToRad(EARTH_AXIAL_TILT_DEG);
    const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tiltRad);
    return quaternion;
  }, []);

  const linePoints = useMemo(() => {
      return [
          new THREE.Vector3(-EARTH_LINE_LENGTH_SCENE / 2, 0, 0),
          new THREE.Vector3(EARTH_LINE_LENGTH_SCENE / 2, 0, 0),
      ];
  }, []);

  return (
    // El grupo se posiciona en la órbita.
    // La línea dentro del grupo hereda la posición y la inclinación axial del grupo.
    <group ref={earthGroupRef} position={position} quaternion={earthTiltQuaternion}>
      <Line
        points={linePoints}
        color={EARTH_LINE_COLOR}
        lineWidth={EARTH_LINE_WIDTH}
      />
    </group>
  );
};

Earth.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
};
*/

// Componente interno para el otro objeto (asteroide, cometa, etc.)
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
  // Cálculo de la órbita y posición de la Tierra (se sigue necesitando para la trayectoria orbital)
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
      earthOrbitPoints.push(
        new THREE.Vector3(
          r_orbit * Math.cos(v_orbit), 
          0,                           
          r_orbit * Math.sin(v_orbit)  
        )
      );
    }

    return {
      earthPosition: [earthX, earthY, earthZ], // Se calcula pero el objeto Tierra no se renderiza
      earthOrbitPoints,
      currentDate, // Se calcula pero no se usa en etiquetas si están comentadas
    };
  }, [date]);

  // Cálculo de la órbita y posición del otro objeto
  const otherOrbitalData = useMemo(() => {
    if (!orbit || typeof orbit.a === 'undefined' || typeof orbit.e === 'undefined' ||
        typeof orbit.i === 'undefined' || typeof orbit.omega === 'undefined' || typeof orbit.Omega_grados_votos_max_min === 'undefined') {
        // console.warn("Datos incompletos o faltantes para la segunda órbita"); // Opcional: descomentar para depuración
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
    // const cos_omega = Math.cos(omega_rad); // No usado directamente
    // const sin_omega = Math.sin(omega_rad); // No usado directamente

    const p_other = a_other * (1 - e_other * e_other);
     if (isNaN(p_other) || p_other <= 0) {
         console.error("Error calculando semilatus rectum para el segundo objeto");
         return null;
     }

    const otherOrbitPoints = [];
    const numOrbitPointsOther = 256; // Renombrado para evitar colisión de nombres

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

  // Puntos para la línea de dirección de Aries desde la órbita de la Tierra
  const ariesLineFromOrbitPoints = useMemo(() => {
    // El perihelio de la Tierra está en el eje +X en este modelo (trueAnomaly = 0)
    // Distancia al perihelio: a * (1 - e)
    const earthPerihelionDistance = ORBIT_SEMI_MAJOR_AXIS_SCENE * (1 - EARTH_ORBITAL_ECCENTRICITY);
    return [
        new THREE.Vector3(earthPerihelionDistance, 0, 0), // Comienza en el perihelio de la Tierra sobre el eje +X
        new THREE.Vector3(earthPerihelionDistance + ARIES_FROM_ORBIT_LINE_LENGTH, 0, 0), // Se extiende una pequeña longitud adicionalmente por +X
    ];
  }, []); // Depende de constantes globales, así que se calcula una vez


  if (!earthOrbitalData) {
    return (
      <div style={{ width: '100%', height: '500px', border: '1px solid grey', display:'flex', justifyContent:'center', alignItems:'center', background:'#f0f0f0' }}>
        Proporciona una fecha válida.
      </div>
    );
  }

  // const { earthPosition, currentDate } = earthOrbitalData; // No se usan si Earth y etiquetas de fecha están ocultas
  const { earthOrbitPoints } = earthOrbitalData;
  const { otherOrbitPoints, otherObjectPosition, /* objectName, semiMajorAxis, eccentricity, */ ascendingNodePosition, descendingNodePosition } = otherOrbitalData || {};


  return (
    <div style={{ width: '100%', height: '600px', minWidth:'900px', margin:'auto', border: '1px solid #ccc', touchAction: 'none' }}>
      <Canvas camera={{ position: [0, ORBIT_SEMI_MAJOR_AXIS_SCENE * 2.5, ORBIT_SEMI_MAJOR_AXIS_SCENE * 2.5], fov: 100 }}> {/* Ajuste de cámara para mejor vista */}
        <ambientLight intensity={0.5} /> {/* Un poco más de luz ambiente */}
        <pointLight
            position={[0, 0, 0]}
            intensity={Math.PI * 200} 
            decay={2} 
            distance={ORBIT_SEMI_MAJOR_AXIS_SCENE * 6} 
            color="white"
        />

        {/* Sol */}
        <Sphere position={[0, 0, 0]} args={[SUN_RADIUS_SCENE, 32, 32]}>
          <meshStandardMaterial emissive="yellow" emissiveIntensity={2.5} color="yellow" /> {/* Sol un poco más brillante */}
        </Sphere>

        {/* Línea y etiqueta para la dirección del Punto de Aries desde la órbita terrestre */}
        <Line
            points={ariesLineFromOrbitPoints}
            color={ARIES_FROM_ORBIT_COLOR}
            lineWidth={ARIES_FROM_ORBIT_LINE_WIDTH}
        />
        <Text
            position={[
                (ORBIT_SEMI_MAJOR_AXIS_SCENE * (1 - EARTH_ORBITAL_ECCENTRICITY)) + ARIES_FROM_ORBIT_LINE_LENGTH + 0.5, // X: final de la línea + pequeño offset
                0.2, // Y: Ligeramente por encima del plano XZ para evitar z-fighting con la órbita
                0    // Z: En el plano XZ
            ]}
            fontSize={0.7} // Tamaño de la etiqueta γ
            color={ARIES_FROM_ORBIT_COLOR}
            anchorX="left" 
            anchorY="middle"
        >
             
        </Text>
        
        {/* La representación de la Tierra (línea) está ahora oculta */}
        {/* <Earth position={earthPosition} date={currentDate} /> */}

        {/* Trayectoria de la Órbita de la Tierra */}
        <Line points={earthOrbitPoints} color="red" lineWidth={1} />


        {/* Otro Objeto y su Órbita (si los datos están disponibles) */}
        {otherOrbitalData && (
            <>
                <OtherObject position={otherObjectPosition} />
                <Line points={otherOrbitPoints} color="dodgerblue" lineWidth={1} /> {/* Color ligeramente diferente para la otra órbita */}

                {ascendingNodePosition && descendingNodePosition && (
                    <Line
                        points={[descendingNodePosition, new THREE.Vector3(0, 0, 0), ascendingNodePosition]}
                        color="limegreen" // Color ligeramente diferente para la línea de nodos
                        lineWidth={2}
                    />
                )}
                 {/* <Text
                    position={[
                        otherObjectPosition[0],
                        otherObjectPosition[1] + OTHER_OBJECT_RADIUS_SCENE + 0.5, 
                        otherObjectPosition[2]
                    ]}
                    fontSize={0.5}
                    color="crimson"
                    anchorX="center"
                    anchorY="bottom"
                 >
                     {objectName} (a: {semiMajorAxis} AU, e: {eccentricity})
                 </Text> 
                 */}
            </>
        )}

        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
      {/* Las etiquetas de UI inferiores podrían necesitar ajustes si currentDate, objectName, etc., ya no se extraen arriba */}
      {/* <div style={{textAlign: 'center', padding: '10px', background:'#f0f0f0', borderTop:'1px solid #ccc', fontSize:'0.9em'}}>
          Visualización del Sistema Solar. 
          {earthOrbitalData && `Fecha: ${earthOrbitalData.currentDate.toLocaleDateString()}. `}
          {otherOrbitalData && ` Mostrando la órbita de "${otherOrbitalData.objectName}" (a: ${otherOrbitalData.semiMajorAxis} AU, e: ${otherOrbitalData.eccentricity}).`}
          <br/>
          (Usa el ratón/táctil para orbitar, mover y hacer zoom)
          {otherOrbitalData && <span style={{color:'crimson', fontWeight:'bold'}}> La posición del {otherOrbitalData.objectName} mostrada es en su Nodo Ascendente.</span>}
      </div> 
      */}
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