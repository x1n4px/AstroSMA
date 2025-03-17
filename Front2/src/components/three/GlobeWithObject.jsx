import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function GlobeAndComet() {
  const [globeTexture, setGlobeTexture] = useState(null);
  const [rotation, setRotation] = useState(0);

  // Cargar la textura manualmente
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/earthmap1k.jpg', (texture) => {
      setGlobeTexture(texture);
    });
  }, []);

  // Datos de ejemplo para la trayectoria del cometa
  const cometTrajectory = React.useMemo(() => {
    const points = [];
    const radiusX = 3;
    const radiusY = 1.5;
    const radiusZ = 2;
    const numPoints = 100;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const x = radiusX * Math.cos(angle);
      const y = radiusY * Math.sin(angle);
      const z = radiusZ * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, z));
    }

    return points;
  }, []);

  const trajectoryGeometry = React.useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(cometTrajectory);
    return geometry;
  }, [cometTrajectory]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    setRotation(elapsedTime * 0.5);
  });

  if (!globeTexture) return null; // Esperar a que la textura se cargue

  return (
    <>
      <ambientLight intensity={0.9} />
      <pointLight position={[10, 10, 10]} />
      <Stars />
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial map={globeTexture} />
      </mesh>
      <line>
        <lineBasicMaterial color="cyan" />
        <primitive object={trajectoryGeometry} />
      </line>
      <mesh
        position={[
          3 * Math.cos(rotation),
          1.5 * Math.sin(rotation),
          2 * Math.sin(rotation),
        ]}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <OrbitControls />
    </>
  );
}

function GlobeWithComet() {
  return (
    <Canvas style={{ width: 'auto', height: '100vh', backgroundColor: 'black' }} camera={{ position: [0, 0, 10], fov: 50 }}>
      <GlobeAndComet />
    </Canvas>
  );
}

export default GlobeWithComet;