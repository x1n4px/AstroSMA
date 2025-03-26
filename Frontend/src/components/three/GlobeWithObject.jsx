import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function GlobeAndComet({ orbitalElements }) {
  const [globeTexture, setGlobeTexture] = React.useState(null);
  const [meteorTexture, setMeteorTexture] = useState(null);
  const cometRef = useRef();
  const timeRef = useRef(0);
  const tailRef = useRef();
  const scaleFactor = 20;
  const earthRadius = 2;
  const earthPosition = new THREE.Vector3(10, 0, 0);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/earthmap1k.jpg', setGlobeTexture);
    loader.load('/meteorTexture.jpg', setMeteorTexture);
  }, []);

  const cometTrajectory = useMemo(() => {
    if (!orbitalElements) return [];

    const a = parseFloat(orbitalElements.a.split(' ')[0]);
    const e = parseFloat(orbitalElements.e.split(' ')[0]);
    const i = THREE.MathUtils.degToRad(parseFloat(orbitalElements.i.split(' ')[0]));

    // Extraer el número dentro de los paréntesis para Omega
    const omegaString = orbitalElements.Omega_grados_votos_max_min;
    const omegaMatch = omegaString.match(/\(([^)]+)\)/); // Busca el contenido dentro de los paréntesis
    const omegaValue = omegaMatch ? parseFloat(omegaMatch[1]) : NaN; // Parsea el número o NaN si no se encuentra
    const Ω = THREE.MathUtils.degToRad(omegaValue);

    const ω = THREE.MathUtils.degToRad(parseFloat(orbitalElements.omega.split(' ')[0]));


    if (isNaN(Ω)) return []; // Si Omega es NaN, retornar un arreglo vacío

    const points = [];
    const numPoints = 2000;

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

      points.push(new THREE.Vector3(X * scaleFactor, Y * scaleFactor, Z * scaleFactor).add(earthPosition));
    }


    return points;
  }, [scaleFactor, orbitalElements, earthPosition]);

  const trajectoryGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(cometTrajectory);
  }, [cometTrajectory]);

  useFrame(({ clock }) => {
    if (cometRef.current && cometTrajectory.length > 0) {
      timeRef.current += 0.00005;
      const index = Math.floor((timeRef.current % 1) * cometTrajectory.length);
      const { x, y, z } = cometTrajectory[index];
      cometRef.current.position.set(x, y, z);
      if (tailRef.current) {
        tailRef.current.position.set(x, y, z);
        tailRef.current.lookAt(0, 0, 0);
      }
    }
  });

  if (!globeTexture) return null;

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <Stars />
      <ambientLight intensity={0.5} /> {/* Luz ambiental general */}
      <ambientLight intensity={1.5} position={[10, 0, 0]} /> {/* Luz ambiental específica para la Tierra */}
      <mesh position={[10, 0, 0]}>
        <sphereGeometry args={[earthRadius, 32, 32]} />
        <meshStandardMaterial map={globeTexture} />
      </mesh>

      <line geometry={trajectoryGeometry}>
        <lineBasicMaterial attach="material" color="cyan" linewidth={2} />
      </line>

      <mesh ref={cometRef}>
        <sphereGeometry args={[0.56, 16, 16]} />
        <meshBasicMaterial map={meteorTexture} />
      </mesh>
      {/* <mesh ref={tailRef} position={[0, 0, 0]}>
        <coneGeometry args={[1, 1, 32]} />
        <meshBasicMaterial color="red" />
      </mesh> */}
      <OrbitControls target={[10, 0, 0]} minDistance={5} maxDistance={200} />
    </>
  );
}

function GlobeWithComet({ orbitalElements }) {
  console.log("orbitalElements:", orbitalElements); // Agrega esta línea
  return (
    <Canvas
      style={{ width: '100%', height: '80%', backgroundColor: 'black' }}
      camera={{ position: [11, 8.5, 15], fov: 100 }}
    >
      <GlobeAndComet orbitalElements={orbitalElements} />
    </Canvas>
  );
}

export default GlobeWithComet;