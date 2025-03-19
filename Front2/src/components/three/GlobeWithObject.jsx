import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function GlobeAndComet() {
  const [globeTexture, setGlobeTexture] = React.useState(null);
  const cometRef = useRef();
  const timeRef = useRef(0);
  const tailRef = useRef(); // Referencia para la cola del cometa
  const scaleFactor = 0.1; // Factor de escala para la órbita

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/earthmap1k.jpg', setGlobeTexture);
  }, []);

  const cometTrajectory = useMemo(() => {
    const points = [];
    const numPoints = 200;

    const a = 75.9;
    const e = 0.989;
    const i = THREE.MathUtils.degToRad(90.8);
    const Ω = THREE.MathUtils.degToRad(59.8);
    const ω = THREE.MathUtils.degToRad(172.5);

    for (let j = 0; j <= numPoints; j++) {
      const M = (j / numPoints) * 2 * Math.PI;
      let E = M;
      let F;

      do {
        F = E - e * Math.sin(E) - M;
        E = E - F / (1 - e * Math.cos(E));
      } while (Math.abs(F) > 1e-6);

      const x = a * (Math.cos(E) - e);
      const y = a * Math.sqrt(1 - e * e) * Math.sin(E);

      const cosΩ = Math.cos(Ω);
      const sinΩ = Math.sin(Ω);
      const cosi = Math.cos(i);
      const sini = Math.sin(i);
      const cosω = Math.cos(ω);
      const sinω = Math.sin(ω);

      const X = (cosΩ * cosω - sinΩ * sinω * cosi) * x + (-cosΩ * sinω - sinΩ * cosω * cosi) * y;
      const Y = (sinΩ * cosω + cosΩ * sinω * cosi) * x + (-sinΩ * sinω + cosΩ * cosω * cosi) * y;
      const Z = (sinω * sini) * x + (cosω * sini) * y;

      points.push(new THREE.Vector3(X * scaleFactor, Y * scaleFactor, Z * scaleFactor)); // Aplicar escala
    }

    return points;
  }, [scaleFactor]);

  const trajectoryGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(cometTrajectory);
  }, [cometTrajectory]);

  useFrame(({ clock }) => {
    if (cometRef.current) {
      timeRef.current += 0.001;
      const index = Math.floor((timeRef.current % 1) * cometTrajectory.length);
      const { x, y, z } = cometTrajectory[index];
      cometRef.current.position.set(x, y, z);
        if (tailRef.current) {
            tailRef.current.position.set(x,y,z);
            tailRef.current.lookAt(0,0,0);
        }
    }
  });

  if (!globeTexture) return null;

  return (
    <>
      <ambientLight intensity={0.9} />
      <pointLight position={[10, 10, 10]} />
      <Stars />

      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial map={globeTexture} />
      </mesh>

      <line geometry={trajectoryGeometry}>
        <lineBasicMaterial attach="material" color="cyan" linewidth={2} />
      </line>

      <mesh ref={cometRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="lightgray" />
      </mesh>
        <mesh ref={tailRef} position={[0,0,0]}>
            <coneGeometry args={[0.05, 0.5, 32]}/>
            <meshBasicMaterial color="orange"/>
        </mesh>
      <OrbitControls target={[0, 0, 0]} minDistance={5} maxDistance={50} /> // Ajustar maxDistance
    </>
  );
}

function GlobeWithComet() {
  return (
    <Canvas
      style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}
      camera={{ position: [11, 8.5, 15], fov: 80 }} // Ajustar la posición de la cámara
    >
      <GlobeAndComet />
    </Canvas>
  );
}

export default GlobeWithComet;