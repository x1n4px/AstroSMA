import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DashboardSettingsModal from '../../config/DashboardSettingsModal';
import { useDrag, useDrop } from 'react-dnd';


// Internationalization
import { useTranslation } from 'react-i18next';

// Chart
import BarChart from '../../components/chart/BarChart';
import LineChart from '../../components/chart/LineChart';
import PieChart from '../../components/chart/PieChart';
import ScatterPlot from '../../components/chart/ScatterPlot';
import SizeBarChart from '../../components/chart/SizeBarChart';

const ItemTypes = {
  CHART: 'chart',
};

const DraggableChart = ({ id, children, moveChart }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CHART,
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CHART,
    hover: (item, monitor) => {
      if (item.id === id) {
        return;
      }
      moveChart(item.id, id);
    },
  });

  return (
    <Col ref={(node) => drag(drop(node))} xs={12} md={6} lg={4} xl={3} className="mb-4" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className='shadow-sm bg-white rounded p-4'>
        <Card.Body>
          {children}
        </Card.Body>
      </div>
    </Col>
  );
};
 

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

  const [chartOrder, setChartOrder] = useState([1, 2, 3, 4, 5, 6, 7]);


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

  const handleSaveSettings = (newSettings, newOrder) => {
    setChartVisibility(newSettings);
    setChartOrder(newOrder);
  };

  const moveChart = useCallback((dragIndex, hoverIndex) => {
    setChartOrder((prevCharts) => {
      const draggedChart = prevCharts[dragIndex];
      const newCharts = [...prevCharts];
      newCharts.splice(dragIndex, 1);
      newCharts.splice(hoverIndex, 0, draggedChart);
      return newCharts;
    });
  }, []);

  return (
    <Container fluid style={{ backgroundColor: '#f0f2f5' }}> 
      <Button variant="primary" onClick={handleOpenSettingsModal} className="mb-3 mt-3">
        {t('CONFIGURATION_BTN')}
      </Button>

      <Alert variant="info" className="mb-3">
        {t('DRAG_AND_DROP_INFO')}
      </Alert>

      <Row className="justify-content-center mt-4">
        {chartOrder.map((id, index) => {
          if (!chartVisibility[id]) return null;

          let chartComponent;
          switch (id) {
            case 1:
              chartComponent = (
                <>
                  <Card.Title>Gráfica 1</Card.Title>
                  <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                    <BarChart data={chartData} />
                  </div>
                </>
              );
              break;
            case 2:
              chartComponent = (
                <>
                  <Card.Title>Gráfica 2</Card.Title>
                  <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                    <LineChart data={lineData} />
                  </div>
                </>
              );
              break;
            case 3:
              chartComponent = (
                <>
                  <Card.Title>Gráfica 3</Card.Title>
                  <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                    <PieChart data={pieData} />
                  </div>
                </>
              );
              break;
            case 4:
              chartComponent = (
                <>
                  <Card.Title>Gráfica 4</Card.Title>
                  <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                    <SizeBarChart data={sizeBarData} />
                  </div>
                </>
              );
              break;
            case 5:
              chartComponent = (
                <>
                  <Card.Title>Gráfica 5</Card.Title>
                  <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
                    <ScatterPlot data={scatterData} />
                  </div>
                </>
              );
              break;
            case 6:
              chartComponent = (
                <>
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
                </>
              );
              break;
            case 7:
              chartComponent = (
                <>
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
                </>
              );
              break;
            default:
              chartComponent = null;
          }

          return (
            <DraggableChart key={id} id={index} moveChart={moveChart}>
              {chartComponent}
            </DraggableChart>
          );
        })}
      </Row>

      <DashboardSettingsModal
        show={showSettingsModal}
        onHide={handleCloseSettingsModal}
        onSave={handleSaveSettings}
        initialSettings={chartVisibility}
        initialOrder={chartOrder}
      />
    </Container>
  );
}

export default Dashboard;