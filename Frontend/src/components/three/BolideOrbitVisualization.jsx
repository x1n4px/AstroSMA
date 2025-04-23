import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react'; // useRef ya no es necesario si no se usa

const BolideOrbitVisualization = ({orbit}) => {
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

  const earthPerihelionPosition = useMemo(() => {
       const a = 1;
       const e = 0.0167;
       const q = a * (1 - e);
       return new THREE.Vector3(q, 0, 0);
   }, []);
  // --- Fin de datos y cálculos ---

  const sunTexture = useLoader(THREE.TextureLoader, '/sunTexture.jpg');
  const earthTexture = useLoader(THREE.TextureLoader, '/earthmap10k.webp');


  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 20 }}>
      {/* La luz ambiental puede quedar fuera, afecta globalmente */}
      <ambientLight intensity={0.5} />
      {/* Las estrellas de fondo también fuera del grupo */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      {/* OrbitControls opera sobre la cámara, así que va fuera */}
      <OrbitControls />

      {/* === INICIO DEL GRUPO ROTADO === */}
      {/* Aplicamos la rotación de -90 grados (-PI/2 rad) en el eje Y */}
      <group rotation={[0, -Math.PI / 2, 0]}>

        {/* La luz puntual (Sol) va dentro para que su posición relativa se mantenga */}
        <pointLight position={[0, 0, 0]} intensity={1} color="yellow" />

        {/* Sol */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshBasicMaterial map={sunTexture} />
        </mesh>

        {/* Tierra y su órbita */}
        <mesh position={earthPerihelionPosition}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial map={earthTexture} />
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
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={0.5} />
        </mesh>

        {/* El helper de ejes va dentro para mostrar el sistema de coordenadas rotado */}
        <axesHelper args={[3]} />

      </group>
      {/* === FIN DEL GRUPO ROTADO === */}

    </Canvas>
  );
};

export default BolideOrbitVisualization;