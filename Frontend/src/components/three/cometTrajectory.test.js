// cometTrajectory.test.js
import * as THREE from 'three';
import { cos } from 'three/tsl';

// Datos de prueba (puedes modificarlos según necesites)
const testOrbitalElements = {
    "Informe_Z_IdInforme": 615,
    "Calculados_con": "vi",
    "Vel__Inf": "22.47 22.4704415488787 22.4701708497541 2.12702921148541",
    "Vel__Geo": "19.49 19.4873462633801 19.4870341253984 0.000156068990840197",
    "Ar": "205.74 205.798548 205.683165 0.0576915000000042",
    "De": "-12.65 -12.630579 -12.662821 0.0161210000000001",
    "i": "0.78 0.790053303733871 0.760336433995117 0.0148584348693767",
    "p": "0.04363323129985824 0.04371837466659219 0.043688450001618945 1.4962332486648165e-05",
    "a": "-1.79 -1.78973482781655 -1.79330023658543 0.00178270438443784",
    "e": "1.55 1.54905800992876 1.54785076975241 0.000603620088175161",
    "q": "0.98 0.982668242861152 0.982460915010508 0.000103663925321795",
    "T": "23.60 23.6011595468156 23.6010436290814 5.79588670817088e-05",
    "omega": "-17.80 -17.7656586785315 -17.8316043064268 0.0329728139476693",
    "Omega_grados_votos_max_min": "(326.791055 8), (326.791055 0) 326.791054853474 326.791054853474",
    "Fecha": "2023-08-19T22:00:00.000Z",
    "Hora": "00:57:29.0589"
  };

// Función para calcular la trayectoria (copiada de tu componente)
function calculateCometTrajectory(orbitalElements, scaleFactor = 20, earthPosition = new THREE.Vector3(10, 0, 0)) {
  if (!orbitalElements) return null;

  const a = parseFloat(orbitalElements.a.split(' ')[0]);
  const e = parseFloat(orbitalElements.e.split(' ')[0]);
  const i = THREE.MathUtils.degToRad(parseFloat(orbitalElements.i.split(' ')[0]));

  const omegaString = orbitalElements.Omega_grados_votos_max_min;
  const omegaMatch = omegaString.match(/\(([^)]+)\)/);
  const omegaValue = omegaMatch ? parseFloat(omegaMatch[1]) : NaN;
  const Ω = THREE.MathUtils.degToRad(omegaValue);

  const ω = THREE.MathUtils.degToRad(parseFloat(orbitalElements.omega.split(' ')[0]));

  if (isNaN(Ω) || isNaN(a) || isNaN(e) || isNaN(i) || isNaN(ω) || e > 1 ) {
    console.error("Datos orbitales inválidos");
    return null;
  }

  const points = [];
  const numPoints = 100; // Reducido para pruebas

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
    console.log(e, E,x, y, a,  Math.sqrt(1 - e * e), Math.sin(E))
    const cosΩ = Math.cos(Ω);
    const sinΩ = Math.sin(Ω);
    const cosi = Math.cos(i);
    const sini = Math.sin(i);
    const cosω = Math.cos(ω);
    const sinω = Math.sin(ω);


    const X = (cosΩ * cosω - sinΩ * sinω * cosi) * x + (-cosΩ * sinω - sinΩ * cosω * cosi) * y;
    const Y = (sinΩ * cosω + cosΩ * sinω * cosi) * x + (-sinΩ * sinω + cosΩ * cosω * cosi) * y;
    const Z = (sinω * sini) * x + (cosω * sini) * y;
    console.log(X,Y,Z)
    points.push(new THREE.Vector3(X * scaleFactor, Y * scaleFactor, Z * scaleFactor).add(earthPosition));
  }



  return points;
}

// Función de validación (copiada de tu componente)
function areOrbitalElementsValid(elements) {
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
}

// Pruebas
console.log("=== Probando validación de datos ===");
console.log("Datos válidos?", areOrbitalElementsValid(testOrbitalElements));

console.log("\n=== Calculando trayectoria ===");
const trajectory = calculateCometTrajectory(testOrbitalElements);
console.log("Puntos de trayectoria calculados:", trajectory);

// Mostrar algunos puntos de ejemplo
if (trajectory && trajectory.length > 0) {
  console.log("\nPrimeros 5 puntos de la trayectoria:");
  for (let i = 0; i < Math.min(5, trajectory.length); i++) {
    console.log(`Punto ${i + 1}:`, trajectory[i]);
  }
}