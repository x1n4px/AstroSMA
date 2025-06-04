import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Line, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Load Tailwind CSS for styling the buttons
// This script tag is typically placed in the HTML head, but for a self-contained React immersive,
// we assume Tailwind is available or can be loaded this way.
// <script src="https://cdn.tailwindcss.com"></script>

// Constantes para proporciones realistas
const EARTH_RADIUS_KM = 6371 // Radio terrestre en km
const EARTH_DIAMETER_KM = EARTH_RADIUS_KM * 2
const SCALE_FACTOR = 0.0002 // Factor de escala para mantener números manejables en Three.js

// Componente Tierra con proporciones correctas
function Earth({ textureUrl }) {
    // Load the Earth texture. Use a placeholder if the URL is not provided or fails.
    const texture = useTexture(textureUrl || 'https://placehold.co/1024x512/000000/FFFFFF?text=Earth+Texture',
        (loader) => {}, // On load
        (progress) => {}, // On progress
        (error) => { console.error("Failed to load earth texture:", error); } // On error
    );

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

/**
 * Renders a bolide trajectory as a line in 3D space.
 * @param {Object} props - Component properties.
 * @param {THREE.Vector3} props.start - The starting point of the trajectory (normalized vector from Earth center).
 * @param {THREE.Vector3} props.end - The ending point of the trajectory (normalized vector from Earth center).
 * @param {number} [props.startAlt=100] - Starting altitude in kilometers.
 * @param {number} [props.endAlt=100] - Ending altitude in kilometers.
 * @param {string} [props.color='red'] - Color of the trajectory line.
 */
function BolideTrajectory({ start, end, startAlt = 100, endAlt = 100, color = 'red' }) {
    // Convert altitudes to scaled units (km to Three.js units)
    // Altitudes are added to the scaled Earth radius to get the final distance from origin.
    const scaledStartAlt = startAlt * SCALE_FACTOR
    const scaledEndAlt = endAlt * SCALE_FACTOR
    
    const points = useMemo(() => {
      const pts = []
      const segments = 100 // Number of segments to draw the line
      
      // Calculate the scaled Earth radius
      const earthRadiusScaled = EARTH_RADIUS_KM * SCALE_FACTOR
      
      // Calculate the actual 3D start and end points including altitude
      const startPointWithAlt = start.clone().normalize().multiplyScalar(earthRadiusScaled + scaledStartAlt)
      const endPointWithAlt = end.clone().normalize().multiplyScalar(earthRadiusScaled + scaledEndAlt)
      
      // Generate points along the linear trajectory
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const point = new THREE.Vector3().lerpVectors(startPointWithAlt, endPointWithAlt, t)
        pts.push(point)
      }
      
      return pts
    }, [start, end, scaledStartAlt, scaledEndAlt])

    // Calculate impact points (projection onto the Earth's surface)
    const earthRadiusScaled = EARTH_RADIUS_KM * SCALE_FACTOR
    const startImpact = start.clone().normalize().multiplyScalar(earthRadiusScaled)
    const endImpact = end.clone().normalize().multiplyScalar(earthRadiusScaled)

    return (
        <>
            {/* Main trajectory line */}
            <Line points={points} color={color} lineWidth={4} />
            
            {/* Dashed lines connecting trajectory points to their ground projection */}
            <Line 
                points={[
                    start.clone().normalize().multiplyScalar(earthRadiusScaled + scaledStartAlt), 
                    startImpact
                ]} 
                color="black" 
                lineWidth={2} 
                dashed 
                dashSize={0.05} // Length of the dash
                gapSize={0.02} // Length of the gap
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

/**
 * Manages the rotation of its children.
 * @param {Object} props - Component properties.
 * @param {boolean} props.autoRotate - If true, the group will automatically rotate.
 * @param {React.ReactNode} props.children - Child components to be rotated.
 */
const RotationGroup = ({ autoRotate, children }) => {
    const groupRef = useRef()
    useFrame(() => {
        if (autoRotate && groupRef.current) {
            groupRef.current.rotation.y += 0.002 // Rotate around Y-axis
        }
    })
    return <group ref={groupRef}>{children}</group>
}

/**
 * Manages the camera's focus and OrbitControls.
 * @param {Object} props - Component properties.
 * @param {THREE.Vector3} props.targetPoint - The point on Earth to focus the camera on.
 * @param {boolean} props.autoRotate - If true, manual rotation via OrbitControls is disabled.
 * @param {React.MutableRefObject} props.orbitControlsRef - Ref to the OrbitControls instance.
 */
function CameraFocus({ targetPoint, autoRotate, orbitControlsRef }) {
    const { camera } = useThree()

    useEffect(() => {
        if (orbitControlsRef.current && targetPoint) {
            const earthRadiusScaled = EARTH_RADIUS_KM * SCALE_FACTOR
            // Target the camera slightly above the impact point for better visibility
            const targetPosition = targetPoint.clone()
                .multiplyScalar(earthRadiusScaled * 1.2) // Target slightly above surface
            
            // Calculate camera position for a good view of the target point
            const cameraDistance = earthRadiusScaled * 3 // Distance from target
            const cameraPosition = targetPoint.clone()
                .normalize()
                .multiplyScalar(cameraDistance)
                .add(targetPosition) // Add displacement from target
            
            // Adjust camera position slightly to avoid being directly in line with the target
            // This helps in seeing the trajectory better.
            cameraPosition.y += earthRadiusScaled * 0.5
            cameraPosition.z += earthRadiusScaled * 0.5
            
            // Set OrbitControls target and update
            orbitControlsRef.current.target.copy(targetPosition)
            orbitControlsRef.current.update()
            
            // Set camera position and make it look at the target
            camera.position.copy(cameraPosition)
            camera.lookAt(targetPosition)
        }
    }, [targetPoint, camera, autoRotate, orbitControlsRef]) // Dependencies for useEffect

    return (
        <OrbitControls 
            ref={orbitControlsRef} // Assign the ref passed from parent
            minDistance={EARTH_RADIUS_KM * SCALE_FACTOR * 1.1} // Minimum zoom distance
            maxDistance={EARTH_DIAMETER_KM * SCALE_FACTOR * 20} // Maximum zoom distance
            enablePan={true} // Enable panning
            enableZoom={true} // Enable zooming (via mouse wheel/pinch)
            enableRotate={!autoRotate} // Disable manual rotation if autoRotate is active
        />
    )
}

/**
 * Converts geographical coordinates (latitude, longitude) to 3D Cartesian coordinates.
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 * @returns {THREE.Vector3} - The Cartesian coordinates.
 */
function geoToCartesian(lat, lon) {
    const phi = (90 - lat) * (Math.PI / 180) // Convert latitude to polar angle
    const theta = (lon + 180) * (Math.PI / 180) // Convert longitude to azimuthal angle
    return new THREE.Vector3(
        -Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
    )
}

/**
 * Main component for the 3D Bolide Map.
 * @param {Object} props - Component properties.
 * @param {Object} [props.startPoint] - Start point for the first trajectory {lat, lon, alt}.
 * @param {Object} [props.endPoint] - End point for the first trajectory {lat, lon, alt}.
 * @param {Object} [props.startPoint2] - Start point for the second trajectory {lat, lon, alt}.
 * @param {Object} [props.endPoint2] - End point for the second trajectory {lat, lon, alt}.
 * @param {boolean} [props.autoRotate=false] - If true, the Earth will auto-rotate.
 * @param {string} [props.earthTexture='/earthmap10k.webp'] - URL for the Earth texture.
 */
export default function BolideMap3D({
    startPoint = { lat: 43.762272, lon: 4.238753, alt: 142 },
    endPoint = { lat: 42.871881, lon: 3.629803, alt: 80 },
    startPoint2 = { lat: 43.762272, lon: 4.238753, alt: 142 },
    endPoint2 = { lat: 42.871881, lon: 3.629803, alt: 80 },
    autoRotate = false,
    earthTexture = '/earthmap10k.webp'
}) {
    // Ref to access OrbitControls methods for zooming
    const orbitControlsRef = useRef();

    // Memoize Cartesian coordinates for the first trajectory
    const { start, end } = useMemo(() => {
        return {
            start: geoToCartesian(startPoint.lat, startPoint.lon),
            end: geoToCartesian(endPoint.lat, endPoint.lon)
        }
    }, [startPoint, endPoint])

    // Memoize Cartesian coordinates for the second trajectory
    const { start2, end2 } = useMemo(() => {
        return {
            start2: geoToCartesian(startPoint2.lat, startPoint2.lon),
            end2: geoToCartesian(endPoint2.lat, endPoint2.lon)
        }
    }, [startPoint2, endPoint2])

    /**
     * Handles zooming in the scene.
     * Calls the dollyIn method of OrbitControls.
     */
    const handleZoomIn = () => {
        if (orbitControlsRef.current) {
            // dollyIn simulates zooming in (moving camera closer)
            // The argument controls the zoom speed/factor.
            orbitControlsRef.current.dollyIn(1.2); 
            orbitControlsRef.current.update(); // Important to update controls after manual change
        }
    };

    /**
     * Handles zooming out of the scene.
     * Calls the dollyOut method of OrbitControls.
     */
    const handleZoomOut = () => {
        if (orbitControlsRef.current) {
            // dollyOut simulates zooming out (moving camera further)
            orbitControlsRef.current.dollyOut(1.2);
            orbitControlsRef.current.update();
        }
    };

    return (
        // Main container for the entire application, including canvas and controls
        <div className="flex flex-col h-full w-full bg-black">
            {/* The 3D Canvas from @react-three/fiber */}
            <div className="flex-grow w-full" style={{ height: '800px' }}> {/* flex-grow makes it take available space */}
                <Canvas 
                    camera={{ 
                        position: [0, 0, EARTH_DIAMETER_KM * SCALE_FACTOR * 1.2], // Initial camera position
                        fov: 30, // Field of View
                        near: 0.001, // Near clipping plane
                        far: EARTH_DIAMETER_KM * SCALE_FACTOR * 100 // Far clipping plane
                    }}
                >
                    {/* Group for auto-rotation of Earth and trajectories */}
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
                            color="#FF4D00" // Orange color for the second trajectory
                        />
                    </RotationGroup>

                    {/* Lighting for the scene */}
                    <ambientLight intensity={2} /> {/* General ambient light */}
                    <pointLight position={[5, 5, 5]} intensity={1} /> {/* Point light source */}
                    
                    {/* Custom CameraFocus component which includes OrbitControls */}
                    <CameraFocus 
                        targetPoint={start} // Focus camera on the start point of the first trajectory
                        autoRotate={autoRotate}  
                        orbitControlsRef={orbitControlsRef} // Pass the ref to CameraFocus
                    />
                    
                    {/* Stars background */}
                    <Stars 
                        radius={EARTH_DIAMETER_KM * SCALE_FACTOR * 10} // Radius of the star field
                        depth={EARTH_DIAMETER_KM * SCALE_FACTOR * 5} // Depth of the star field
                        count={2000} // Number of stars
                    />
                </Canvas>
            </div>

            {/* Zoom buttons UI - now below the canvas and full width */}
            <div className="w-full flex justify-center space-x-4 p-4  rounded-t-lg" > {/* Full width, centered, padding, dark background, rounded top corners */}
                <button
                    onClick={handleZoomIn}
                    style={{backgroundColor: '#980810', padding: '5px 30px', marginRight: '10px', width: '48%'}}
                    // Tailwind classes for styling: background, text color, padding, rounded, shadow, hover effects, focus outline
                    className="flex-1 max-w-xs bg-gray-700 text-white py-3 rounded-lg shadow-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-xl font-bold"
                >
                   -
                </button>
                <button
                    onClick={handleZoomOut}
                    style={{backgroundColor: '#980810', padding: '5px 30px', marginRight: '10px', width: '48%'}}
                    className="flex-1 max-w-xs bg-gray-700 text-white py-3 rounded-lg shadow-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-xl font-bold"
                >
                    +
                </button>
            </div>
        </div>
    )
}
