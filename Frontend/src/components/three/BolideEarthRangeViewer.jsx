import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Billboard, Line, OrbitControls, Sphere, Stars, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const EARTH_RADIUS_KM = 6371;
const SCENE_SCALE = 0.00098;
const EARTH_RADIUS_SCENE = EARTH_RADIUS_KM * SCENE_SCALE;
const ENTRY_ALTITUDE_FLOOR_KM = 140;
const ENTRY_ALTITUDE_PADDING_KM = 80;
const SIMULATED_ORIGIN_RADIUS_MULTIPLIER = 1.18;

function toNumber(value) {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : NaN;
    }

    if (typeof value !== 'string') {
        return NaN;
    }

    const parsed = Number.parseFloat(value.trim().replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : NaN;
}

function lerp(start, end, t) {
    return start + (end - start) * t;
}

function geoToCartesian(latitude, longitude, altitudeKm = 0) {
    const radius = (EARTH_RADIUS_KM + altitudeKm) * SCENE_SCALE;
    const phi = THREE.MathUtils.degToRad(90 - latitude);
    const theta = THREE.MathUtils.degToRad(longitude + 180);

    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function extendPointToRadius(point, direction, targetRadius) {
    const normalizedDirection = direction.clone().normalize();
    const b = 2 * point.dot(normalizedDirection);
    const c = point.lengthSq() - targetRadius ** 2;
    const discriminant = b ** 2 - 4 * c;

    if (discriminant < 0) {
        return null;
    }

    const sqrtDiscriminant = Math.sqrt(discriminant);
    const solutions = [(-b + sqrtDiscriminant) / 2, (-b - sqrtDiscriminant) / 2].filter(value => value > 0);

    if (!solutions.length) {
        return null;
    }

    return point.clone().addScaledVector(normalizedDirection, Math.max(...solutions));
}

function dedupeGeoPoints(points) {
    const deduped = [];

    points.forEach((point) => {
        const lastPoint = deduped[deduped.length - 1];
        if (!lastPoint) {
            deduped.push(point);
            return;
        }

        const sameLatitude = Math.abs(lastPoint.latitude - point.latitude) < 0.0001;
        const sameLongitude = Math.abs(lastPoint.longitude - point.longitude) < 0.0001;
        const sameAltitude = Math.abs((lastPoint.altitudeKm || 0) - (point.altitudeKm || 0)) < 0.01;

        if (!sameLatitude || !sameLongitude || !sameAltitude) {
            deduped.push(point);
        }
    });

    return deduped;
}

function buildTrajectoryPath(item) {
    const startPoint = item?.startPoint;
    const endPoint = item?.endPoint;

    if (!startPoint || !endPoint) {
        return [];
    }

    const startAltitude = toNumber(startPoint.altitudeKm);
    const endAltitude = toNumber(endPoint.altitudeKm);
    const measuredPoints = Array.isArray(item?.path) ? item.path : [];

    if (measuredPoints.length >= 2) {
        const canUseDistance = measuredPoints.every(point => Number.isFinite(toNumber(point.distanceKm)));
        const canUseTime = measuredPoints.every(point => Number.isFinite(toNumber(point.timeSeconds)));
        const firstMetric = canUseDistance
            ? toNumber(measuredPoints[0].distanceKm)
            : (canUseTime ? toNumber(measuredPoints[0].timeSeconds) : 0);
        const lastMetric = canUseDistance
            ? toNumber(measuredPoints[measuredPoints.length - 1].distanceKm)
            : (canUseTime ? toNumber(measuredPoints[measuredPoints.length - 1].timeSeconds) : measuredPoints.length - 1);
        const metricRange = lastMetric - firstMetric;

        const interpolated = measuredPoints.map((point, index) => {
            const metricValue = canUseDistance
                ? toNumber(point.distanceKm)
                : (canUseTime ? toNumber(point.timeSeconds) : index);
            const progress = Number.isFinite(metricRange) && metricRange > 0
                ? THREE.MathUtils.clamp((metricValue - firstMetric) / metricRange, 0, 1)
                : (measuredPoints.length === 1 ? 0 : index / (measuredPoints.length - 1));

            return {
                latitude: toNumber(point.latitude),
                longitude: toNumber(point.longitude),
                altitudeKm: lerp(
                    Number.isFinite(startAltitude) ? startAltitude : 0,
                    Number.isFinite(endAltitude) ? endAltitude : 0,
                    progress
                )
            };
        }).filter(point => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));

        return dedupeGeoPoints([
            {
                latitude: toNumber(startPoint.latitude),
                longitude: toNumber(startPoint.longitude),
                altitudeKm: Number.isFinite(startAltitude) ? startAltitude : 0
            },
            ...interpolated,
            {
                latitude: toNumber(endPoint.latitude),
                longitude: toNumber(endPoint.longitude),
                altitudeKm: Number.isFinite(endAltitude) ? endAltitude : 0
            }
        ]);
    }

    const fallback = [];
    for (let index = 0; index <= 36; index += 1) {
        const progress = index / 36;
        fallback.push({
            latitude: lerp(toNumber(startPoint.latitude), toNumber(endPoint.latitude), progress),
            longitude: lerp(toNumber(startPoint.longitude), toNumber(endPoint.longitude), progress),
            altitudeKm: lerp(
                Number.isFinite(startAltitude) ? startAltitude : 0,
                Number.isFinite(endAltitude) ? endAltitude : 0,
                progress
            )
        });
    }

    return fallback.filter(point => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
}

function Earth() {
    const texture = useTexture('/earthmap10k.webp');

    return (
        <>
            <mesh>
                <sphereGeometry args={[EARTH_RADIUS_SCENE, 96, 96]} />
                <meshStandardMaterial map={texture} roughness={0.96} metalness={0.06} />
            </mesh>
            <mesh>
                <sphereGeometry args={[EARTH_RADIUS_SCENE * 1.014, 64, 64]} />
                <meshBasicMaterial color="#60a5fa" transparent opacity={0.12} side={THREE.BackSide} />
            </mesh>
        </>
    );
}

function CameraRig({ focusPoint, controlsRef, introSequenceKey }) {
    const { camera } = useThree();
    const introProgressRef = useRef(0);
    const introActiveRef = useRef(true);
    const lastIntroKeyRef = useRef(introSequenceKey);

    useEffect(() => {
        if (lastIntroKeyRef.current !== introSequenceKey) {
            introProgressRef.current = 0;
            introActiveRef.current = true;
            lastIntroKeyRef.current = introSequenceKey;
        }
    }, [introSequenceKey]);

    useEffect(() => {
        if (!focusPoint || !controlsRef.current || introActiveRef.current) {
            return;
        }

        const controls = controlsRef.current;
        const nextTarget = focusPoint.clone();
        const nextPosition = focusPoint
            .clone()
            .normalize()
            .multiplyScalar(EARTH_RADIUS_SCENE * 3.25)
            .add(new THREE.Vector3(0, EARTH_RADIUS_SCENE * 0.45, 0));

        const isAlreadyFocused = controls.target.distanceTo(nextTarget) < 0.001;

        if (!isAlreadyFocused) {
            controls.target.copy(nextTarget);
            camera.position.copy(nextPosition);
            controls.update();
        }
    }, [camera, controlsRef, focusPoint]);

    useFrame((_, delta) => {
        if (!controlsRef.current || !introActiveRef.current) {
            return;
        }

        const controls = controlsRef.current;
        const safeTarget = focusPoint ? focusPoint.clone() : new THREE.Vector3(0, 0, 0);
        const nearDirection = focusPoint
            ? focusPoint.clone().normalize()
            : new THREE.Vector3(0.25, 0.14, 1).normalize();
        const farDirection = new THREE.Vector3(0.65, 0.28, 1).normalize();
        const nearPosition = safeTarget
            .clone()
            .add(nearDirection.clone().multiplyScalar(EARTH_RADIUS_SCENE * 3.1))
            .add(new THREE.Vector3(0, EARTH_RADIUS_SCENE * 0.4, 0));
        const farPosition = safeTarget
            .clone()
            .add(farDirection.multiplyScalar(EARTH_RADIUS_SCENE * 18))
            .add(new THREE.Vector3(EARTH_RADIUS_SCENE * 0.9, EARTH_RADIUS_SCENE * 0.7, 0));

        introProgressRef.current = Math.min(1, introProgressRef.current + delta / 3.1);
        const progress = 1 - ((1 - introProgressRef.current) ** 3);

        camera.position.lerpVectors(farPosition, nearPosition, progress);
        controls.target.copy(safeTarget);
        controls.update();

        if (introProgressRef.current >= 1) {
            introActiveRef.current = false;
        }
    });

    return null;
}

function TrajectoryScene({ items, selectedMeteorIds, focusedMeteorId, onSelectMeteor, introSequenceKey }) {
    const controlsRef = useRef(null);
    const [hoveredMeteorId, setHoveredMeteorId] = useState(null);

    const trajectories = useMemo(() => {
        return items
            .map((item, index) => {
                const path = buildTrajectoryPath(item);
                if (path.length < 2) {
                    return null;
                }

                const scenePoints = path.map(point => geoToCartesian(point.latitude, point.longitude, point.altitudeKm));
                const markerPoint = scenePoints[Math.floor(scenePoints.length / 2)]?.clone();
                const labelPoint = markerPoint?.clone().multiplyScalar(1.08);
                const startScene = geoToCartesian(item.startPoint.latitude, item.startPoint.longitude, item.startPoint.altitudeKm || 0);
                const endScene = geoToCartesian(item.endPoint.latitude, item.endPoint.longitude, item.endPoint.altitudeKm || 0);
                const visibleStartScene = scenePoints[0];
                const incomingReferenceIndex = Math.min(3, Math.max(scenePoints.length - 1, 1));
                const incomingReferenceScene = scenePoints[incomingReferenceIndex] || scenePoints[1] || startScene;
                const incomingDirection = visibleStartScene.clone().sub(incomingReferenceScene);
                const startAltitudeKm = toNumber(item.startPoint.altitudeKm);
                const entryRadius = (EARTH_RADIUS_KM + Math.max(
                    Number.isFinite(startAltitudeKm) ? startAltitudeKm + ENTRY_ALTITUDE_PADDING_KM : ENTRY_ALTITUDE_FLOOR_KM,
                    ENTRY_ALTITUDE_FLOOR_KM
                )) * SCENE_SCALE;
                const entryPoint = extendPointToRadius(visibleStartScene, incomingDirection, entryRadius);
                const simulatedOriginRadius = Math.max(
                    entryRadius * SIMULATED_ORIGIN_RADIUS_MULTIPLIER,
                    EARTH_RADIUS_SCENE * 1.12
                );
                const originPoint = entryPoint
                    ? extendPointToRadius(visibleStartScene, incomingDirection, simulatedOriginRadius)
                    : null;

                return {
                    ...item,
                    color: new THREE.Color(`hsl(${(index * 37) % 360} 84% 64%)`).getStyle(),
                    selectedColor: new THREE.Color(`hsl(${(index * 37) % 360} 96% 74%)`).getStyle(),
                    scenePoints,
                    markerPoint,
                    labelPoint,
                    startScene,
                    endScene,
                    incomingPath: [originPoint, entryPoint, visibleStartScene].filter(Boolean)
                };
            })
            .filter(Boolean);
    }, [items]);

    const visibleTrajectories = useMemo(() => {
        if (!selectedMeteorIds.size) {
            return trajectories;
        }

        return trajectories.filter((trajectory) => selectedMeteorIds.has(trajectory.meteorId));
    }, [selectedMeteorIds, trajectories]);

    const focusedTrajectory = useMemo(() => {
        if (!selectedMeteorIds.size) {
            return null;
        }

        return visibleTrajectories.find(item => item.meteorId === focusedMeteorId) || visibleTrajectories[0] || null;
    }, [focusedMeteorId, selectedMeteorIds, visibleTrajectories]);

    return (
        <Canvas
            className="bolide-earth-viewer__canvas"
            onPointerMissed={() => setHoveredMeteorId(null)}
            camera={{
                position: [0, 0, EARTH_RADIUS_SCENE * 3.6],
                fov: 34,
                near: 0.01,
                far: 200
            }}
        >
            <color attach="background" args={['#020817']} />
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 2, 4]} intensity={1.7} />
            <directionalLight position={[-4, -2, -5]} intensity={0.45} color="#7dd3fc" />

            <Suspense fallback={null}>
                <Earth />
            </Suspense>

            {visibleTrajectories.map((trajectory) => {
                const isSelected = selectedMeteorIds.has(trajectory.meteorId);
                const isFocused = trajectory.meteorId === focusedTrajectory?.meteorId;
                const isHovered = trajectory.meteorId === hoveredMeteorId;
                const handleHover = (event) => {
                    event.stopPropagation();
                    setHoveredMeteorId(trajectory.meteorId);
                };
                const handleLeave = () => {
                    setHoveredMeteorId((current) => current === trajectory.meteorId ? null : current);
                };
                const handleToggle = (event) => {
                    event.stopPropagation();
                    onSelectMeteor(trajectory.meteorId);
                };

                return (
                    <group key={trajectory.meteorId}>
                        <Line
                            points={trajectory.scenePoints}
                            color={isSelected ? trajectory.selectedColor : trajectory.color}
                            lineWidth={isSelected ? 2.7 : 1.65}
                            transparent
                            opacity={isSelected ? 0.98 : 0.82}
                            onPointerOver={handleHover}
                            onPointerOut={handleLeave}
                            onClick={handleToggle}
                        />

                        {isSelected && trajectory.markerPoint ? (
                            <Sphere
                                args={[0.055, 16, 16]}
                                position={trajectory.markerPoint}
                                onPointerOver={handleHover}
                                onPointerOut={handleLeave}
                                onClick={handleToggle}
                            >
                                <meshStandardMaterial
                                    color="#f8fafc"
                                    emissive={trajectory.color}
                                    emissiveIntensity={1.9}
                                    transparent
                                    opacity={0.92}
                                />
                            </Sphere>
                        ) : null}

                        {trajectory.labelPoint && isHovered ? (
                            <Billboard position={trajectory.labelPoint}>
                                <Text
                                    fontSize={isFocused ? 0.24 : 0.2}
                                    color="#f8fafc"
                                    outlineColor="#020617"
                                    outlineWidth={0.04}
                                    anchorX="center"
                                    anchorY="middle"
                                >
                                    {`MET-${trajectory.meteorId}`}
                                </Text>
                            </Billboard>
                        ) : null}

                        {isSelected ? (
                            <>
                                {trajectory.incomingPath.length >= 2 ? (
                                    <Line
                                        points={trajectory.incomingPath}
                                    color="#fde68a"
                                    lineWidth={1.1}
                                    transparent
                                    opacity={0.76}
                                    dashed
                                    dashSize={0.045}
                                    gapSize={0.03}
                                    onPointerOver={handleHover}
                                    onPointerOut={handleLeave}
                                    onClick={handleToggle}
                                />
                                ) : null}
                                <Sphere
                                    args={[0.042, 18, 18]}
                                    position={trajectory.startScene}
                                    onPointerOver={handleHover}
                                    onPointerOut={handleLeave}
                                    onClick={handleToggle}
                                >
                                    <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.4} />
                                </Sphere>
                                <Sphere
                                    args={[0.042, 18, 18]}
                                    position={trajectory.endScene}
                                    onPointerOver={handleHover}
                                    onPointerOut={handleLeave}
                                    onClick={handleToggle}
                                >
                                    <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={1.2} />
                                </Sphere>
                                {trajectory.incomingPath[0] ? (
                                    <Sphere
                                        args={[0.026, 14, 14]}
                                        position={trajectory.incomingPath[0]}
                                        onPointerOver={handleHover}
                                        onPointerOut={handleLeave}
                                        onClick={handleToggle}
                                    >
                                        <meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={1.2} transparent opacity={0.9} />
                                    </Sphere>
                                ) : null}
                                {trajectory.incomingPath[1] ? (
                                    <Sphere
                                        args={[0.022, 14, 14]}
                                        position={trajectory.incomingPath[1]}
                                        onPointerOver={handleHover}
                                        onPointerOut={handleLeave}
                                        onClick={handleToggle}
                                    >
                                        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.4} />
                                    </Sphere>
                                ) : null}
                            </>
                        ) : null}
                    </group>
                );
            })}

            <OrbitControls
                ref={controlsRef}
                enablePan
                enableZoom
                enableRotate
                minDistance={EARTH_RADIUS_SCENE * 1.02}
                maxDistance={EARTH_RADIUS_SCENE * 9}
            />
            <CameraRig
                focusPoint={focusedTrajectory?.markerPoint || null}
                controlsRef={controlsRef}
                introSequenceKey={introSequenceKey}
            />
            <Stars
                radius={EARTH_RADIUS_SCENE * 30}
                depth={EARTH_RADIUS_SCENE * 14}
                count={5000}
                factor={4}
                saturation={0}
                speed={0.6}
            />
        </Canvas>
    );
}

export default function BolideEarthRangeViewer({ items, selectedMeteorIds, focusedMeteorId, onSelectMeteor, introSequenceKey }) {
    return (
        <div className="bolide-globe-page__viewer">
            <TrajectoryScene
                items={items}
                selectedMeteorIds={selectedMeteorIds}
                focusedMeteorId={focusedMeteorId}
                onSelectMeteor={onSelectMeteor}
                introSequenceKey={introSequenceKey}
            />
            <div className="bolide-earth-viewer__hint">
                Arrastra para orbitar, rueda para zoom, pasa por una trayectoria para ver su etiqueta y pulsa para enfocarla.
            </div>
        </div>
    );
}
