// src/components/OrbitalView3D.jsx
import React, { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

// Constantes de visualización y astronómicas (ajustables)
const SUN_RADIUS_SCENE = 1.5; // Radio del Sol en unidades de la escena
const EARTH_RADIUS_SCENE = 0.3; // Radio de la Tierra en unidades de la escena
const ORBIT_SEMI_MAJOR_AXIS_SCENE = 15; // Semieje mayor de la órbita de la Tierra en unidades de la escena

// Asumimos que 1 AU (semieje mayor de la Tierra) corresponde a ORBIT_SEMI_MAJOR_AXIS_SCENE unidades
const AU_TO_SCENE_UNITS = ORBIT_SEMI_MAJOR_AXIS_SCENE / 1.0; // 1 AU = 15 unidades

const EARTH_ORBITAL_ECCENTRICITY = 0.0167; // Excentricidad orbital de la Tierra
const DAYS_IN_ANOMALISTIC_YEAR = 365.259635; // Duración del año anomalístico de la Tierra
const PERIHELION_DAY_OF_YEAR = 4; // Día del año aproximado del perihelio de la Tierra (ej. 4 para 2025)

const EARTH_AXIAL_TILT_DEG = 23.44; // Inclinación axial de la Tierra en grados

const OTHER_OBJECT_RADIUS_SCENE = 0.3; // Radio del otro objeto en unidades de la escena

// Constantes para la raya que representa la Tierra
const EARTH_LINE_LENGTH_SCENE = EARTH_RADIUS_SCENE * 15; // Longitud de la raya de la Tierra
const EARTH_LINE_COLOR = 'red'; // Color de la raya
const EARTH_LINE_WIDTH = 2; // Ancho de la raya


// Función para obtener el día del año
function getDayOfYear(date) {
  const startDate = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startDate.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Componente interno para la Tierra (ahora representada por una línea)
const Earth = ({ position, date }) => {
  const earthGroupRef = useRef(); // Grupo para la orientación de la inclinación axial

  // La inclinación axial de la Tierra es (aproximadamente) fija en el espacio
  // mientras orbita alrededor del Sol. Esto es lo que causa las estaciones.
  // El eje de rotación de la Tierra está inclinado 23.44 grados con respecto
  // a la perpendicular de su plano orbital (la eclíptica).

  // Calculamos la orientación para que la 'raya' horizontal (originalmente en XZ local)
  // se incline con respecto al plano orbital XZ del mundo.
  // Si la raya horizontal está en el plano XZ local de la Tierra, y el eje Y local
  // es el polo, entonces aplicamos la inclinación alrededor del eje X del mundo.
  const earthTiltQuaternion = useMemo(() => {
    const tiltRad = THREE.MathUtils.degToRad(EARTH_AXIAL_TILT_DEG);
    // Inclinación alrededor del eje X del mundo para representar la inclinación axial
    const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tiltRad);
    return quaternion;
  }, []);

  // Puntos para la raya horizontal en el sistema de coordenadas local de la Tierra
  // Va de -Length/2 a +Length/2 a lo largo del eje X local (podría ser Z si se prefiere otra orientación)
  const linePoints = useMemo(() => {
      return [
          new THREE.Vector3(-EARTH_LINE_LENGTH_SCENE / 2, 0, 0),
          new THREE.Vector3(EARTH_LINE_LENGTH_SCENE / 2, 0, 0),
      ];
  }, []);

  // Ya no simulamos la rotación diaria en este componente de línea simple.

  return (
    // El grupo se posiciona en la órbita.
    // La línea dentro del grupo hereda la posición y la inclinación axial del grupo.
    <group ref={earthGroupRef} position={position} quaternion={earthTiltQuaternion}>
        {/* La Tierra representada por una línea */}
      <Line
        points={linePoints}
        color={EARTH_LINE_COLOR}
        lineWidth={EARTH_LINE_WIDTH}
        // Opcional: Material específico para la línea
        // material={new THREE.LineBasicMaterial({ color: EARTH_LINE_COLOR, linewidth: EARTH_LINE_WIDTH })}
      />
    </group>
  );
};

Earth.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  date: PropTypes.instanceOf(Date).isRequired, // La fecha aún se usa para calcular la posición orbital
};

