import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';

const BolideOrbitVisualization = ({ orbit, reportDate }) => {
  // Función para calcular la anomalía media de la Tierra en una fecha dada
  const calculateEarthPosition = (date) => {
    // Convertir la fecha a un objeto Date si no lo es
    const reportDateObj = new Date(date);
    
    // 1. Calcular el tiempo desde el perihelio (normalmente alrededor del 3-4 de enero)
    const year = reportDateObj.getFullYear();
    const perihelionDate = new Date(year, 0, 3); // 3 de enero
    const timeSincePerihelion = (reportDateObj - perihelionDate) / (1000 * 60 * 60 * 24); // en días
    
    // 2. Calcular la anomalía media (M)
    const earthOrbitalPeriod = 365.256; // días (período sideral)
    const meanAnomaly = (2 * Math.PI * timeSincePerihelion) / earthOrbitalPeriod;
    
    // 3. Resolver la ecuación de Kepler para la anomalía excéntrica (E)
    const eccentricity = 0.0167;
    let eccentricAnomaly = meanAnomaly;
    for (let i = 0; i < 10; i++) { // Iteración simple para resolver Kepler
      eccentricAnomaly = meanAnomaly + eccentricity * Math.sin(eccentricAnomaly);
    }
    
    // 4. Calcular la anomalía verdadera (ν)
    const trueAnomaly = 2 * Math.atan2(
      Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
      Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
    );
    
    // 5. Calcular la distancia y posición
    const a = 1; // UA
    const r = (a * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(trueAnomaly));
    const x = r * Math.cos(trueAnomaly);
    const y = r * Math.sin(trueAnomaly);
    
    return new THREE.Vector3(x, y, 0);
  };

  const calculateOrbitPoints = (a, e, i, omega, Omega_grados_votos_max_min, samples = 100) => {
    const points = [];
    for (let j = 0; j <= samples; j++) {
      const anomaly = (j / samples) * 2 * Math.PI;
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(anomaly));
      const xOrbital = r * Math.cos(anomaly);
      const yOrbital = r * Math.sin(anomaly);

      const cosOmega_grados_votos_max_min = Math.cos(Omega_grados_votos_max_min);
      const sinOmega_grados_votos_max_min = Math.sin(Omega_grados_votos_max_min);
      const cosomega = Math.cos(omega);
      const sinomega = Math.sin(omega);
      const cosi = Math.cos(i);
      const sini = Math.sin(i);

      const Px = cosomega * cosOmega_grados_votos_max_min - sinomega * cosi * sinOmega_grados_votos_max_min;
      const Py = cosomega * sinOmega_grados_votos_max_min + sinomega * cosi * cosOmega_grados_votos_max_min;
      const Pz = sinomega * sini;
      const Qx = -sinomega * cosOmega_grados_votos_max_min - cosomega * cosi * sinOmega_grados_votos_max_min;
      const Qy = -sinomega * sinOmega_grados_votos_max_min + cosomega * cosi * cosOmega_grados_votos_max_min;
      const Qz = cosomega * sini;

      const x = xOrbital * Px + yOrbital * Qx;
      const y = xOrbital * Py + yOrbital * Qy;
      const z = xOrbital * Pz + yOrbital * Qz;
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  };

  const earthOrbitPoints = useMemo(() => calculateOrbitPoints(1, 0.0167, 0, 0, 0), []);
  const bolideOrbitPoints = useMemo(() => calculateOrbitPoints(
    orbit.a, orbit.e, orbit.i, orbit.omega, orbit.Omega_grados_votos_max_min
  ), [orbit]);

  // Posición de la Tierra según la fecha del reporte
  const earthPosition = useMemo(() => calculateEarthPosition(reportDate), [reportDate]);

  const bolidePerihelionPosition = useMemo(() => {
    const { q, i, omega, Omega_grados_votos_max_min } = orbit;
    const xOrbitalPeri = q;
    const yOrbitalPeri = 0;
    const cosOmega_grados_votos_max_min = Math.cos(Omega_grados_votos_max_min);
    const sinOmega_grados_votos_max_min = Math.sin(Omega_grados_votos_max_min);
    const cosomega = Math.cos(omega);
    const sinomega = Math.sin(omega);
    const cosi = Math.cos(i);
    const sini = Math.sin(i);
    const Px = cosomega * cosOmega_grados_votos_max_min - sinomega * cosi * sinOmega_grados_votos_max_min;
    const Py = cosomega * sinOmega_grados_votos_max_min + sinomega * cosi * cosOmega_grados_votos_max_min;
    const Pz = sinomega * sini;
    const Qx = -sinomega * cosOmega_grados_votos_max_min - cosomega * cosi * sinOmega_grados_votos_max_min;
    const Qy = -sinomega * sinOmega_grados_votos_max_min + cosomega * cosi * cosOmega_grados_votos_max_min;
    const Qz = cosomega * sini;
    const xPeri = xOrbitalPeri * Px + yOrbitalPeri * Qx;
    const yPeri = xOrbitalPeri * Py + yOrbitalPeri * Qy;
    const zPeri = xOrbitalPeri * Pz + yOrbitalPeri * Qz;
    return new THREE.Vector3(xPeri, yPeri, zPeri);
  }, [orbit]);

  const sunTexture = useLoader(THREE.TextureLoader, '/sunTexture.jpg');
  const earthTexture = useLoader(THREE.TextureLoader, '/earthmap10k.webp');

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 20 }}>
      <ambientLight intensity={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <OrbitControls />

      <group rotation={[0, -Math.PI / 2, 0]}>
        <pointLight position={[0, 0, 0]} intensity={1} color="yellow" />

        {/* Sol */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshBasicMaterial map={sunTexture} />
        </mesh>

        {/* Tierra en su posición según la fecha */}
        <mesh position={earthPosition}>
          <sphereGeometry args={[0., 32, 32]} />
          {/* <meshStandardMaterial map={earthTexture} /> */}
          <meshStandardMaterial color="blue" emissive="orange" emissiveIntensity={0.5} />
        </mesh>
        
        <Line
          points={earthOrbitPoints}
          color="lightblue"
          lineWidth={1}
        />

        {/* Órbita del bólido */}
        <Line
          points={bolideOrbitPoints}
          color="red"
          lineWidth={2}
        />

        {/* Representación del bólido en el perihelio */}
        <mesh position={bolidePerihelionPosition}>
          <sphereGeometry args={[0.01, 16, 16]} />
          <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={0.5} />
        </mesh>

        <axesHelper args={[3]} />
      </group>
    </Canvas>
  );
};

export default BolideOrbitVisualization;