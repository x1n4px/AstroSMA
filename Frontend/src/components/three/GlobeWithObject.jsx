import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

function GlobeAndComet({ orbitalElements, lat, lon }) {
  const [globeTexture, setGlobeTexture] = useState(null);
  const [meteorTexture, setMeteorTexture] = useState(null);
  const cometRef = useRef();
  const timeRef = useRef(0);
  const tailRef = useRef();
  const scaleFactor = 20;
  const earthRadius = 2;
  const earthPosition = new THREE.Vector3(0, 0, 0);



  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/earthmap1k.jpg', setGlobeTexture);
    loader.load('/meteorTexture.jpg', setMeteorTexture);
  }, []);

  const cometTrajectory = useMemo(() => {
    if (!orbitalElements) return null;

    const a = parseFloat(orbitalElements.a.split(' ')[0]);
    const e = parseFloat(orbitalElements.e.split(' ')[0]);
    const i = THREE.MathUtils.degToRad(parseFloat(orbitalElements.i.split(' ')[0]));

    const omegaString = orbitalElements.Omega_grados_votos_max_min;
    const omegaMatch = omegaString.match(/\(([^)]+)\)/);
    const omegaValue = omegaMatch ? parseFloat(omegaMatch[1]) : NaN;
    const Ω = THREE.MathUtils.degToRad(omegaValue);

    const ω = THREE.MathUtils.degToRad(parseFloat(orbitalElements.omega.split(' ')[0]));

    if (isNaN(Ω) || isNaN(a) || isNaN(e) || isNaN(i) || isNaN(ω) || e > 1) return null;

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
    return cometTrajectory ? new THREE.BufferGeometry().setFromPoints(cometTrajectory) : null;
  }, [cometTrajectory]);

  useFrame(({ clock }) => {
    if (cometRef.current && cometTrajectory && cometTrajectory.length > 0) {
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


  const stationPosition = latLonToVector3(lat, lon, earthRadius + 0.1); // Posicionar la estación ligeramente por encima de la superficie


  if (!globeTexture || !cometTrajectory || !trajectoryGeometry) return null;

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <Stars />
      <ambientLight intensity={0.5} />
      <ambientLight intensity={1.5} position={[10, 0, 0]} />
      <mesh position={earthPosition}>
        <sphereGeometry args={[earthRadius, 32, 32]} />
        <meshStandardMaterial map={globeTexture} />
      </mesh>
      <mesh position={stationPosition}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="red" /> {/* Estación marcada en rojo */}
      </mesh>
      <line geometry={trajectoryGeometry}>
        <lineBasicMaterial attach="material" color="cyan" linewidth={2} />
      </line>

      <mesh ref={cometRef}>
        <sphereGeometry args={[0.56, 16, 16]} />
        <meshBasicMaterial map={meteorTexture} />
      </mesh>
      <OrbitControls target={[10, 0, 0]} minDistance={5} maxDistance={200} />
    </>
  );
}

function GlobeWithComet({ orbitalElements, lat, lon }) {
  // Función para validar si los orbitalElements son válidos


  const areOrbitalElementsValid = (elements) => {
    if (!elements) return false;

    try {
      const a = parseFloat(elements.a.split(' ')[0]);
      const e = parseFloat(elements.e.split(' ')[0]);
      const i = parseFloat(elements.i.split(' ')[0]);

      const omegaString = elements.Omega_grados_votos_max_min;
      const omegaMatch = omegaString.match(/\(([^)]+)\)/);
      const omegaValue = omegaMatch ? parseFloat(omegaMatch[1]) : NaN;

      const ω = parseFloat(elements.omega.split(' ')[0]);

      return !isNaN(a) && !isNaN(e) && !isNaN(i) && !isNaN(omegaValue) && !isNaN(ω) && e <= 1;
    } catch (error) {
      return false;
    }
  };

  const isValid = areOrbitalElementsValid(orbitalElements);

  return (
    <>
      {isValid ? (
        <Canvas
          style={{ width: '100%', height: '800px', backgroundColor: 'black' }}
          camera={{ position: [11, 8.5, 15], fov: 100 }}
        >
          <GlobeAndComet orbitalElements={orbitalElements} lat={lat} lon={lon} />
        </Canvas>
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center text-center p-4">
          <h2 className="text-danger mb-3">
            Error: Cálculo de Órbita Fallido
          </h2>
        </div>
      )}
    </>
  );
}

export default GlobeWithComet;