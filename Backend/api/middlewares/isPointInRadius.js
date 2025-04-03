require('dotenv').config(); // Asegúrate de que dotenv esté configurado


function isPointInRadius(centerLat, centerLon, radius, pointLat, pointLon) {
    const R = 6371e3; // Radio de la Tierra en metros
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const dLat = toRadians(pointLat - centerLat);
    const dLon = toRadians(pointLon - centerLon);
    
    const lat1 = toRadians(centerLat);
    const lat2 = toRadians(pointLat);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en metros
    console.log(distance, radius)
    return distance <= radius;
}

module.exports = {isPointInRadius};