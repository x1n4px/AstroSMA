import React, { useState, useEffect, useMemo } from 'react';

const OrbitalDiagram = ({ date = new Date(), orbit}) => {
  // Datos de los planetas
  const planetsData = useMemo(() => [
    { name: "Mercury", a: 0.39, e: 0.205, period: 88, color: "gray" },
    { name: "Venus", a: 0.72, e: 0.007, period: 225, color: "orange" },
    { name: "Earth", a: 1, e: 0.017, period: 365.25, color: "blue" },
    { name: "Mars", a: 1.52, e: 0.093, period: 687, color: "red" },
    { name: "Jupiter", a: 5.20, e: 0.049, period: 4333, color: "brown" },
    { name: "Saturn", a: 9.58, e: 0.056, period: 10759, color: "goldenrod" },
    { name: "Uranus", a: 19.18, e: 0.046, period: 30687, color: "lightblue" },
    { name: "Neptune", a: 30.07, e: 0.010, period: 60190, color: "darkblue" }
  ], []);

  // Datos del bólido (extraídos del JSON proporcionado)
  const bolideData = useMemo(() => ({
    a: orbit?.a ? parseFloat(orbit.a.split(' ')[0]) : null,
    e: orbit?.e ? parseFloat(orbit.e.split(' ')[0]) : null,
    q: orbit?.q ? parseFloat(orbit.q.split(' ')[0]) : null,
    i: orbit?.i ? parseFloat(orbit.i.split(' ')[0]) : null,
    omega: orbit?.omega ? parseFloat(orbit.omega.split(' ')[0]) : null,
    Omega: orbit?.Omega ? parseFloat(orbit.Omega.replace(/\(|\)|,/g, '').split(' ')[0]) : null,
    observationDate: orbit?.observationDate ? new Date(orbit.observationDate) : null,
    observationTime: orbit?.observationTime || null
  }), [orbit]);

  // Estado para las posiciones
  const [planetPositions, setPlanetPositions] = useState([]);
  const [bolideOrbitPoints, setBolideOrbitPoints] = useState([]);

  // Escalado para SVG
  const scale = 50;
  const sunRadius = 10;

  // Función para calcular posición planetaria simplificada
  const calculatePlanetPosition = useMemo(() => (a, e, period, date) => {
    const daysSinceEpoch = (date - new Date('2000-01-01')) / (1000 * 60 * 60 * 24);
    const meanAnomaly = (2 * Math.PI * daysSinceEpoch) / period;
    const eccentricAnomaly = meanAnomaly + e * Math.sin(meanAnomaly);
    return {
      x: a * (Math.cos(eccentricAnomaly) - e),
      y: a * Math.sqrt(1 - e*e) * Math.sin(eccentricAnomaly)
    };
  }, []);

  // Función para calcular puntos de la órbita del bólido
  const calculateBolideOrbit = useMemo(() => () => {
    const points = [];
    const { a, e, i, omega, Omega } = bolideData;

    // Convertir ángulos a radianes
    const i_rad = i * Math.PI / 180;
    const omega_rad = omega * Math.PI / 180;
    const Omega_rad = Omega * Math.PI / 180;

    // Calcular puntos de la órbita
    for (let theta = 0; theta < 2 * Math.PI; theta += 0.1) {
      // Coordenadas en el plano orbital
      const r = (a * (1 - e*e)) / (1 + e * Math.cos(theta));
      const x_orb = r * Math.cos(theta);
      const y_orb = r * Math.sin(theta);

      // Rotación 3D (simplificada a 2D para visualización)
      const x = x_orb * (Math.cos(Omega_rad) * Math.cos(omega_rad) - Math.sin(Omega_rad) * Math.sin(omega_rad) * Math.cos(i_rad));
      const y = y_orb * (Math.sin(Omega_rad) * Math.cos(omega_rad) + Math.cos(Omega_rad) * Math.sin(omega_rad) * Math.cos(i_rad));

      points.push({ x: x * scale, y: y * scale });
    }

    return points;
  }, [bolideData]);

  // Efecto para calcular posiciones
  useEffect(() => {

    const positions = planetsData.map(planet => {
      const pos = calculatePlanetPosition(planet.a, planet.e, planet.period, date);
      return {
        name: planet.name,
        x: pos.x * scale,
        y: pos.y * scale,
        color: planet.color
      };
    });
    setPlanetPositions(positions);
  
    // Órbita del bólido
    setBolideOrbitPoints(calculateBolideOrbit());
  }, [date, planetsData, calculatePlanetPosition, calculateBolideOrbit]);

  

  // Control de zoom
  const [zoom, setZoom] = useState(1);
  const handleZoom = (e) => {
    setZoom(prevZoom => Math.min(Math.max(prevZoom + e * 0.1, 0.5), 3));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 w-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Sistema Solar </h2>
        <p className="text-sm text-gray-600">Órbita del bólido</p>
        <div className="mt-2">
          <button
            style={{ backgroundColor: '#000' }}
            onClick={() => handleZoom(-1)}
            className="px-4 py-2 m-2 text-white rounded"
          >
            Zoom Out
          </button>
          <button
            style={{ backgroundColor: '#000' }}
            onClick={() => handleZoom(1)}
            className="px-4 py-2 m-2 text-white rounded"
          >
            Zoom In
          </button>
        </div>
      </div>

      <svg width={800} height={800} viewBox={`-400 -400 800 800`}>
        {/* Fondo */}
        <rect x="-400" y="-400" width="800" height="800" fill="black" />

        {/* Sol */}
        <circle cx="0" cy="0" r={sunRadius} fill="yellow" />

        {/* Órbitas planetas */}
        {planetsData.map((planet, index) => (
          <ellipse
            key={`orbit-${index}`}
            cx="0"
            cy="0"
            rx={planet.a * scale * zoom}
            ry={planet.a * Math.sqrt(1 - planet.e*planet.e) * scale * zoom}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
          />
        ))}

        {/* Órbita del bólido */}
        <path
          d={`M ${bolideOrbitPoints[0]?.x * zoom || 0} ${bolideOrbitPoints[0]?.y * zoom || 0}
            ${bolideOrbitPoints.map(p => `L ${p.x * zoom} ${p.y * zoom}`).join(' ')}`}
          fill="none"
          stroke="rgba(255, 0, 0, 0.7)"
          strokeWidth="2"
        />

        {/* Planetas */}
        {planetPositions.map((planet, index) => (
          <circle
            key={`planet-${index}`}
            cx={planet.x * zoom}
            cy={planet.y * zoom}
            r={planet.name === "Earth" ? 8 : 5}
            fill={planet.color}
          />
        ))}

        {/* Etiquetas planetas */}
        {planetPositions.map((planet, index) => (
          <text
            key={`label-${index}`}
            x={planet.x * zoom + 10}
            y={planet.y * zoom}
            fill="white"
            fontSize="12"
          >
            {planet.name}
          </text>
        ))}
      </svg>

      <div className="mt-4"></div>
    </div>
  );
};

export default OrbitalDiagram;