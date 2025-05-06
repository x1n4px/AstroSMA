import React, { useRef } from 'react';
import * as THREE from 'three';
import { extend, useThree, Canvas } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useFrame } from '@react-three/fiber';

// Extendemos Three.js con OrbitControls para que React lo reconozca
extend({ OrbitControls });

// Componente de controles personalizado
const Controls = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  
  useFrame(() => controlsRef.current?.update());
  
  return (
    <orbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableZoom={false}
      enablePan={true}
      enableRotate={true}
      zoomSpeed={0.6}
      panSpeed={0.5}
      rotateSpeed={0.4}
    />
  );
};

// Tamaños y distancias no están a escala real para mejor visualización
const planetData = [
  { name: 'Sun', radius: 5, distance: 0, color: '#FDB813', speed: 0 },
  { name: 'Mercury', radius: 0.8, distance: 10, color: '#B7B8B9', speed: 4.74 },
  { name: 'Venus', radius: 1.5, distance: 15, color: '#E6DDC5', speed: 3.5 },
  { name: 'Earth', radius: 1.6, distance: 20, color: '#6B93D6', speed: 2.98 },
  { name: 'Mars', radius: 1.2, distance: 25, color: '#E27B58', speed: 2.41 },
  { name: 'Jupiter', radius: 3, distance: 35, color: '#C88B3A', speed: 1.31 },
  { name: 'Saturn', radius: 2.5, distance: 45, color: '#E4D191', speed: 0.97, ring: true },
  { name: 'Uranus', radius: 2, distance: 55, color: '#D1E7E7', speed: 0.68 },
  { name: 'Neptune', radius: 1.9, distance: 65, color: '#5B5DDF', speed: 0.54 },
];

const Planet = ({ radius, distance, color, speed, hasRing = false }) => {
  const planetRef = useRef();
  const orbitRef = useRef();
  const ringRef = useRef();

  // Calcular posición inicial basada en la fecha actual
  const now = new Date();
  const dayOfYear = (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - 
                   Date.UTC(now.getFullYear(), 0, 0)) / (24 * 60 * 60 * 1000);
  const angle = (dayOfYear / 365) * Math.PI * 2 * speed;

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group rotation={[0, angle, 0]}>
      <mesh ref={orbitRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distance, distance + 0.1, 64]} />
        <meshBasicMaterial color="#555" side={THREE.DoubleSide} transparent opacity={0.3} />
      </mesh>
      
      <group position={[distance, 0, 0]}>
        <mesh ref={planetRef}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial color={color} />
        </mesh>
        
        {hasRing && (
          <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.5, radius * 2, 32]} />
            <meshStandardMaterial color="#E4D191" side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </group>
  );
};

const SolarSystem = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <Canvas camera={{ position: [0, 30, 70], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={1} color="#FDB813" />
        
        {planetData.map((planet, index) => (
          <Planet
            key={index}
            radius={planet.radius}
            distance={planet.distance}
            color={planet.color}
            speed={planet.speed}
            hasRing={planet.ring || false}
          />
        ))}
        
        <Controls />
      </Canvas>
    </div>
  );
};

export default SolarSystem;