// Componente interno para el otro objeto (asteroide, cometa, etc.)
const OtherObject = ({ position }) => {
    // No hay rotación diaria o inclinación axial simulada por ahora
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
    // Ajustar para años bisiestos o si la fecha es antes del perihelio en el mismo año
     while (daysSincePerihelion < 0) {
        daysSincePerihelion += DAYS_IN_ANOMALISTIC_YEAR;
    }


    const meanAnomalyRad = (2 * Math.PI * daysSincePerihelion) / DAYS_IN_ANOMALISTIC_YEAR;

    let eccentricAnomalyRad = meanAnomalyRad;
    for (let i = 0; i < 10; i++) { // Usar más iteraciones para mayor precisión
      eccentricAnomalyRad = meanAnomalyRad + EARTH_ORBITAL_ECCENTRICITY * Math.sin(eccentricAnomalyRad);
    }

    // Cálculo de la Anomalía Verdadera (v) desde la Anomalía Excéntrica (E)
    // tan(v/2) = sqrt((1+e)/(1-e)) * tan(E/2)
    const tanTrueAnomalyHalf = Math.sqrt((1 + EARTH_ORBITAL_ECCENTRICITY) / (1 - EARTH_ORBITAL_ECCENTRICITY)) * Math.tan(eccentricAnomalyRad / 2);
    let trueAnomalyRad = 2 * Math.atan(tanTrueAnomalyHalf);

    // Asegurarse de que la anomalía verdadera esté en [0, 2pi)
    while (trueAnomalyRad < 0) trueAnomalyRad += 2 * Math.PI;
    while (trueAnomalyRad >= 2 * Math.PI) trueAnomalyRad -= 2 * Math.PI;

    // Distancia del Sol a la Tierra
    const distanceFromSun = ORBIT_SEMI_MAJOR_AXIS_SCENE * (1 - EARTH_ORBITAL_ECCENTRICITY * Math.cos(eccentricAnomalyRad)); // Usar E aquí es más común para distancia

    // Posición de la Tierra relativa al Sol (en [0,0,0])
    // La órbita se asume en el plano XZ para una vista "desde arriba" más natural con Three.js
    // El eje Y sería el "norte" del sistema solar en esta configuración (aproximación a la eclíptica).
    // La anomalía verdadera 'trueAnomalyRad' es el ángulo desde el perihelio.
    // Asumiendo perihelio a lo largo del eje +X en el plano XZ (eclíptica simplificada).
    const earthX = distanceFromSun * Math.cos(trueAnomalyRad);
    const earthY = 0; // Órbita en el plano XZ
    const earthZ = distanceFromSun * Math.sin(trueAnomalyRad); // Usamos Z para el segundo eje horizontal

    // Puntos para la elipse de la órbita de la Tierra
    const earthOrbitPoints = [];
    const numOrbitPoints = 128; // Número de segmentos para dibujar la elipse
    const A_earth = ORBIT_SEMI_MAJOR_AXIS_SCENE; // Semieje mayor
    const E_earth = EARTH_ORBITAL_ECCENTRICITY;
    // Calcular puntos usando Anomalía Verdadera (v) es más directo para la forma desde el foco
    // r = a(1-e^2) / (1 + e cos(v))
    const p_earth = A_earth * (1 - E_earth * E_earth);

    for (let i = 0; i <= numOrbitPoints; i++) {
      const v_orbit = (i / numOrbitPoints) * 2 * Math.PI; // Anomalía verdadera de 0 a 2pi
      const r_orbit = p_earth / (1 + E_earth * Math.cos(v_orbit));
      // Coordenadas en el plano orbital (XZ) si perihelio está en +X
      earthOrbitPoints.push(
        new THREE.Vector3(
          r_orbit * Math.cos(v_orbit), // x
          0,                           // y (órbita en plano XZ)
          r_orbit * Math.sin(v_orbit)  // z
        )
      );
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
        console.warn("Datos incompletos o faltantes para la segunda órbita");
        return null;
    }

    // Extraer y convertir parámetros
    const a_other = parseFloat(orbit.a) * AU_TO_SCENE_UNITS; // Semieje mayor en unidades de escena
    const e_other = parseFloat(orbit.e); // Excentricidad
    const i_rad = THREE.MathUtils.degToRad(parseFloat(orbit.i)); // Inclinación en radianes
    const omega_rad = THREE.MathUtils.degToRad(parseFloat(orbit.omega)); // Argumento del periapsis en radianes
    const Omega_rad = THREE.MathUtils.degToRad(parseFloat(orbit.Omega_grados_votos_max_min)); // Longitud del nodo ascendente en radianes

    // Validar parámetros básicos
    if (isNaN(a_other) || isNaN(e_other) || isNaN(i_rad) || isNaN(omega_rad) || isNaN(Omega_rad) || a_other <= 0 || e_other < 0 || e_other >= 1) {
        console.error("Datos de órbita no válidos para el segundo objeto", orbit);
         return null;
    }

    // Calcular sines y cosines de los ángulos orbitales constantes
    const cos_i = Math.cos(i_rad);
    const sin_i = Math.sin(i_rad);
    const cos_Omega = Math.cos(Omega_rad);
    const sin_Omega = Math.sin(Omega_rad);
    const cos_omega = Math.cos(omega_rad); // También útil pre-calcular
    const sin_omega = Math.sin(omega_rad);


    // Calcular el semilatus rectum p
    const p_other = a_other * (1 - e_other * e_other);
     if (isNaN(p_other) || p_other <= 0) {
         console.error("Error calculando semilatus rectum para el segundo objeto");
         return null;
     }

    // Puntos para la elipse de la otra órbita
    const otherOrbitPoints = [];
    const numOrbitPoints = 128; // Número de segmentos

    // Calcular la matriz de rotación 3D a partir de Omega, i, omega
    // Usamos la fórmula de transformación estándar de coordenadas orbitales (perihelio en +X, plano XY)
    // a coordenadas eclípticas (X hacia punto vernal, Z hacia polo norte eclíptico).
    // En nuestra escena Three.js, el eje Y es 'arriba', y la órbita de la Tierra está en XZ.
    // Esto corresponde a la eclíptica en el plano XZ, con el polo norte eclíptico apuntando
    // aproximadamente en la dirección +Y.
    // La fórmula estándar mapea (orbital X, Y, Z) a (eclíptica X, Y, Z).
    // La fórmula es: X_ecl = r(cos(Omega)cos(w+v) - sin(Omega)sin(w+v)cos(i))
    //               Y_ecl = r(sin(Omega)cos(w+v) + cos(Omega)sin(w+v)cos(i))
    //               Z_ecl = r(sin(w+v)sin(i))
    // Donde r = p / (1 + e*cos(v)), v es la anomalía verdadera.
    // Para mapear a XZ (eclíptica) y Y (polo) en Three.js, intercambiamos Y_ecl y Z_ecl.
    // X_scene = X_ecl
    // Z_scene = Y_ecl  <-- Y en la fórmula estándar
    // Y_scene = Z_ecl  <-- Z en la fórmula estándar


    for (let i = 0; i <= numOrbitPoints; i++) {
      const trueAnomaly_v = (i / numOrbitPoints) * 2 * Math.PI; // Anomalía verdadera de 0 a 2pi
      const r = p_other / (1 + e_other * Math.cos(trueAnomaly_v));

      const cos_w_plus_v = Math.cos(omega_rad + trueAnomaly_v);
      const sin_w_plus_v = Math.sin(omega_rad + trueAnomaly_v);

      // Transformación a coordenadas de la escena (X-Z eclíptica, Y polo)
      const x_scene = r * (cos_Omega * cos_w_plus_v - sin_Omega * sin_w_plus_v * cos_i);
      const z_scene = r * (sin_Omega * cos_w_plus_v + cos_Omega * sin_w_plus_v * cos_i); // Corresponde a Y en la fórmula estándar
      const y_scene = r * (sin_w_plus_v * sin_i);                                       // Corresponde a Z en la fórmula estándar

      otherOrbitPoints.push(new THREE.Vector3(x_scene, y_scene, z_scene));
    }

     // Calcular la posición del Nodo Ascendente (donde cruza el plano XZ y Y pasa de - a +)
     // Esto ocurre cuando sin(omega + v) = 0, y v es tal que el cruce es ascendente.
     // Si i está entre 0 y pi, el nodo ascendente ocurre cuando omega + v = 2pi, 4pi, etc. -> v = 2pi - omega (o -omega)
     // Usaremos el nodo ascendente (v = 2pi - omega)
     let trueAnomaly_ascending_node = (2 * Math.PI - omega_rad);
     // Asegurarse de que la anomalía verdadera esté en [0, 2pi)
     while (trueAnomaly_ascending_node < 0) trueAnomaly_ascending_node += 2 * Math.PI;
     while (trueAnomaly_ascending_node >= 2 * Math.PI) trueAnomaly_ascending_node -= 2 * Math.PI;

     const r_node_pos = p_other / (1 + e_other * Math.cos(trueAnomaly_ascending_node));

     // Recalcular cos(omega + v_node) y sin(omega + v_node) para el nodo ascendente
     const cos_w_plus_v_node = Math.cos(omega_rad + trueAnomaly_ascending_node); // Esto debería ser cos(2pi) = 1 (si omega+v_node = 2pi)
     const sin_w_plus_v_node = Math.sin(omega_rad + trueAnomaly_ascending_node); // Esto debería ser sin(2pi) = 0 (si omega+v_node = 2pi)

      // Transformación a coordenadas de la escena para la posición del Nodo Ascendente
      // Notar que y_scene debería ser 0 aquí si la fórmula es correcta y sin(w+v) = 0
      const x_node_scene = r_node_pos * (cos_Omega * cos_w_plus_v_node - sin_Omega * sin_w_plus_v_node * cos_i);
      const z_node_scene = r_node_pos * (sin_Omega * cos_w_plus_v_node + cos_Omega * sin_w_plus_v_node * cos_i);
      const y_node_scene = r_node_pos * (sin_w_plus_v_node * sin_i); // Esto debería ser muy cercano a 0


    return {
      otherOrbitPoints,
      otherObjectPosition: [x_node_scene, y_node_scene, z_node_scene], // Posición del objeto en el Nodo Ascendente
      objectName: orbit.Informe_Z_IdInforme ? `Objeto ${orbit.Informe_Z_IdInforme}` : 'Otro Objeto',
      semiMajorAxis: orbit.a, // Mantener en AU para la etiqueta
      eccentricity: orbit.e,
    };

  }, [orbit]); // Recalcular si cambian los datos de la órbita

  if (!earthOrbitalData) {
    return (
      <div style={{ width: '100%', height: '500px', border: '1px solid grey', display:'flex', justifyContent:'center', alignItems:'center', background:'#f0f0f0' }}>
        Proporciona una fecha válida.
      </div>
    );
  }

  const { earthPosition, earthOrbitPoints, currentDate } = earthOrbitalData;
  const { otherOrbitPoints, otherObjectPosition, objectName, semiMajorAxis, eccentricity } = otherOrbitalData || {}; // Desestructurar condicionalmente


  return (
    <div style={{ width: '100%', height: '600px', maxWidth:'900px', margin:'auto', border: '1px solid #ccc', touchAction: 'none' }}>
      <Canvas camera={{ position: [0, ORBIT_SEMI_MAJOR_AXIS_SCENE * 2, ORBIT_SEMI_MAJOR_AXIS_SCENE * 2], fov: 60 }}> {/* Cámara mirando desde arriba y ángulo */}
        <ambientLight intensity={0.4} />
        {/* El Sol también actúa como fuente de luz */}
        <pointLight
            position={[0, 0, 0]}
            intensity={Math.PI * 200} // Three.js v0.155+ usa candelas, ajustar intensidad
            decay={2} // Decaimiento realista
            distance={ORBIT_SEMI_MAJOR_AXIS_SCENE * 6} // Aumentar distancia de la luz
            color="white"
        />

        {/* Sol */}
        <Sphere position={[0, 0, 0]} args={[SUN_RADIUS_SCENE, 32, 32]}>
          {/* Material emisivo para que el Sol brille */}
          <meshStandardMaterial emissive="yellow" emissiveIntensity={2} color="yellow" />
        </Sphere>

        {/* Tierra (ahora representada por una línea) */}
        <Earth position={earthPosition} date={currentDate} />

        {/* Trayectoria de la Órbita de la Tierra */}
        <Line points={earthOrbitPoints} color="red" lineWidth={1} />

        {/* Otro Objeto y su Órbita (si los datos están disponibles) */}
        {otherOrbitalData && (
            <>
                {/* El objeto se posiciona en el nodo ascendente */}
                <OtherObject position={otherObjectPosition} />
                 {/* Trayectoria de la Otra Órbita */}
                <Line points={otherOrbitPoints} color="blue" lineWidth={1} />

                 {/* Etiqueta del Otro Objeto */}
                 {/* <Text
                    position={[
                        otherObjectPosition[0],
                        otherObjectPosition[1] + OTHER_OBJECT_RADIUS_SCENE + 0.5, // Altura ajustada sobre el nodo
                        otherObjectPosition[2]
                    ]}
                    fontSize={0.5}
                    color="crimson"
                    anchorX="center"
                    anchorY="bottom"
                 >
                     {objectName} (a: {semiMajorAxis} AU, e: {eccentricity})
                 </Text> */}
            </>
        )}


        {/* Etiqueta de fecha en 3D (opcional) */}
        {/* <Text
          position={[0, ORBIT_SEMI_MAJOR_AXIS_SCENE * 0.9, 0]} // Posición sobre el Sol, ligeramente más alta
          fontSize={0.7}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Fecha: {currentDate.toLocaleDateString()}
        </Text>
        {otherOrbitalData && (
             <Text
                position={[0, ORBIT_SEMI_MAJOR_AXIS_SCENE * 0.7, 0]} // Debajo de la fecha
                fontSize={0.4}
                color="grey"
                anchorX="center"
                anchorY="middle"
            >
                (Posición del {objectName} mostrada en el Nodo Ascendente)
            </Text>
        )} */}


        {/* Controles de órbita para interactuar con la cámara */}
        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
      <div style={{textAlign: 'center', padding: '10px', background:'#f0f0f0', borderTop:'1px solid #ccc', fontSize:'0.9em'}}>
          Visualización del Sistema Solar. Fecha: {currentDate.toLocaleDateString()}.
          {otherOrbitalData && ` Mostrando la órbita de "${objectName}" (a: ${semiMajorAxis} AU, e: ${eccentricity}).`}
          <br/>
          (Usa el ratón/táctil para orbitar, mover y hacer zoom)
          {otherOrbitalData && <span style={{color:'crimson', fontWeight:'bold'}}> La posición del {objectName} mostrada es en su Nodo Ascendente (cruce del plano de la eclíptica).</span>}
      </div>
    </div>
  );
};

OrbitalView3D.propTypes = {
  date: PropTypes.oneOfType([
    PropTypes.instanceOf(Date), // Aceptar objetos Date
    PropTypes.string,           // Aceptar strings de fecha (ej. "2024-03-15")
  ]).isRequired,
  orbit: PropTypes.shape({
    Informe_Z_IdInforme: PropTypes.number,
    a: PropTypes.string.isRequired, // Semieje mayor (AU)
    e: PropTypes.string.isRequired, // Excentricidad
    i: PropTypes.string.isRequired, // Inclinación (grados)
    omega: PropTypes.string.isRequired, // Argumento del periapsis (grados)
    Omega_grados_votos_max_min: PropTypes.string.isRequired, // Longitud del nodo ascendente (grados)
    Fecha: PropTypes.string, // Fecha asociada a los datos/observación (no usada para calcular pos exacta)
    // Otros campos del objeto 'orbit' no son estrictamente necesarios para la órbita 3D
  }) // La segunda órbita es opcional
};

export default OrbitalView3D;