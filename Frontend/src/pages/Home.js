import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import '../index.css';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';

import { getLastTWoBolide } from '../services/bolideService'

// Componentes
import MapaMalaga from './MapaMalaga';
import BarChart from '../components/BarChart';
import RadarChart from '../components/chart/RadarChart';
import BrushableScatterplot from '../components/chart/BushableScatterplot';
import LinkMap from '../components/chart/LinkMap'
import PendienteChart from '../components/chart/Pending';


const Home = () => {
  const [meteoros, setMeteors] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLastTWoBolide();
        setMeteors(data);
      } catch (err) {
        setError(err);
      }
    };

    fetchData();
  }, []);


  // Datos de ejemplo para el mapa
  const data = [
    {
      id: 1,
      lat: 40.4168,
      lon: -3.7038,
      title: 'Estación 1',
      date: '2023-10-27',
      video: '',
      height: 83
    },
    {
      id: 2,
      lat: 41.3851,
      lon: 2.1734,
      title: 'Estación 2',
      date: '2023-10-27',
      video: '',
      height: 30
    },
  ];





  return (
    <Container className="py-5">

      <Card className="p-4 border-0  text-center ">
        <Link
          to="search"
          className="btn btn-outline-primary w-100 py-2 fs-5 fw-semibold text-decoration-none"
        >
          Iniciar búsqueda personalizada
        </Link>
      </Card>



      <Card className="p-4 border-0 ">
        {/* Último bólido registrado */}
        <div className="position-relative mb-4 shadow rounded-r-full">
          <h5 className="position-absolute top-0 start-0 bg-white px-2 py-1 shadow-sm">
            Último bólido registrado
          </h5>

          {/* Mapa: en pantallas pequeñas lo hacemos más pequeño */}
          <div className="d-flex justify-content-center">
            <LinkMap data={data} stations={[]} style={{ maxWidth: '90%' }} />
          </div>

          <div className="position-absolute top-0  mt-2 border bg-white rounded px-4 py-2"
            style={{ zIndex: '9999', left: '50px', opacity: '85%' }}
          >
            <h4>Último bólido registrado</h4>
          </div>

          {/* Botón y PendienteChart para pantallas grandes */}
          <div className="d-none d-md-flex justify-content-between position-absolute bottom-0 start-0 end-0 mb-2 px-3">
            <Link
              className="btn btn-primary"
              style={{ zIndex: '9999' }}
              to="/informe-bolido"
            >
              Ver informe completo
            </Link>
          </div>

          <div
            className="position-absolute bg-white border p-2 shadow d-none d-lg-block"
            style={{
              zIndex: '9999',
              bottom: '0px',
              right: '10px',
              width: '300px',
            }}
          >
            <PendienteChart data={data} />
          </div>

          {/* Para pantallas medianas, PendienteChart a la derecha y el botón a la izquierda */}
          <div className="d-none d-md-flex justify-content-between position-absolute bottom-0 start-60 end-0 mb-2 px-3">
            {/* <Link
              className="btn btn-primary"
              style={{ zIndex: '9999' }}
              to="/informe-bolido"
            >
              Ver informe completo
            </Link> */}
            <div style={{
              zIndex: '9999',
              bottom: '0px',
              right: '10px',
              width: '300px',
              backgroundColor: 'white'
            }}>
              <PendienteChart data={data} />
            </div>
          </div>

          {/* Para pantallas pequeñas, PendienteChart debajo del mapa y botón debajo de este */}
          <div className="d-block d-md-none mt-3">
            <PendienteChart data={data} />
          </div>

          <div className="d-block d-md-none mt-3">
            <div className="d-flex justify-content-center">
              <Link
                className="btn btn-primary"
                style={{ zIndex: '9999' }}
                to="/informe-bolido"
              >
                Ver informe completo
              </Link>
            </div>
          </div>
        </div>





        {/* Gráficos */}
        <Row className="g-4">
          <Col xs={12} md={6}>
            <Card className="p-3 text-center shadow rounded-r-full" style={{ height: '600px' }}>
            <h3 className="text-muted mt-3">Detección de Bólidos: Últimos 6 Meses</h3> {/* Texto encima del gráfico */}

              <div className="mt-4" style={{ maxHeight: '400px' }}>
                <BarChart showTable={false} isHome={true} />
              </div>
              <Button variant="primary" as={Link} to="/bolide-graph">
                Ver más detalles
              </Button>
            </Card>
          </Col>

          <Col xs={12} md={6}>
            <Card className="p-3 text-center shadow rounded-r-full" style={{ height: '600px' }}>
              <h3 className="text-muted mt-3">Comparación de los últimos dos meteoros registrados</h3> {/* Texto encima del gráfico */}
              <div className="mt-4" style={{ maxHeight: '400px' }}>
                <RadarChart meteoros={meteoros} />
              </div>
              <Button variant="primary" as={Link} to="/comparacion-bolidos">
                Ver más detalles
              </Button>
            </Card>
          </Col>

        </Row>


        {/* Mapa de bólidos */}
        <div className="mt-4 shadow rounded-r-full">
          <h5 className="bg-white px-2 py-1 shadow-sm text-center">Registro de Meteoros - Últimos 6 meses</h5>
          <div className="bg-light p-3 rounded shadow-sm">
            <MapaMalaga />
          </div>
          <p className="text-muted text-center mt-3">
            Haciendo click en cualquiera de los puntos marcados, podrá ver más información al respecto
          </p>
        </div>
      </Card>
    </Container>
  );
}

export default Home;