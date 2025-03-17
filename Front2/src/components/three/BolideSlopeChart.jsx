import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Datos de ejemplo para el bólido
const pointA = {
  lat: 40.4168,
  lon: -3.7038,
  altitude: 120,
};

const pointB = {
  lat: 41.3851,
  lon: 2.1734,
  altitude: 45,
};

// Convertir coordenadas GPS a coordenadas 3D (x, y, z)
const gpsToCartesian = (lat, lon, altitude) => {
  const radius = 100;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius + altitude) * Math.sin(phi) * Math.cos(theta);
  const y = (radius + altitude) * Math.cos(phi);
  const z = (radius + altitude) * Math.sin(phi) * Math.sin(theta);

  return { x, y, z };
};

// Componente para visualizar la pendiente del bólido
function BolideSlopeChart() {
  const posA = gpsToCartesian(pointA.lat, pointA.lon, pointA.altitude);
  const posB = gpsToCartesian(pointB.lat, pointB.lon, pointB.altitude);

  const linePoints = [new THREE.Vector3(posA.x, posA.y, posA.z), new THREE.Vector3(posB.x, posB.y, posB.z)];

  // Calcular el centro de la pendiente
  const center = new THREE.Vector3().addVectors(linePoints[0], linePoints[1]).multiplyScalar(0.5);

  // Calcular la distancia entre los puntos
  const distance = linePoints[0].distanceTo(linePoints[1]);

  // Ajustar la posición de la cámara
  const cameraPosition = center.clone().add(new THREE.Vector3(0, distance * 0.5, distance * 1.5));

  return (
    <Canvas
      style={{ width: '100vw', height: '100vh', backgroundColor: 'white' }}
      camera={{ position: cameraPosition.toArray(), fov: 50 }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Sphere position={[posA.x, posA.y, posA.z]} args={[2, 16, 16]}>
        <meshBasicMaterial color="red" />
      </Sphere>
      
      <Sphere position={[posB.x, posB.y, posB.z]} args={[2, 16, 16]}>
        <meshBasicMaterial color="blue" />
      </Sphere>
      <Line points={linePoints} color="cyan" lineWidth={2} />
      <OrbitControls target={center} /> {/* Centrar la cámara en el punto medio */}
    </Canvas>
  );
}

export default BolideSlopeChart;