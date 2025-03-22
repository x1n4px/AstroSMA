import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DashboardSettingsModal from '../../config/DashboardSettingsModal';
import { useDrag, useDrop } from 'react-dnd';

import '@/assets/customExpandModalButton.css'

import { getGeneral } from '@/services/dashboardService.jsx';
import ChartModal from '@/components/modal/ChartModal';

// Internationalization
import { useTranslation } from 'react-i18next';

// Chart
import BarChart from '../../components/chart/BarChart';
import LineChart from '../../components/chart/LineChart';
import PieChart from '../../components/chart/PieChart';
import ScatterPlot from '../../components/chart/ScatterPlot';
import SizeBarChart from '../../components/chart/SizeBarChart';
import HorizontalBarChart from '../../components/chart/HorizontalBarChart';
import GroupedBarChart from '../../components/chart/GroupedBarChart';

const ItemTypes = {
  CHART: 'chart',
};


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



const sizeBarData = [
  { sizeRange: 'Pequeño', count: 30 },
  { sizeRange: 'Mediano', count: 50 },
  { sizeRange: 'Grande', count: 20 },
  { sizeRange: 'Muy Grande', count: 10 },
];


const listItems = [
  { id: 1, title: '20250215', path: '/report/1' },
  { id: 2, title: '20240908', path: '/report/2' },
  { id: 3, title: '20240827', path: '/report/3' },
  { id: 4, title: '20240821', path: '/report/4' },
];

const horizontalBarChartData = [
  { label: 'Región Alfa', value: 180 },
  { label: 'Región Beta', value: 150 },
  { label: 'Región Gamma', value: 200 },
  { label: 'Región Delta', value: 120 },
];




const DraggableChart = ({ id, children, moveChart, chartsToShow }) => {
  const [showModal, setShowModal] = useState(false);

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

  let xlValue = 12 / chartsToShow;
  if (xlValue < 3) {
    xlValue = 2; // Asegura que xlValue no sea menor que 2
  }

  return (
    <Col ref={(node) => drag(drop(node))} xs={12} md={6} lg={4} xl={xlValue} className="mb-4" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="shadow-sm bg-white rounded p-4">
        <Card.Body>
          {children}
          <Button  className="custom-button mt-2" onClick={() => setShowModal(true)} >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{fill: "rgb(255, 255, 255)"}}><path d="M5 12H3v9h9v-2H5zm7-7h7v7h2V3h-9z"></path></svg>
          <span>Ver en pantalla completa</span>
          </Button>
        </Card.Body>
      </div>

      {/* Modal para esta tarjeta */}
      <ChartModal show={showModal} onHide={() => setShowModal(false)}>
        {children}
      </ChartModal>
    </Col>
  );
};


