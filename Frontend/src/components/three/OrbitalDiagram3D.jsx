import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const OrbitalDiagram3D = ({ bolideData }) => {
  const mountRef = useRef(null); // Para el contenedor de Three.js
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);

  // Configuración de la escena
  useEffect(() => {
    if (!mountRef.current) return; // Asegurarnos de que el contenedor está montado

    // Escena, cámara y renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    setScene(scene);
    setCamera(camera);
    setRenderer(renderer);

    // Configuración de la cámara
    camera.position.z = 10;

    // Función de animación
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Función de limpieza al desmontar el componente
    return () => {
      if (mountRef.current && renderer) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Crear los objetos (Sol, Tierra y órbitas)
  useEffect(() => {
    if (!scene || !camera || !renderer) return;

    // 1. Crear el Sol (esfera amarilla)
    const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // 2. Crear la Tierra (esfera azul) y su órbita
    const earthGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // 3. Crear la órbita de la Tierra (elipse)
    const earthOrbitGeometry = new THREE.RingGeometry(3, 3.2, 64);
    const earthOrbitMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const earthOrbit = new THREE.Mesh(earthOrbitGeometry, earthOrbitMaterial);
    earthOrbit.rotation.x = Math.PI / 2; // Rotar la órbita para que sea plana
    scene.add(earthOrbit);

    // 4. Crear la órbita del bólido
    const bolideOrbitPoints = calculateBolideOrbit(bolideData);
    const bolideOrbitGeometry = new THREE.BufferGeometry().setFromPoints(bolideOrbitPoints);
    const bolideOrbitMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const bolideOrbit = new THREE.Line(bolideOrbitGeometry, bolideOrbitMaterial);
    scene.add(bolideOrbit);

    // Función para calcular los puntos de la órbita del bólido
    function calculateBolideOrbit({ a, e, omega, Omega, i }) {
      const points = [];
      const scale = 1; // Escala para la visualización
      const i_rad = (i * Math.PI) / 180;
      const omega_rad = (omega * Math.PI) / 180;
      const Omega_rad = (Omega * Math.PI) / 180;

      for (let theta = 0; theta < 2 * Math.PI; theta += 0.1) {
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
        const x_orb = r * Math.cos(theta);
        const y_orb = r * Math.sin(theta);

        const x = x_orb * (Math.cos(Omega_rad) * Math.cos(omega_rad) - Math.sin(Omega_rad) * Math.sin(omega_rad) * Math.cos(i_rad));
        const y = y_orb * (Math.sin(Omega_rad) * Math.cos(omega_rad) + Math.cos(Omega_rad) * Math.sin(omega_rad) * Math.cos(i_rad));

        points.push(new THREE.Vector3(x, y, 0)); // Usamos 2D para simplificar
      }

      return points;
    }

    // Función de animación
    const animateOrbit = () => {
      earth.rotation.y += 0.01; // Movimiento de la Tierra alrededor del Sol
      requestAnimationFrame(animateOrbit);
    };
    animateOrbit();

  }, [scene, camera, renderer, bolideData]);

  return <div ref={mountRef} />;
};

export default OrbitalDiagram3D;
