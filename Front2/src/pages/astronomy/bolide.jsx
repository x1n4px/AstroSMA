import React from 'react';
import { useParams } from "react-router-dom";
import { Card } from 'react-bootstrap';
import MapChart from '../../components/map/MapChart';
import SonificationComponent from '../../components/sonification/sonification';


function Bolide() {
    const params = useParams();
    const id = params?.bolideId || '-1'; // Asegura que id tenga un valor válido


    return (
        <div style={{ 
          maxWidth: '800px', // Ancho máximo del contenedor
          margin: '0 auto', // Centrar el contenedor
          padding: '20px',
        }}>
          {/* Mapa */}
          <div style={{ marginBottom: '20px' }}>
            <MapChart lat={36.7213} lon={-4.4216} />
          </div>
    
          <SonificationComponent />
        </div>
      );
};

export default Bolide;