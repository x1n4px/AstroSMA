import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'

const BolideOrbitVisualization = () => {
  // Datos del bólido (simplificados)
  const bolideData = {
    a: 1.0145, // semieje mayor (UA)
    e: 0.3657, // excentricidad
    i: 0.618, // inclinación (radianes)
    omega: 111.67 * (Math.PI/180), // argumento del perihelio (radianes)
    Omega: 299.311782 * (Math.PI/180), // longitud del nodo ascendente (radianes)
    q: 0.6435 // distancia perihelio (UA)
  }

  // Función para calcular puntos de la órbita
  const calculateOrbitPoints = (a, e, i, omega, Omega, samples = 100) => {
    const points = []
    for (let j = 0; j <= samples; j++) {
      const theta = (j / samples) * 2 * Math.PI
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta))
      
      // Coordenadas en el plano orbital
      const xOrbital = r * Math.cos(theta)
      const yOrbital = r * Math.sin(theta)
      
      // Rotación 3D según parámetros orbitales
      const x = xOrbital * (Math.cos(omega) * Math.cos(Omega) - Math.sin(omega) * Math.cos(i) * Math.sin(Omega)) - 
                yOrbital * (Math.sin(omega) * Math.cos(Omega) + Math.cos(omega) * Math.cos(i) * Math.sin(Omega))
      const y = xOrbital * (Math.cos(omega) * Math.sin(Omega) + Math.sin(omega) * Math.cos(i) * Math.cos(Omega)) - 
                yOrbital * (Math.sin(omega) * Math.sin(Omega) - Math.cos(omega) * Math.cos(i) * Math.cos(Omega))
      const z = xOrbital * (Math.sin(omega) * Math.sin(i)) + yOrbital * (Math.cos(omega) * Math.sin(i))
      
      points.push(new THREE.Vector3(x, y, z))
    }
    return points
  }

  // Puntos para las órbitas
  const earthOrbitPoints = calculateOrbitPoints(1, 0.0167, 0, 0, 0)
  const bolideOrbitPoints = calculateOrbitPoints(
    bolideData.a, 
    bolideData.e, 
    bolideData.i, 
    bolideData.omega, 
    bolideData.Omega
  )

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={1} color="yellow" />
      
      {/* Sol */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
      
      {/* Tierra y su órbita */}
      <mesh position={[1, 0, 0]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="blue" />
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
      <mesh position={[
        bolideData.q * Math.cos(bolideData.omega) * Math.cos(bolideData.Omega),
        bolideData.q * Math.cos(bolideData.omega) * Math.sin(bolideData.Omega),
        bolideData.q * Math.sin(bolideData.omega)
      ]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={0.5} />
      </mesh>
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <OrbitControls />
      <axesHelper args={[3]} />
    </Canvas>
  )
}

export default BolideOrbitVisualization