import React from 'react';
import { useParams } from "react-router-dom";
import { Container, Row } from 'react-bootstrap';
import MapChart from '@/components/map/MapChart';
import RelatedReportsTab from '@/pages/astronomy/report/pages/relatedReportsTab.jsx';


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
        <RelatedReportsTab
          meteorId={id}
          currentReportType="METEOR"
        />
      </Row>
    </Container>
  );
};

export default Bolide;
