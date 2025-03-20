import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function GlobeAndComet({ selectedShower, meteorShowers, originalBolideTrajectory }) {
  const [globeTexture, setGlobeTexture] = useState(null);
  const [rotation, setRotation] = useState(0);
  const orbitControlsRef = useRef();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/earthmap1k.jpg', (texture) => {
      setGlobeTexture(texture);
    });
  }, []);

  const trajectoryGeometry = useMemo(() => {
    if (meteorShowers && meteorShowers[selectedShower]) {
      const geometry = new THREE.BufferGeometry().setFromPoints(meteorShowers[selectedShower]);
      return geometry;
    } else {
      return new THREE.BufferGeometry();
    }
  }, [selectedShower, meteorShowers]);

  const meteorPointsGeometry = useMemo(() => {
    const points = [];
    const trajectory = meteorShowers[selectedShower];
    if (trajectory && trajectory.length > 0) {
      for (let i = 0; i < trajectory.length; i++) {
        const point = trajectory[i];
        points.push(point.x + Math.random() * 0.2 - 0.1, point.y + Math.random() * 0.2 - 0.1, point.z + Math.random() * 0.2 - 0.1);
      }
    }
    return new THREE.Float32BufferAttribute(points, 3);
  }, [selectedShower, meteorShowers]);

  const meteorMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
            attribute float size;
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                gl_PointSize = size * ( 300.0 / -mvPosition.z );
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
      fragmentShader: `
            uniform vec3 color;
            void main() {
                gl_FragColor = vec4( color, 0.5 );
            }
        `,
      uniforms: {
        color: { value: new THREE.Color('lightblue') },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  const originalBolideGeometry = useMemo(() => {
    if (originalBolideTrajectory && originalBolideTrajectory.length > 0) {
      const geometry = new THREE.BufferGeometry().setFromPoints(originalBolideTrajectory);
      return geometry;
    } else {
      return new THREE.BufferGeometry();
    }
  }, [originalBolideTrajectory]);



  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    setRotation(elapsedTime * 0.5);
  });

  if (!globeTexture) return null;

  const getCometPosition = () => {
    const trajectory = meteorShowers[selectedShower];
    if (!trajectory || trajectory.length === 0) return [0, 0, 0];
    if (trajectory && trajectory.length > 0) {
      const index = Math.floor((rotation / (Math.PI * 2)) * trajectory.length) % trajectory.length;
      return trajectory[index];
    } else {
      return [0, 0, 0];
    }
  };

  const getCometOrbitPosition = () => {
    const trajectory = originalBolideTrajectory;
    if (!trajectory || trajectory.length === 0) return [0, 0, 0];
    if (trajectory && trajectory.length > 0) {
      const index = Math.floor((rotation / (Math.PI * 2)) * trajectory.length) % trajectory.length;
      return trajectory[index];
    } else {
      return [0, 0, 0];
    }
  }

  const cometPosition = getCometPosition();
  const cometOrbitPosition = getCometOrbitPosition();

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[100, 100, 100]} intensity={1} />
      <Stars />

      {/* Sol */}
      <mesh position={[100, 0, 0]}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial color="yellow" />
      </mesh>

      {/* Planetas */}
      <mesh position={[20, 0, 0]}>
      </mesh>
      <mesh position={[30, 0, 5]}>
      </mesh>
      <mesh position={[40, 0, -5]}>
      </mesh>
      <mesh position={[50, 0, 0]}>
      </mesh>
      <mesh position={[60, 0, 5]}>
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial map={globeTexture} />
        </mesh>
        <line>
          <lineBasicMaterial color="cyan" />
          <primitive object={trajectoryGeometry} />
        </line>
        <line>
          <lineBasicMaterial color="red" />
          <primitive object={originalBolideGeometry} />
        </line>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" {...meteorPointsGeometry} />
            <bufferAttribute attach="attributes-size" array={new Float32Array(meteorPointsGeometry.count).fill(2)} itemSize={1} />
          </bufferGeometry>
          <primitive object={meteorMaterial} attach="material" />
        </points>
        <mesh position={cometOrbitPosition}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="lightgray" />
        </mesh>
      </mesh>
      <mesh position={[70, 0, -5]}>
      </mesh>

      {/* Órbitas */}
      <mesh position={[100, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[20, 0.05, 16, 100]} />
        <meshBasicMaterial color="gray" />
      </mesh>
      <mesh position={[100, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[30, 0.05, 16, 100]} />
        <meshBasicMaterial color="orange" />
      </mesh>
      <mesh position={[100, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[40, 0.05, 16, 100]} />
        <meshBasicMaterial color="blue" />
      </mesh>
      <mesh position={[100, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[50, 0.05, 16, 100]} />
        <meshBasicMaterial color="brown" />
      </mesh>
      <mesh position={[100, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[60, 0.05, 16, 100]} />
        <meshBasicMaterial color="lightblue" />
      </mesh>
      <mesh position={[100, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[70, 0.05, 16, 100]} />
        <meshBasicMaterial color="lightgreen" />
      </mesh>


      <OrbitControls ref={orbitControlsRef} target={[0, 0, 0]} minDistance={5} maxDistance={200} />
    </>
  );
}

function GlobeWithComet({ selectedShower, meteorShowers, originalBolideTrajectory, key }) {
  return (
    <Canvas
      style={{ width: 'auto', height: '100vh', backgroundColor: 'black' }}
      camera={{ position: [65, 5, 10], fov: 75 }}
    >
      <GlobeAndComet
        selectedShower={selectedShower}
        meteorShowers={meteorShowers}
        originalBolideTrajectory={originalBolideTrajectory}
      />
    </Canvas>
  );
}


function MeteorShowerVisualizer() {
  const [selectedShower, setSelectedShower] = useState('Perseidas');

  const meteorShowers = useMemo(() => ({
    Perseidas: (() => {
      const points = [];
      const radiusX = 30;
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
    })(),
    Líridas: (() => {
      const points = [];
      const radiusX = 212.5;
      const radiusY = 51;
      const radiusZ = 1.8;
      const numPoints = 200;
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const x = radiusX * Math.cos(angle);
        const y = radiusY * Math.sin(angle);
        const z = radiusZ * Math.sin(angle);
        points.push(new THREE.Vector3(x, y, z));
      }
      return points;
    })(),
    EtaAcuáridas: (() => {
      const points = [];
      const radiusX = 3.5;
      const radiusY = 1.8;
      const radiusZ = 2.5;
      const numPoints = 100;
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const x = radiusX * Math.cos(angle);
        const y = radiusY * Math.sin(angle);
        const z = radiusZ * Math.sin(angle);
        points.push(new THREE.Vector3(x, y, z));
      }
      return points;
    })(),
  }), []);

  const originalBolideTrajectory = useMemo(() => {
    const points = [];
    const radiusX = 22.5;
    const radiusY = 26;
    const radiusZ = 210;
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

  return (
    <>
      <select
        value={selectedShower}
        onChange={(e) => setSelectedShower(e.target.value)}
        style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}
      >
        {Object.keys(meteorShowers).map((shower) => (
          <option key={shower} value={shower}>
            {shower}
          </option>
        ))}
      </select>

      <GlobeWithComet
        key={selectedShower} // Añadir key único
        selectedShower={selectedShower}
        meteorShowers={meteorShowers}
        originalBolideTrajectory={originalBolideTrajectory}
      />
    </>
  );
}

export default MeteorShowerVisualizer;