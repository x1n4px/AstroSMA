import React from 'react';
import StationMapChart from '@/components/map/StationMapChart';


const StationReport = () => {

    function calcularPuntoMedio(puntos) {
        const { lat: lat1, lon: lon1 } = puntos[0];
        const { lat: lat2, lon: lon2 } = puntos[1];
    
        // Convertir grados a radianes
        const rad = Math.PI / 180;
        const lat1Rad = lat1 * rad;
        const lon1Rad = lon1 * rad;
        const lat2Rad = lat2 * rad;
        const lon2Rad = lon2 * rad;
    
        // Calcular el punto medio
        const dLon = lon2Rad - lon1Rad;
        const Bx = Math.cos(lat2Rad) * Math.cos(dLon);
        const By = Math.cos(lat2Rad) * Math.sin(dLon);
    
        const latMedioRad = Math.atan2(
            Math.sin(lat1Rad) + Math.sin(lat2Rad),
            Math.sqrt((Math.cos(lat1Rad) + Bx) ** 2 + By ** 2)
        );
    
        const lonMedioRad = lon1Rad + Math.atan2(By, Math.cos(lat1Rad) + Bx);
    
        // Convertir radianes a grados
        const latMedio = latMedioRad / rad;
        const lonMedio = lonMedioRad / rad;
    
        return { lat: latMedio, lon: lonMedio };
    }
    
    const data2 = [
        {
            id: 1,
            lat: 40.4168,
            lon: -3.7038,
            title: 'Estación 1',
            date: '2023-10-27',
            video: '',
            height: 83,
            state: 0
        },
        {
            id: 2,
            lat: 41.3851,
            lon: 2.1734,
            title: 'Estación 2',
            date: '2023-10-27',
            video: '',
            height: 30,
            state: 0
        },
    ];


    const {lat, lon} = calcularPuntoMedio(data2);

    

    return (
        <div>
            <StationMapChart data={data2} lat={lat} lon={lon} activePopUp={true} zoom={6} useStatinIcon={true} />
        </div>
    );
};

export default StationReport;