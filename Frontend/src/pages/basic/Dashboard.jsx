import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DashboardSettingsModal from '../../config/DashboardSettingsModal';
import { useDrag, useDrop } from 'react-dnd';

import '@/assets/customExpandModalButton.css'

import { getGeneral } from '@/services/dashboardService.jsx';
import ChartModal from '@/components/modal/ChartModal';
import { formatDate } from '@/pipe/formatDate.jsx'

// Internationalization
import { useTranslation } from 'react-i18next';

// Chart
import BarChart from '@/components/chart/BarChart';
import LineChart from '@/components/chart/LineChart';
import PieChart from '@/components/chart/PieChart';
import ScatterPlot from '@/components/chart/ScatterPlot';
import SizeBarChart from '@/components/chart/SizeBarChart';
import HorizontalBarChart from '@/components/chart/HorizontalBarChart';
import GroupedBarChart from '@/components/chart/GroupedBarChart';
import RoseChart from '@/components/chart/RoseChart';
import MultiMarkerMapChart from '@/components/map/MultiMarkerMapChart';
import BarChartWithError from '@/components/chart/BarChartWithError';

const ItemTypes = {
  CHART: 'chart',
};







const DraggableChart = ({ id, children, moveChart, chartsToShow, doubleWidth, fullWidth, showButton }) => {
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

  // Si doubleWidth es true, duplica el ancho
  if (doubleWidth) {
    xlValue *= 2;
  }

  // Si fullWidth es true, ocupa todo el ancho
  if (fullWidth) {
    xlValue = 12;
  }

  return (
    <Col ref={(node) => drag(drop(node))} xs={12} md={fullWidth ? 12 : doubleWidth ? 12 : 6} lg={fullWidth ? 12 : doubleWidth ? 16 : 4} xl={xlValue} className="mb-4" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="shadow-sm bg-white rounded p-4">
        <Card.Body>
          {children}
          {showButton && (
            <Button className="custom-button mt-2" onClick={() => setShowModal(true)} >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: "rgb(255, 255, 255)" }}><path d="M5 12H3v9h9v-2H5zm7-7h7v7h2V3h-9z"></path></svg>
              <span>Ver en pantalla completa</span>
            </Button>
          )}
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
  const [chartVisibility, setChartVisibility] = useState({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true, 11: false });
  const [selectedChart, setSelectedChart] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);

  const [chartOrder, setChartOrder] = useState([2,1, 3, 4, 5, 6, 7, 9, 8, 10, 11]);
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
  const [monthObservationsFrequency, setMonthObservationsFrequency] = useState([]);
  const [meteorInflowAzimuthDistribution, setMeteorInflowAzimuthDistribution] = useState([]);
  const [relationBtwTrajectoryAngleAndDistance, setRelationBtwTrajectoryAngleAndDistance] = useState([]);
  const [hourWithMoreDetection, setHourWithMoreDetection] = useState([]);
  const [predictableImpact, setPredictableImpact] = useState([]);
  const [excentricitiesOverNinety, setExcentricitiesOverNinety] = useState([]);
  const [distanceWithErrorFromObservatory, setDistanceWithErrorFromObservatory] = useState([]); 
  const [velocityDispersionVersusDihedralAngle, setVelocityDispersionVersusDihedralAngle] = useState([]);
  const [observatoryData, setObservatoryData] = useState([]); 
  const [lastReport, setLastReport] = useState([]);
  const [lastReportMap, setLastReportMap] = useState([]);

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
      console.log(responseD.lastReportMap);
      //setData(responseD.data);
      setChartData(responseD.barChartData)
      setPieChartData(responseD.pieChartData);
      setGroupChartData(responseD.groupChartData);
      setMonthObservationsFrequency(responseD.monthObservationsFrequency);
      setMeteorInflowAzimuthDistribution(responseD.meteorInflowAzimuthDistribution);
      setRelationBtwTrajectoryAngleAndDistance(responseD.relationBtwTrajectoryAngleAndDistance);
      setHourWithMoreDetection(responseD.hourWithMoreDetection);
      setPredictableImpact(responseD.impactMapFormat);
      setExcentricitiesOverNinety(responseD.excentricitiesOverNinety);
      setLastReport(responseD.lastReport);
      setDistanceWithErrorFromObservatory(responseD.distanceWithErrorFromObservatory);
      setVelocityDispersionVersusDihedralAngle(responseD.velocityDispersionVersusDihedralAngle);
      setObservatoryData(responseD.observatoryDataFormatted);
      setLastReportMap(responseD.lastReportMap);
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


  const datosTransformados = monthObservationsFrequency.map(d => ({
    ...d,
    mes_anio: new Date(d.mes_anio),
  }));


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


      <Row className="justify-content-center mt-4 mx-1">
        <Button className="py-2" style={{ backgroundColor: '#980100', borderColor: '#980100' }} action as={Link} to="/customize-search">
          {t('DASHBOARD.CUSTOMIZE_SEARCH_BTN')}
        </Button>
      </Row>

      <Row className="justify-content-center mt-4" >
        {chartOrder.map((id, index) => {
          if (!chartVisibility[id]) return null;

          let chartComponent;
          let doubleWidth = false;
          let fullWidth = false;
          let showButton = true;
          switch (id) {
            case 1:
              chartComponent = (
                <>
                  <Card.Title >{t('DASHBOARD.GRAPH.FIRST.TITLE')}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.FIRST.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%' }}>
                    <BarChart data={chartData} key={`key-a1-${chartsToShow}`} />
                  </div>

                </>
              );
              break;
            case 2:
              chartComponent = (
                <>
                   <Card.Title>{t('DASHBOARD.GRAPH.SECOND.TITLE')}: {formatDate(lastReportMap[0]?.AUX.Fecha)} {lastReportMap[0]?.AUX.Hora}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.EIGHTH.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', height: '80%', width: '100%' }}>
                    <MultiMarkerMapChart data={lastReportMap.map(item => item.MAP_DATA)} key={`key-a9-${chartsToShow}`} observatory={observatoryData} />
                  </div>
                </>
              );
              fullWidth = true;
              doubleWidth = false;
              break;
            case 3:
              chartComponent = (
                <>
                  <Card.Title>{t('DASHBOARD.GRAPH.THIRD.TITLE')}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.THIRD.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%' }}>
                    <LineChart data={datosTransformados} xVariable={'mes_anio'} yVariable={'total_observaciones'} key={`key-a3-${chartsToShow}`} />

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
                  <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%' }}>
                    <PieChart data={pieChartData} key={`key-a4-${chartsToShow}`} />
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
                  <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%' }}>
                    <BarChartWithError data={distanceWithErrorFromObservatory} key={`key-a5-${chartsToShow}`} />
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
                  <div style={{ overflow: 'hidden', aspectRatio: '1' , overflowY: 'auto', maxHeight: 'auto' }}>
                    <ListGroup>
                      {lastReport.map((item) => (
                        <ListGroup.Item key={item.IdInforme} action as={Link} to={`/report/${item.IdInforme}`}>
                          {formatDate(item.Fecha)} - {item.Hora.toString().substring(0, 8)}
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
                  <Card.Title>{t('DASHBOARD.GRAPH.SEVENTH.TITLE')}</Card.Title>
                  <div style={{ overflow: 'hidden', aspectRatio: '1', overflowY: 'auto', maxHeight: 'auto' }}>
                    <ListGroup>
                      {excentricitiesOverNinety &&
                        excentricitiesOverNinety.map((item) => (
                          <ListGroup.Item key={item.IdInforme} action as={Link} to={`/report/${item.IdInforme}`}>
                            {formatDate(item.Fecha)} - {item.Hora.toString().substring(0, 8)}
                          </ListGroup.Item>
                        ))}
                    </ListGroup>
                  </div>
                </>
              );
              break;
            case 8:
              chartComponent = (
                <>
                  <Card.Title>{t('DASHBOARD.GRAPH.EIGHTH.TITLE')}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.EIGHTH.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%' }}>
                    <LineChart data={hourWithMoreDetection} xVariable={'hora_numerica'} yVariable={'total_meteoros'} key={`key-a8-${chartsToShow}`} />
                  </div>
                </>
              );
              break;
            case 9:
              chartComponent = (
                <>
                  <Card.Title>{t('DASHBOARD.GRAPH.NINTH.TITLE')}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.EIGHTH.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', height: '80%', width: '100%' }}>
                    <MultiMarkerMapChart data={predictableImpact} key={`key-a9-${chartsToShow}`} observatory={observatoryData} />
                  </div>
                </>
              );
              fullWidth = false;
              doubleWidth = true;
              break;

            case 10:
              chartComponent = (
                <>
                  <Card.Title>{t('DASHBOARD.GRAPH.TENTH.TITLE')}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.TENTH.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%' }}>
                    <RoseChart data={meteorInflowAzimuthDistribution} angleVariable={'azimut_agrupado'} valueVariable={'cantidad'} key={`key-a10-${chartsToShow}`} />
                  </div>
                </>
              );
              break;
            case 11:
              chartComponent = (
                <>
                  <Card.Title>{t('DASHBOARD.GRAPH.ELEVENTH.TITLE')}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {t('DASHBOARD.GRAPH.ELEVENTH.DESCRIPTION')}
                  </Card.Subtitle>
                  <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%' }}>
                    <ScatterPlot data={relationBtwTrajectoryAngleAndDistance} xVariable={'angle'} yVariable={'averageDistance'} key={`key-a11-${chartsToShow}`} />
                  </div>
                </>
              );
              break;
           
            default:
              chartComponent = null;
          }

          return (
            <DraggableChart key={id} id={index} moveChart={moveChart} chartsToShow={chartsToShow} doubleWidth={doubleWidth} showButton={showButton} fullWidth={fullWidth}>
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