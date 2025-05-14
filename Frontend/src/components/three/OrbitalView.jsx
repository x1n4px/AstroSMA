// src/components/OrbitalView.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

// Constantes de la visualización
const SVG_WIDTH = 400; // Ancho del SVG
const SVG_HEIGHT = 300; // Alto del SVG
const SUN_RADIUS = 15; // Radio del Sol en píxeles
const EARTH_RADIUS = 5; // Radio de la Tierra en píxeles
const ORBIT_SEMI_MAJOR_AXIS_PX = 120; // Semieje mayor de la órbita en píxeles (escala de visualización)

// Constantes astronómicas
const EARTH_ORBITAL_ECCENTRICITY = 0.0167; // Excentricidad de la órbita terrestre
const DAYS_IN_ANOMALISTIC_YEAR = 365.259635; // Duración del año anomalístico (período orbital real de perihelio a perihelio)
const PERIHELION_DAY_OF_YEAR = 4; // Día del año aproximado del perihelio (varía, ej. 4 para 2025)

// Función para obtener el día del año (1-365 o 1-366)
function getDayOfYear(date) {
  const startDate = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startDate.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

const OrbitalView = ({ date }) => {
  const orbitalElements = useMemo(() => {
    if (!date) return null;

    const currentDate = (typeof date === 'string') ? new Date(date) : date;
    if (isNaN(currentDate.getTime())) {
        console.error("Invalid date provided to OrbitalView");
        return null;
    }

    const dayOfYear = getDayOfYear(currentDate);

    // Días desde el perihelio
    // El perihelio es nuestra referencia de 0 grados para la anomalía.
    let daysSincePerihelion = dayOfYear - PERIHELION_DAY_OF_YEAR;
    if (daysSincePerihelion < 0) {
      // Si la fecha es anterior al perihelio de este año, contamos desde el perihelio del año anterior.
      // Esto es una simplificación; para alta precisión se usarían Días Julianos.
      daysSincePerihelion += DAYS_IN_ANOMALISTIC_YEAR;
    }

    // 1. Anomalía Media (M)
    // Ángulo que habría recorrido la Tierra si la órbita fuera circular y la velocidad constante.
    const meanAnomalyRad = (2 * Math.PI * daysSincePerihelion) / DAYS_IN_ANOMALISTIC_YEAR;

    // 2. Anomalía Excéntrica (E)
    // Se resuelve M = E - e * sin(E). Usamos una aproximación iterativa (método de Newton simplificado).
    // E0 = M
    // E1 = M + e * sin(E0)
    // E2 = M + e * sin(E1) ...
    let eccentricAnomalyRad = meanAnomalyRad; // E0
    for (let i = 0; i < 5; i++) { // 5 iteraciones son suficientes para esta excentricidad
      eccentricAnomalyRad = meanAnomalyRad + EARTH_ORBITAL_ECCENTRICITY * Math.sin(eccentricAnomalyRad);
    }

    // 3. Anomalía Verdadera (ν)
    // Ángulo real de la Tierra en su órbita elíptica, vista desde el Sol (foco de la elipse).
    const cosE = Math.cos(eccentricAnomalyRad);
    const sinE = Math.sin(eccentricAnomalyRad);
    
    const cosTrueAnomaly = (cosE - EARTH_ORBITAL_ECCENTRICITY) / (1 - EARTH_ORBITAL_ECCENTRICITY * cosE);
    const sinTrueAnomaly = (Math.sqrt(1 - EARTH_ORBITAL_ECCENTRICITY**2) * sinE) / (1 - EARTH_ORBITAL_ECCENTRICITY * cosE);
    
    let trueAnomalyRad = Math.atan2(sinTrueAnomaly, cosTrueAnomaly);
    if (trueAnomalyRad < 0) {
      trueAnomalyRad += 2 * Math.PI; // Normalizar a [0, 2π)
    }

    // 4. Distancia heliocéntrica (r)
    // Distancia de la Tierra al Sol.
    const distanceFromSunPx = ORBIT_SEMI_MAJOR_AXIS_PX * (1 - EARTH_ORBITAL_ECCENTRICITY * cosE);

    // Coordenadas cartesianas de la Tierra relativas al Sol (Sol en el origen (0,0))
    // Perihelio está en el eje X positivo (trueAnomalyRad = 0)
    // El sistema de coordenadas matemático estándar tiene Y positivo "hacia arriba"
    const earthXRelSun = distanceFromSunPx * Math.cos(trueAnomalyRad);
    const earthYRelSun = distanceFromSunPx * Math.sin(trueAnomalyRad);

    // Posición del Sol en el SVG
    const sunSvgX = SVG_WIDTH / 2;
    const sunSvgY = SVG_HEIGHT / 2;

    // Posición de la Tierra en el SVG
    // En SVG, Y positivo es "hacia abajo", por lo que invertimos earthYRelSun
    const earthSvgX = sunSvgX + earthXRelSun;
    const earthSvgY = sunSvgY - earthYRelSun; // Invertir Y

    // Parámetros de la elipse de la órbita para SVG
    // El Sol está en un foco de la elipse.
    // Si el Sol está en (sunSvgX, sunSvgY) y el perihelio está a la derecha (+X),
    // el centro de la elipse está desplazado a la izquierda del Sol.
    const ellipseCenterX = sunSvgX - ORBIT_SEMI_MAJOR_AXIS_PX * EARTH_ORBITAL_ECCENTRICITY;
    const ellipseCenterY = sunSvgY;
    const ellipseRx = ORBIT_SEMI_MAJOR_AXIS_PX; // Semieje mayor
    const ellipseRy = ORBIT_SEMI_MAJOR_AXIS_PX * Math.sqrt(1 - EARTH_ORBITAL_ECCENTRICITY**2); // Semieje menor

    return {
      sunSvgX,
      sunSvgY,
      earthSvgX,
      earthSvgY,
      ellipseCenterX,
      ellipseCenterY,
      ellipseRx,
      ellipseRy,
    };
  }, [date]);

  if (!orbitalElements) {
    return <div>Proporciona una fecha válida.</div>;
  }

  const {
    sunSvgX,
    sunSvgY,
    earthSvgX,
    earthSvgY,
    ellipseCenterX,
    ellipseCenterY,
    ellipseRx,
    ellipseRy,
  } = orbitalElements;

  return (
    <div style={{ border: '1px solid #ccc', width: SVG_WIDTH, height: SVG_HEIGHT, margin: '20px' }}>
      <svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
        {/* Órbita de la Tierra */}
        <ellipse
          cx={ellipseCenterX}
          cy={ellipseCenterY}
          rx={ellipseRx}
          ry={ellipseRy}
          fill="none"
          stroke="gray"
          strokeDasharray="4 2" // Línea discontinua
        />

        {/* Sol */}
        <circle cx={sunSvgX} cy={sunSvgY} r={SUN_RADIUS} fill="yellow" stroke="orange" strokeWidth="1" />
        
        {/* Eje de Perihelio (opcional, para referencia) */}
        {/* <line 
            x1={sunSvgX - ORBIT_SEMI_MAJOR_AXIS_PX * (1 + EARTH_ORBITAL_ECCENTRICITY) - 10} 
            y1={sunSvgY} 
            x2={sunSvgX + ORBIT_SEMI_MAJOR_AXIS_PX * (1 - EARTH_ORBITAL_ECCENTRICITY) + 10} 
            y2={sunSvgY} 
            stroke="lightgrey" 
            strokeWidth="0.5"
        /> */}

        {/* Tierra */}
        <circle cx={earthSvgX} cy={earthSvgY} r={EARTH_RADIUS} fill="blue" />

        {/* Etiqueta de Fecha (opcional) */}
        <text x="10" y="20" fontSize="12" fill="black">
          Fecha: {date instanceof Date ? date.toLocaleDateString() : String(date)}
        </text>
      </svg>
    </div>
  );
};

OrbitalView.propTypes = {
  date: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
  ]).isRequired,
};

export default OrbitalView;