function Dashboard() {
  const { t } = useTranslation(['text']);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [chartVisibility, setChartVisibility] = useState({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: false });
  const [selectedChart, setSelectedChart] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);

  const [chartOrder, setChartOrder] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [chartsToShow, setChartsToShow] = useState(4);
  const [searchRange, setsearchRange] = useState(1);
  const [previousSearchRange, setPreviousSearchRange] = useState(1);
  const isInitialMount = useRef(true);

  //const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [groupChartData, setGroupChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleOpenSettingsModal = () => setShowSettingsModal(true);
  const handleCloseSettingsModal = () => setShowSettingsModal(false);

  const handleSaveSettings = (newSettings, newOrder) => {
    setChartVisibility(newSettings);
    setChartOrder(newOrder);
  };

  const handleOpenChartModal = (chartComponent) => {
    setSelectedChart(chartComponent);
    setShowChartModal(true);
  }

  const handleCloseChartModal = () => {
    setShowChartModal(false);
    setSelectedChart(null);
  }

  const moveChart = useCallback((dragIndex, hoverIndex) => {
    setChartOrder((prevCharts) => {
      const draggedChart = prevCharts[dragIndex];
      const newCharts = [...prevCharts];
      newCharts.splice(dragIndex, 1);
      newCharts.splice(hoverIndex, 0, draggedChart);
      return newCharts;
    });
  }, []);

  const handleChartsToShowChange = (event) => {
    setChartsToShow(parseInt(event.target.value));
  };


  const fetchData = async () => {
    try {
      const responseD = await getGeneral(searchRange);
      console.log(responseD);
      //setData(responseD.data);
      setChartData(responseD.barChartData)
      setPieChartData(responseD.pieChartData[0]);
      setGroupChartData(responseD.groupChartData);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isInitialMount.current) {
      fetchData();
      isInitialMount.current = false;
    } else if (!showSettingsModal && searchRange !== previousSearchRange) {
      fetchData();
      setPreviousSearchRange(searchRange); // Actualizar previousSearchRange
    }
  }, [showSettingsModal, searchRange, previousSearchRange, chartsToShow]);




  return (
    <Container fluid style={{ backgroundColor: '#f5f5f5' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 pt-3 mx-3">
        <Button style={{ backgroundColor: '#980100', borderColor: '#980100' }} onClick={handleOpenSettingsModal}>
          {t('DASHBOARD.CONFIGURATION_BTN')}
        </Button>



        <div className="d-none d-xl-block">
          <Form.Select value={chartsToShow} onChange={handleChartsToShowChange} style={{ width: 'auto' }}>
            {[1, 2, 3, 4, 6].map((num) => (
              <option key={num} value={num}>
                {t('DASHBOARD.SHOW_OPTIONS_BTN', { num: num })}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      {/* <Alert variant="info" className="mb-3">
        {t('DRAG_AND_DROP_INFO')}
      </Alert> */}

      <Row className="justify-content-center mt-4 mx-1">
        <Button className="py-2" style={{ backgroundColor: '#980100', borderColor: '#980100' }} action as={Link} to="/customize-search">
          {t('DASHBOARD.CUSTOMIZE_SEARCH_BTN')}
        </Button>
      </Row>

      <Row className="justify-content-center mt-4" >
        {chartOrder.map((id, index) => {
          if (!chartVisibility[id]) return null;

          let chartComponent;
          switch (id) {
            case 1:
              chartComponent = (
                <>
                  <Card.Title >{t('DASHBOARD.GRAPH.FIRST.TITLE')}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.FIRST.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%' }}>
                    <BarChart data={chartData} key={`key-${chartsToShow}`} />
                  </div>
                  
                </>
              );
              break;
            case 2:
              chartComponent = (
                <>
                  <Card.Title>{t('DASHBOARD.GRAPH.SECOND.TITLE')}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.SECOND.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%' }}>
                    {/* <LineChart data={data} xVariable={'Velocidad_media'} yVariable={'Tiempo_Estacion_1'} key={`key-${chartsToShow}`} /> */}
                    <GroupedBarChart data={groupChartData} key={`key-${chartsToShow}`} />
                  </div>
                </>
              );
              break;
            case 3:
              chartComponent = (
                <>
                  <Card.Title>{t('DASHBOARD.GRAPH.THIRD.TITLE')}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.THIRD.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%'  }}>
                    <SizeBarChart data={sizeBarData} key={`key-${chartsToShow}`} />

                  </div>
                </>
              );
              break;
            case 4:
              chartComponent = (
                <>
                  <Card.Title>{t('DASHBOARD.GRAPH.FOURTH.TITLE')}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.FOURTH.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%'  }}>
                    <PieChart data={pieChartData} key={`key-${chartsToShow}`} />
                  </div>
                </>
              );
              break;
            case 5:
              chartComponent = (
                <>
                  <Card.Title>{t('DASHBOARD.GRAPH.FIFTH.TITLE')}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.FIFTH.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', aspectRatio: '1' }}>
                    <ScatterPlot data={scatterData} xVariable={'latitude'} yVariable={'longitude'} key={`key-${chartsToShow}`} />
                  </div>
                </>
              );
              break;
            case 6:
              chartComponent = (
                <>
                  <Card.Title>{t('DASHBOARD.GRAPH.SIXTH.TITLE')}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.SIXTH.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', aspectRatio: '1' }}>
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
                  <Card.Title>Listado infomes con excentricidad superior al 0.90</Card.Title>
                  <div style={{ overflow: 'hidden', aspectRatio: '1', overflowY: 'auto', maxHeight: '300px' }}>
                    <ListGroup>
                      {/* {data &&
                      data
                        .filter((item) => parseFloat(item.e) > 0.90) // Filtrar aquí
                        .map((item) => (
                          <ListGroup.Item key={item.IdInforme} action as={Link} to={`/report/${item.IdInforme}`}>
                            Informe {item.IdInforme}
                          </ListGroup.Item>
                        ))} */}
                    </ListGroup>
                  </div>
                </>
              );
              break;
            case 8:
              chartComponent = (
                <>
                  <Card.Title>{t('DASHBOARD.GRAPH.SEVENTH.TITLE')}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.SEVENTH.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', aspectRatio: '1' }}>
                    <HorizontalBarChart data={horizontalBarChartData} key={`key-${chartsToShow}`} />
                  </div>
                </>
              );
              break;
            case 9:
              chartComponent = (
                <>
                  <Card.Title>Gráfica 5</Card.Title>
                  <div style={{ overflow: 'hidden', aspectRatio: '1' }}>

                  </div>
                </>
              );
              break;
            default:
              chartComponent = null;
          }

          return (
            <DraggableChart key={id} id={index} moveChart={moveChart} chartsToShow={chartsToShow}>
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
        searchRange={searchRange}
        setsearchRange={setsearchRange}
      />
    </Container>
  );
}

export default Dashboard;