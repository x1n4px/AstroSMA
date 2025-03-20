import React from 'react';
import { useParams } from "react-router-dom";
import { Card, Container, Row } from 'react-bootstrap';
import MapChart from '@/components/map/MapChart';
import SonificationComponent from '@/components/sonification/sonification';


function Bolide() {
  const params = useParams();
  const id = params?.bolideId || '-1'; // Asegura que id tenga un valor válido


  return (
    <Container>
      <Row className='m-4'>
        {/* Mapa */}
        <div style={{ marginBottom: '20px' }}>
          <MapChart lat={36.7213} lon={-4.4216} />
        </div>
      </Row>
      <Row className='m-4'>
        <SonificationComponent />
      </Row>
    </Container>
  );
};

export default Bolide;