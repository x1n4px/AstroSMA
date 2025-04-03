import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Line, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Constantes para proporciones realistas
const EARTH_RADIUS_KM = 6371 // Radio terrestre en km
const EARTH_DIAMETER_KM = EARTH_RADIUS_KM * 2
const SCALE_FACTOR = 0.0001 // Factor de escala para mantener números manejables en Three.js

// Componente Tierra con proporciones correctas
function Earth({ textureUrl }) {
    const texture = useTexture(textureUrl || '/earthmap10k.webp')

    return (
        <mesh>
            <sphereGeometry args={[EARTH_RADIUS_KM * SCALE_FACTOR, 64, 64]} />
            <meshStandardMaterial
                map={texture}
                roughness={0.8}
                metalness={0.2}
            />
        </mesh>
    )
}

function BolideTrajectory({ start, end, startAlt = 100, endAlt = 100, color = 'red' }) {
    // Convertir altitudes a escala (km a unidades Three.js)
    const scaledStartAlt = startAlt  
    const scaledEndAlt = endAlt 
    
    const points = useMemo(() => {
      const pts = []
      const segments = 100
      
      // Ajustar los puntos de inicio y fin con la altitud (en km)
      const earthRadiusScaled = EARTH_RADIUS_KM * SCALE_FACTOR
      const startPoint = start.clone().normalize().multiplyScalar(earthRadiusScaled + scaledStartAlt)
      const endPoint = end.clone().normalize().multiplyScalar(earthRadiusScaled + scaledEndAlt)
      
      // Generar puntos de la trayectoria lineal
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const point = new THREE.Vector3().lerpVectors(startPoint, endPoint, t)
        pts.push(point)
      }
      
      return pts
    }, [start, end, scaledStartAlt, scaledEndAlt])

    // Puntos de impacto (proyección a ras de tierra)
    const earthRadiusScaled = EARTH_RADIUS_KM * SCALE_FACTOR
    const startImpact = start.clone().normalize().multiplyScalar(earthRadiusScaled)
    const endImpact = end.clone().normalize().multiplyScalar(earthRadiusScaled)

    return (
        <>
            <Line points={points} color={color} lineWidth={4} />
            
            {/* Líneas de conexión entre trayectoria y proyección */}
            <Line 
                points={[
                    start.clone().normalize().multiplyScalar(earthRadiusScaled + scaledStartAlt), 
                    startImpact
                ]} 
                color="black" 
                lineWidth={2} 
                dashed 
                dashSize={0.05}
                gapSize={0.02}
            />
            <Line 
                points={[
                    end.clone().normalize().multiplyScalar(earthRadiusScaled + scaledEndAlt), 
                    endImpact
                ]} 
                color="black" 
                lineWidth={2} 
                dashed 
                dashSize={0.05}
                gapSize={0.02}
            />
        </>
    )
}

const RotationGroup = ({ autoRotate, children }) => {
    const groupRef = useRef()
    useFrame(() => {
        if (autoRotate && groupRef.current) {
            groupRef.current.rotation.y += 0.002
        }
    })
    return <group ref={groupRef}>{children}</group>
}

// Nuevo componente para manejar el enfoque de la cámara
function CameraFocus({ targetPoint, autoRotate }) {
    const { camera } = useThree()
    const controlsRef = useRef()

    useEffect(() => {
        if (controlsRef.current && targetPoint) {
            const earthRadiusScaled = EARTH_RADIUS_KM * SCALE_FACTOR
            const targetPosition = targetPoint.clone()
                .multiplyScalar(earthRadiusScaled * 1.2)
            
            controlsRef.current.target.copy(targetPosition)
            controlsRef.current.update()
            
            camera.position.copy(
                targetPosition.clone().add(
                    new THREE.Vector3(0, 0, earthRadiusScaled * 2)
                )
            )
            camera.lookAt(targetPosition)
        }
    }, [targetPoint, camera, autoRotate])

    return <OrbitControls 
        ref={controlsRef}
        minDistance={EARTH_RADIUS_KM * SCALE_FACTOR * 1.1}
        maxDistance={EARTH_DIAMETER_KM * SCALE_FACTOR * 5}
        
    />
}

export default function BolideMap3D({
    startPoint = { lat: 43.762272, lon: 4.238753, alt: 142 },
    endPoint = { lat: 42.871881, lon: 3.629803, alt: 80 },
    startPoint2 = { lat: 43.762272, lon: 4.238753, alt: 142 },
    endPoint2 = { lat: 42.871881, lon: 3.629803, alt: 80 },
    autoRotate = false,
    earthTexture = '/earthmap10k.webp'
}) {
    const { start, end } = useMemo(() => {
        return {
            start: geoToCartesian(startPoint.lat, startPoint.lon),
            end: geoToCartesian(endPoint.lat, endPoint.lon)
        }
    }, [startPoint, endPoint])

    const { start2, end2 } = useMemo(() => {
        return {
            start2: geoToCartesian(startPoint2.lat, startPoint2.lon),
            end2: geoToCartesian(endPoint2.lat, endPoint2.lon)
        }
    }, [startPoint2, endPoint2])

    return (
        <div style={{ width: '100%', height: '800px', backgroundColor: 'black' }}>
            <Canvas 
                camera={{ 
                    position: [0, 0, EARTH_DIAMETER_KM * SCALE_FACTOR * 1.2], 
                    fov: 30,
                    near: 0.1,
                    far: EARTH_DIAMETER_KM * SCALE_FACTOR * 20
                }}
            >
                <RotationGroup autoRotate={autoRotate}>
                    <Earth textureUrl={earthTexture} />
                    <BolideTrajectory
                        start={start}
                        end={end}
                        startAlt={startPoint.alt}
                        endAlt={endPoint.alt}
                        color="blue"
                    />
                    <BolideTrajectory
                        start={start2}
                        end={end2}
                        startAlt={startPoint2.alt}
                        endAlt={endPoint2.alt}
                        color="orange"
                    />
                </RotationGroup>

                <ambientLight intensity={2} />
                <pointLight position={[5, 5, 5]} intensity={1} />
                
                {/* Reemplazamos OrbitControls con nuestro componente personalizado */}
                <CameraFocus 
                    targetPoint={start} 
                    autoRotate={autoRotate} 
                />
                
                <Stars 
                    radius={EARTH_DIAMETER_KM * SCALE_FACTOR * 10} 
                    depth={EARTH_DIAMETER_KM * SCALE_FACTOR * 5} 
                    count={2000} 
                />
            </Canvas>
        </div>
    )
}
// Función de conversión de coordenadas geográficas a cartesianas
function geoToCartesian(lat, lon) {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    return new THREE.Vector3(
        -Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
    )
}