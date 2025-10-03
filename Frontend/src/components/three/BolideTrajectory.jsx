import { useRef, useMemo, useEffect, forwardRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Line, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// --- El resto del código se mantiene sin cambios ---
const EARTH_RADIUS_KM = 6371
const EARTH_DIAMETER_KM = EARTH_RADIUS_KM * 2
const SCALE_FACTOR = 0.0002

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
    const scaledStartAlt = startAlt
    const scaledEndAlt = endAlt
    const points = useMemo(() => {
        const pts = []
        const segments = 100
        const earthRadiusScaled = EARTH_RADIUS_KM * SCALE_FACTOR
        const startPoint = start.clone().normalize().multiplyScalar(earthRadiusScaled + scaledStartAlt)
        const endPoint = end.clone().normalize().multiplyScalar(earthRadiusScaled + scaledEndAlt)
        for (let i = 0; i <= segments; i++) {
            const t = i / segments
            const point = new THREE.Vector3().lerpVectors(startPoint, endPoint, t)
            pts.push(point)
        }
        return pts
    }, [start, end, scaledStartAlt, scaledEndAlt])
    const earthRadiusScaled = EARTH_RADIUS_KM * SCALE_FACTOR
    const startImpact = start.clone().normalize().multiplyScalar(earthRadiusScaled)
    const endImpact = end.clone().normalize().multiplyScalar(earthRadiusScaled)
    return (
        <>
            <Line points={points} color={color} lineWidth={4} />
            <Line
                points={[start.clone().normalize().multiplyScalar(earthRadiusScaled + scaledStartAlt), startImpact]}
                color="black"
                lineWidth={2}
                dashed
                dashSize={0.05}
                gapSize={0.02}
            />
            <Line
                points={[end.clone().normalize().multiplyScalar(earthRadiusScaled + scaledEndAlt), endImpact]}
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

const CameraFocus = forwardRef(({ targetPoint, autoRotate }, ref) => {
    const { camera } = useThree()
    useEffect(() => {
        if (ref.current && targetPoint) {
            const earthRadiusScaled = EARTH_RADIUS_KM * SCALE_FACTOR
            const targetPosition = targetPoint.clone().multiplyScalar(earthRadiusScaled * 1.2)
            const cameraDistance = earthRadiusScaled * 3
            const cameraPosition = targetPoint.clone().normalize().multiplyScalar(cameraDistance).add(targetPosition)
            cameraPosition.y += earthRadiusScaled * 0.5
            cameraPosition.z += earthRadiusScaled * 0.5
            ref.current.target.copy(targetPosition)
            // No es necesario llamar a update() aquí, OrbitControls lo hace internamente en el bucle
            camera.position.copy(cameraPosition)
            camera.lookAt(targetPosition)
        }
    }, [targetPoint, camera, autoRotate, ref])
    return <OrbitControls
        ref={ref}
        minDistance={EARTH_RADIUS_KM * SCALE_FACTOR * 1.1}
        maxDistance={EARTH_DIAMETER_KM * SCALE_FACTOR * 20}
        enablePan={true}
        enableZoom={true} // El zoom con rueda sigue habilitado
        enableRotate={!autoRotate}
    />
})


export default function BolideMap3D({
    startPoint = { lat: 43.762272, lon: 4.238753, alt: 142 },
    endPoint = { lat: 42.871881, lon: 3.629803, alt: 80 },
    startPoint2 = { lat: 43.762272, lon: 4.238753, alt: 142 },
    endPoint2 = { lat: 42.871881, lon: 3.629803, alt: 80 },
    autoRotate = false,
    earthTexture = '/earthmap10k.webp'
}) {
    const { start, end } = useMemo(() => ({
        start: geoToCartesian(startPoint.lat, startPoint.lon),
        end: geoToCartesian(endPoint.lat, endPoint.lon)
    }), [startPoint, endPoint])
    const { start2, end2 } = useMemo(() => ({
        start2: geoToCartesian(startPoint2.lat, startPoint2.lon),
        end2: geoToCartesian(endPoint2.lat, endPoint2.lon)
    }), [startPoint2, endPoint2])
    
    const controlsRef = useRef();

    // --- CORRECCIÓN: Funciones de zoom que mueven la posición de la cámara ---
    const handleZoom = (factor) => {
        if (controlsRef.current) {
            // Obtenemos los controles desde la ref
            const controls = controlsRef.current;
            // Calculamos el vector desde la cámara hacia el punto de mira (target)
            const camera = controls.object;
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            
            // Movemos la cámara hacia adelante o atrás a lo largo de ese vector
            // La distancia del movimiento depende de la distancia actual para que el zoom sea proporcional
            const distance = camera.position.distanceTo(controls.target);
            camera.position.addScaledVector(direction, distance * factor);
            
            // No es necesario llamar a controls.update() porque la manipulación
            // directa de la cámara se reflejará en el siguiente fotograma.
        }
    }
    
    // Simplificamos la llamada desde el botón
    const handleZoomIn = () => handleZoom(-0.2); // El factor negativo acerca la cámara
    const handleZoomOut = () => handleZoom(0.2); // El factor positivo la aleja

    const buttonContainerStyles = {
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        gap: '10px',
    };

    const buttonStyles = {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        border: '1px solid white',
        borderRadius: '5px',
        cursor: 'pointer'
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '800px', backgroundColor: 'black' }}>
            <Canvas
                camera={{
                    position: [0, 0, EARTH_DIAMETER_KM * SCALE_FACTOR * 1.2],
                    fov: 30,
                    near: 0.001,
                    far: EARTH_DIAMETER_KM * SCALE_FACTOR * 100
                }}
            >
                <RotationGroup autoRotate={autoRotate}>
                    <Earth textureUrl={earthTexture} />
                    <BolideTrajectory start={start} end={end} startAlt={startPoint.alt} endAlt={endPoint.alt} color="blue" />
                    <BolideTrajectory start={start2} end={end2} startAlt={startPoint2.alt} endAlt={endPoint2.alt} color="#FF4D00" />
                </RotationGroup>
                <ambientLight intensity={2} />
                <pointLight position={[5, 5, 5]} intensity={1} />
                <CameraFocus ref={controlsRef} targetPoint={start} autoRotate={autoRotate} />
                <Stars radius={EARTH_DIAMETER_KM * SCALE_FACTOR * 10} depth={EARTH_DIAMETER_KM * SCALE_FACTOR * 5} count={2000} />
            </Canvas>
            <div style={buttonContainerStyles}>
                {/* --- CORRECCIÓN: Llamadas a las nuevas funciones de zoom --- */}
                <button style={buttonStyles} onClick={handleZoomIn}>Zoom In</button>
                <button style={buttonStyles} onClick={handleZoomOut}>Zoom Out</button>
            </div>
        </div>
    )
}

function geoToCartesian(lat, lon) {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    return new THREE.Vector3(
        -Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
    )
}