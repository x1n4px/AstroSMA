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

function solveHyperbolicOrbit(M, e) {
  let F = M;
  if (Math.abs(M) < 1e-6) return F;
  
  let iterations = 0;
  let delta;
  const maxIterations = 100;
  const tolerance = 1e-8;
  
  do {
    const sinhF = Math.sinh(F);
    const coshF = Math.cosh(F);
    const f = e * sinhF - F - M;
    const df = e * coshF - 1;
    delta = f / df;
    F -= delta;
    iterations++;
  } while (Math.abs(delta) > tolerance && iterations < maxIterations);
  
  return F;
}

// Función para calcular la posición de la Tierra en su órbita según la fecha
function calculateEarthPosition(date) {
  // Convertir la fecha a días desde el equinoccio de primavera (aproximado)
  const dt = new Date(date);
  const startOfYear = new Date(dt.getFullYear(), 0, 0);
  const diff = date - startOfYear;
  const dayOfYear = diff / (1000 * 60 * 60 * 24);
  
  // Calcular la anomalía media (simplificado)
  const M = (dayOfYear / 365.25) * 2 * Math.PI;
  
  // Órbita terrestre (aproximación circular)
  const earthOrbitRadius = 30; // Distancia Tierra-Sol en unidades de escena
  const x = earthOrbitRadius * Math.cos(M);
  const z = earthOrbitRadius * Math.sin(M);
  
  return new THREE.Vector3(x, 0, z);
}

function GlobeAndComet({ orbitalElements, lat, lon, date }) {
  const [globeTexture, setGlobeTexture] = useState(null);
  const [meteorTexture, setMeteorTexture] = useState(null);
  const [sunTexture, setSunTexture] = useState(null);
  const cometRef = useRef();
  const timeRef = useRef(0);
  const tailRef = useRef();
  const scaleFactor = 20;
  const earthRadius = 2;
  
  // Calcular posición de la Tierra según la fecha
  const earthPosition = useMemo(() => calculateEarthPosition(date), [date]);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/earthmap1k.jpg', setGlobeTexture);
    loader.load('/meteorTexture.jpg', setMeteorTexture);
    loader.load('/sunTexture.jpg', setSunTexture); // Necesitarás una textura para el Sol
  }, []);

  // Generar puntos para la órbita terrestre
  const earthOrbitPoints = useMemo(() => {
    const points = [];
    const earthOrbitRadius = 30;
    const segments = 100;
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = earthOrbitRadius * Math.cos(angle);
      const z = earthOrbitRadius * Math.sin(angle);
      points.push(new THREE.Vector3(x, 0, z));
    }
    
    return points;
  }, []);

  const earthOrbitGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(earthOrbitPoints);
  }, [earthOrbitPoints]);

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

    if (isNaN(Ω) || isNaN(a) || isNaN(e) || isNaN(i) || isNaN(ω)) return null;

    const points = [];
    const numPoints = 2000;

    const M_max = e > 1 ? Math.acosh((10 + e) / e) : 2 * Math.PI;

    for (let j = 0; j <= numPoints; j++) {
      const M = (j / numPoints) * 2 * M_max - M_max;
      let x, y;

      if (e < 1) {
        let E = M;
        let F;
        do {
          F = E - e * Math.sin(E) - M;
          E = E - F / (1 - e * Math.cos(E));
        } while (Math.abs(F) > 1e-6);
        
        x = a * (Math.cos(E) - e);
        y = a * Math.sqrt(1 - e * e) * Math.sin(E);
      } else {
        const F = solveHyperbolicOrbit(M, e);
        x = a * (e - Math.cosh(F));
        y = a * Math.sqrt(e * e - 1) * Math.sinh(F);
      }

      const cosΩ = Math.cos(Ω);
      const sinΩ = Math.sin(Ω);
      const cosi = Math.cos(i);
      const sini = Math.sin(i);
      const cosω = Math.cos(ω);
      const sinω = Math.sin(ω);

      const X = (cosΩ * cosω - sinΩ * sinω * cosi) * x + (-cosΩ * sinω - sinΩ * cosω * cosi) * y;
      const Y = (sinΩ * cosω + cosΩ * sinω * cosi) * x + (-sinΩ * sinω + cosΩ * cosω * cosi) * y;
      const Z = (sinω * sini) * x + (cosω * sini) * y;

      // Añadir la posición de la Tierra a la posición del cometa
      points.push(new THREE.Vector3(
        X * scaleFactor + earthPosition.x,
        Y * scaleFactor + earthPosition.y,
        Z * scaleFactor + earthPosition.z
      ));
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
        tailRef.current.lookAt(earthPosition.x, earthPosition.y, earthPosition.z);
      }
    }
  });

  const stationPosition = latLonToVector3(lat, lon, earthRadius + 0.1);

  if (!globeTexture || !cometTrajectory || !trajectoryGeometry || !sunTexture) return null;

  return (
    <>
      <ambientLight intensity={5} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color={0xffffff} />
      
      {/* Sol */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>
      
      {/* Órbita terrestre */}
      <line geometry={earthOrbitGeometry}>
        <lineBasicMaterial attach="material" color="yellow" linewidth={1} />
      </line>
      
      <Stars />
      
      {/* Tierra */}
      <group position={earthPosition}>
        <mesh>
          <sphereGeometry args={[earthRadius, 32, 32]} />
          <meshStandardMaterial map={globeTexture} />
        </mesh>
        
        {/* Estación en la Tierra */}
        <mesh position={stationPosition}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </group>
      
      {/* Trayectoria del cometa */}
      <line geometry={trajectoryGeometry}>
        <lineBasicMaterial attach="material" color="cyan" linewidth={2} />
      </line>

      {/* Cometa */}
      <mesh ref={cometRef}>
        <sphereGeometry args={[0.56, 16, 16]} />
        <meshBasicMaterial map={meteorTexture} />
      </mesh>
      
      <OrbitControls 
        target={[earthPosition.x, earthPosition.y, earthPosition.z]} 
        minDistance={5} 
        maxDistance={200} 
      />
    </>
  );
}

function GlobeWithComet({ orbitalElements, lat, lon, date = new Date() }) {
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

      return !isNaN(a) && !isNaN(e) && !isNaN(i) && !isNaN(omegaValue) && !isNaN(ω);
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
          camera={{ position: [40, 30, 40], fov: 60 }}
        >
          <GlobeAndComet 
            orbitalElements={orbitalElements} 
            lat={lat} 
            lon={lon} 
            date={date instanceof Date ? date : new Date(date)} 
          />
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