import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DashboardSettingsModal from '../../config/DashboardSettingsModal';

// Internationalization
import { useTranslation } from 'react-i18next';

// Chart
import BarChart from '../../components/chart/BarChart';
import LineChart from '../../components/chart/LineChart';
import PieChart from '../../components/chart/PieChart';
import ScatterPlot from '../../components/chart/ScatterPlot';
import SizeBarChart from '../../components/chart/SizeBarChart';

 

function Dashboard() {
  const { t } = useTranslation(['dashboard']);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [chartVisibility, setChartVisibility] = useState({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
  });

  const chartData = [
    { label: 'A', value: 30 },
    { label: 'B', value: 50 },
    { label: 'C', value: 80 },
    { label: 'D', value: 40 },
    { label: 'E', value: 60 },
    { label: 'F', value: 90 },
  ];

  const scatterData = [
    { latitude: 40.7128, longitude: -74.0060 }, // Nueva York
    { latitude: 34.0522, longitude: -118.2437 }, // Los Ángeles
    { latitude: 41.8781, longitude: -87.6298 }, // Chicago
    { latitude: 51.5074, longitude: -0.1278 }, // Londres
    { latitude: 48.8566, longitude: 2.3522 }, // París
    { latitude: 35.6895, longitude: 139.6917 }, // Tokio
    { latitude: -33.8688, longitude: 151.2093 }, // Sídney
    { latitude: -22.9068, longitude: -43.1729 }, // Río de Janeiro
    { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
    { latitude: 52.5200, longitude: 13.4050 }, // Berlín
    { latitude: 43.6532, longitude: -79.3832 }, // Toronto
    { latitude: 19.4326, longitude: -99.1332 }, // Ciudad de México
    { latitude: 25.7617, longitude: -80.1918 }, // Miami
    { latitude: 39.9042, longitude: 116.4074 }, // Pekín
    { latitude: 28.6139, longitude: 77.2090 }, // Nueva Delhi
  ];

  const lineData = [
    { date: new Date('2023-01-01'), count: 10 },
    { date: new Date('2023-02-01'), count: 15 },
    { date: new Date('2023-03-01'), count: 20 },
    { date: new Date('2023-04-01'), count: 25 },
    { date: new Date('2023-05-01'), count: 30 },
    { date: new Date('2023-06-01'), count: 35 },
    { date: new Date('2023-07-01'), count: 40 },
    { date: new Date('2023-08-01'), count: 45 },
    { date: new Date('2023-09-01'), count: 50 },
    { date: new Date('2023-10-01'), count: 55 },
    { date: new Date('2023-11-01'), count: 60 },
    { date: new Date('2023-12-01'), count: 65 },
  ];

  const sizeBarData = [
    { sizeRange: 'Pequeño', count: 30 },
    { sizeRange: 'Mediano', count: 50 },
    { sizeRange: 'Grande', count: 20 },
    { sizeRange: 'Muy Grande', count: 10 },
  ];

  const pieData = [
    { composition: 'Rocoso', count: 40 },
    { composition: 'Metálico', count: 30 },
    { composition: 'Hielo', count: 20 },
    { composition: 'Orgánico', count: 10 },
  ];

  const listItems = [
    { id: 1, title: '20250215', path: '/report/1' },
    { id: 2, title: '20240908', path: '/report/2' },
    { id: 3, title: '20240827', path: '/report/3' },
    { id: 4, title: '20240821', path: '/report/4' },
  ];


  const handleOpenSettingsModal = () => setShowSettingsModal(true);
  const handleCloseSettingsModal = () => setShowSettingsModal(false);

  const handleSaveSettings = (newSettings) => {
    setChartVisibility(newSettings);
  };

  return (
    <Container fluid>
      <Button variant="primary" onClick={handleOpenSettingsModal} className="mb-3 mt-3">
        {t('CONFIGURATION_BTN')}
      </Button>

      <Row className="justify-content-center mt-4">
        {chartVisibility[1] && (
          <Col xs={12} md={6} lg={4} xl={3} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Gráfica 1</Card.Title>
                <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                  <BarChart data={chartData} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        {chartVisibility[2] && (
          <Col xs={12} md={6} lg={4} xl={3} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Gráfica 2</Card.Title>
                <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                  <LineChart data={lineData} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        {chartVisibility[3] && (
          <Col xs={12} md={6} lg={4} xl={3} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Gráfica 3</Card.Title>
                <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                  <PieChart data={pieData} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        {chartVisibility[4] && (
          <Col xs={12} md={6} lg={4} xl={3} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Gráfica 4</Card.Title>
                <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                  <SizeBarChart data={sizeBarData} />
                </div>
                <Link to="/report/4/bolide/1" style={{ color: 'black' }}>
                  boton
                </Link>
              </Card.Body>
            </Card>
          </Col>
        )}

        {chartVisibility[5] && (
          <Col xs={12} md={6} lg={4} xl={3} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Gráfica 5</Card.Title>
                <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                  <ScatterPlot data={scatterData} />
                </div>
                <Link to="/report/4/bolide/1" style={{ color: 'black' }}>
                  boton
                </Link>
              </Card.Body>
            </Card>
          </Col>
        )}

        {chartVisibility[6] && (
          <Col xs={12} md={6} lg={4} xl={3} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Listado informe Z lluvia A</Card.Title>
                <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                  <ListGroup>
                    {listItems.map((item) => (
                      <ListGroup.Item key={item.id} action as={Link} to={item.path}>
                        Informe {item.title}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        {chartVisibility[7] && (
          <Col xs={12} md={6} lg={4} xl={3} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Listado infomes con antigiro</Card.Title>
                <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                  <ListGroup>
                    {listItems.map((item) => (
                      <ListGroup.Item key={item.id} action as={Link} to={item.path}>
                        Informe {item.title}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <DashboardSettingsModal
        show={showSettingsModal}
        onHide={handleCloseSettingsModal}
        onSave={handleSaveSettings}
        initialSettings={chartVisibility}
      />
    </Container>
  );
}

export default Dashboard;