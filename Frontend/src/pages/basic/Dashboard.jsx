import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Dropdown, Card, ListGroup, Placeholder, Badge } from 'react-bootstrap';
import { Search, PersonCircle, Gear, EvStation } from 'react-bootstrap-icons';
import { getGeneral } from '@/services/dashboardService.jsx';
import { useTranslation } from 'react-i18next';
import BarChart from '@/components/chart/BarChart';
import PieChart from '@/components/chart/PieChart';
import ScatterPlot from '@/components/chart/ScatterPlot';
import LineChart from '@/components/chart/LineChart';
import CurveLineChart from '@/components/chart/CurveLineChart';
import { Link } from 'react-router-dom';
import { formatDate } from '@/pipe/formatDate.jsx'
import NextRain from '@/components/nextRain.jsx';

import '@/assets/customResponsiveDiv.css'
import MultiMarkerMapChart from '@/components/map/MultiMarkerMapChart';
import DasboardMap from '@/components/dashboard/DashboardMap.jsx';

// Skeleton
import SmallBoxSkeleton from '@/components/skeleton/SmallBoxSkeleton.jsx';
import ChartSkeleton from '@/components/skeleton/ChartSkeleton.jsx';
import MapSkeleton from '../../components/skeleton/MapSkeleton';
import ListSkeleton from '@/components/skeleton/ListSkeleton.jsx';
import ButtonsSkeleton from '@/components/skeleton/ButtonSkeleton.jsx';

const Dashboard = () => {
    const { t } = useTranslation(['text']);
    const options = [
        { value: "1", label: t('DASHBOARD_MODAL.SEARCH_RANGE_OPTION.LAST_10') },
        { value: "2", label: t('DASHBOARD_MODAL.SEARCH_RANGE_OPTION.LAST_25') },
        { value: "3", label: t('DASHBOARD_MODAL.SEARCH_RANGE_OPTION.LAST_50') },
        { value: "4", label: t('DASHBOARD_MODAL.SEARCH_RANGE_OPTION.LAST_6_MONTHS') },
        { value: "5", label: t('DASHBOARD_MODAL.SEARCH_RANGE_OPTION.LAST_YEAR') },
        { value: "6", label: t('DASHBOARD_MODAL.SEARCH_RANGE_OPTION.LAST_5_YEAR') }
    ];

    const [chartsToShow, setChartsToShow] = useState(4);
    const [searchRange, setsearchRange] = useState(1);
    const [previousSearchRange, setPreviousSearchRange] = useState(1);
    const isInitialMount = useRef(true);

    const [chartData, setChartData] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [monthObservationsFrequency, setMonthObservationsFrequency] = useState([]);
    const [hourWithMoreDetection, setHourWithMoreDetection] = useState([]);
    const [predictableImpact, setPredictableImpact] = useState([]);
    const [lastNMeteors, setExcentricitiesOverNinety] = useState([]);
    const [observatoryData, setObservatoryData] = useState([]);
    const [showerPerYearData, setShowerPerYearData] = useState([]);
    const [lastReportMap, setLastReportMap] = useState([]);
    const [lastReportData, setLastReportData] = useState();
    const [counterReport, setCounterReport] = useState([]);
    const [percentageFromLastBolideMonth, setPercentageFromLastBolideMonth] = useState([]);
    const [curvePercentageGroupLastYearBolido, setCurvePercentageGroupLastYearBolido] = useState([]);


    const Box = ({ children, className = '', color = '#f8f9fa' }) => (
        <Card className={`h-100 shadow-sm ${className} `} style={{ backgroundColor: color }}>
            <Card.Body className="d-flex align-items-center justify-content-center" >
                <div className="text-center w-100" >{children}</div>
            </Card.Body>
        </Card>
    );

    const fetchData = async () => {
        try {
            const responseD = await getGeneral(searchRange);
            setChartData(responseD.barChartData)
            setPieChartData(responseD.pieChartData);
            setMonthObservationsFrequency(responseD.monthObservationsFrequency);
            setHourWithMoreDetection(responseD.hourWithMoreDetection);
            setPredictableImpact(responseD.impactMapFormat);
            setExcentricitiesOverNinety(responseD.lastNMeteors);
            setObservatoryData(responseD.observatoryDataFormatted);
            setLastReportMap(responseD.lastReportMap);
            setShowerPerYearData(responseD.showerPerYearData);
            setLastReportData(responseD.processedLastReport[0]);
            setCounterReport(responseD.counterReport);
            setPercentageFromLastBolideMonth(responseD.percentageFromLastBolideMonth);
            setCurvePercentageGroupLastYearBolido(responseD.curvePercentageGroupLastYearBolido);
            console.log(responseD)
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    }

    const datosTransformados = monthObservationsFrequency.map(d => ({
        ...d,
        mes_anio: new Date(d.mes_anio),
    }));

    useEffect(() => {
        fetchData();
    }, [searchRange]);

    return (
        <>
            <NextRain />

            <Container fluid className="responsive-div">
                {/* Header Section */}
                <header className="dashboard-header p-3">
                    <Row className="align-items-center">
                        <Col md={6} className="d-flex align-items-center">
                            <Button
                                as={Link}
                                to="/customize-search"
                                className="py-2"
                                style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                            >
                                <Search /> {t('DASHBOARD.CUSTOMIZE_SEARCH_BTN')}
                            </Button>
                        </Col>

                        <Col md={6} className="d-flex justify-content-end">
                            <div className="d-flex align-items-center">
                                <Form.Select
                                    value={searchRange}
                                    onChange={(e) => setsearchRange(e.target.value)}
                                    className="me-3"
                                    style={{ width: '200px' }}
                                >
                                    {options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>
                        </Col>
                    </Row>
                </header>

                {/* Main Content Area */}
                <main className="dashboard-content p-4">
                    {/* Map Section */}
                    <Container className="main-container mb-4" style={{ maxWidth: '100%' }}>
                        <Row className="mb-4 flex-column-reverse flex-md-row">
                            <Col xs={12}>
                                <h5>{t('DASHBOARD.GRAPH.SECOND.TITLE')}</h5>

                                {loading ? (
                                    <MapSkeleton height="400px" />
                                ) : (

                                    <DasboardMap observatoryData={observatoryData} lastReportMap={lastReportMap} lastReportData={lastReportData} />
                                )}
                            </Col>
                        </Row>
                        {/* Row 1 */}
                        <Row className="mb-4">
                            {/* Caja 1 - 4 subcajas (50% width) */}
                            <Col md={6} className="mb-3 mb-md-0">
                                <Row>
                                    {loading ? (
                                        Array.from({ length: 6 }).map((_, i) => (
                                            <Col xs={6} key={`skeleton-col-${i}`} className="mb-3">
                                                <SmallBoxSkeleton />
                                            </Col>
                                        ))
                                    ) : (
                                        <>
                                            <Col xs={6} key="col1" className="mb-3">
                                                <Box key="box1" color={'#980100'}>
                                                    <div className="d-flex flex-column justify-content-center align-items-center">
                                                        <span style={{ fontWeight: '500', fontSize: '1rem', color: 'lightgray' }}>
                                                            {t('HOME.SMART_INFO.DETECTED_BOLIDES')}
                                                        </span>
                                                        <small style={{ fontWeight: '600', fontSize: '1.25rem', color: 'white' }}>
                                                            {counterReport[3]?.Total}
                                                        </small>
                                                    </div>
                                                </Box>
                                            </Col>

                                            <Col xs={6} key="col2" className="mb-3">
                                                <Box key="box2" color={'#980100'}>
                                                    <div className="d-flex flex-column justify-content-center align-items-center">
                                                        <span style={{ fontWeight: '500', fontSize: '1rem', color: 'lightgray' }}>{t('HOME.SMART_INFO.PHOTOMETRY_REPORTS')}</span>
                                                        <small style={{ fontWeight: '600', fontSize: '1.25rem', color: 'white' }}>{counterReport[2]?.Total}</small>
                                                    </div>
                                                </Box>
                                            </Col>
                                            <Col xs={6} key="col3" className="mb-3">
                                                <Box key="box3" color={'#980100'}>
                                                    <div className="d-flex flex-column justify-content-center align-items-center">
                                                        <span style={{ fontWeight: '500', fontSize: '1rem', color: 'lightgray' }}>{t('HOME.SMART_INFO.RADIAN_REPORTS')}</span>
                                                        <small style={{ fontWeight: '600', fontSize: '1.25rem', color: 'white' }}>{counterReport[1]?.Total}</small>
                                                    </div>
                                                </Box>
                                            </Col>
                                            <Col xs={6} key="col4" className="mb-3">
                                                <Box key="box4" color={'#980100'}>
                                                    <div className="d-flex flex-column justify-content-center align-items-center">
                                                        <span style={{ fontWeight: '500', fontSize: '1rem', color: 'lightgray' }}>{t('HOME.SMART_INFO.Z_REPORTS')}</span>
                                                        <small style={{ fontWeight: '600', fontSize: '1.25rem', color: 'white' }}>{counterReport[0]?.Total}</small>
                                                    </div>
                                                </Box>
                                            </Col>
                                            <Col xs={6} key="col5" className="mb-3">
                                                <Box key="box5" color={'#980100'}>
                                                    <div className="d-flex flex-column justify-content-center align-items-center">
                                                        <span style={{ fontWeight: '500', fontSize: '1rem', color: 'lightgray' }}>{t('HOME.SMART_INFO.MONTH_DETECTIONS')}</span>
                                                        <small style={{ fontWeight: '600', fontSize: '1.25rem', color: 'white' }}>{percentageFromLastBolideMonth?.current_detections ?? '_'}</small>
                                                    </div>
                                                </Box>
                                            </Col>
                                            <Col xs={6} key="col6" className="mb-3">
                                                <Box key="box6" color={'#980100'}>
                                                    <div className="d-flex flex-column justify-content-center align-items-center">
                                                        <span style={{ fontWeight: '500', fontSize: '1rem', color: 'lightgray' }}>{t('HOME.SMART_INFO.LAST_MONTH_DETECTIONS')}</span>
                                                        <small style={{ fontWeight: '600', fontSize: '1.25rem', color: 'white' }}>{percentageFromLastBolideMonth?.previous_month_detections ?? '_'}</small>
                                                    </div>
                                                </Box>
                                            </Col>
                                        </>
                                    )}
                                </Row>
                            </Col>

                            {/* Caja 2 - (50% width) */}
                            <Col md={6}>
                                <Box key="boxx5">
                                    <h5>{t('DASHBOARD.GRAPH.SEVENTH.TITLE')}</h5>
                                    {loading ? (
                                        <ChartSkeleton height="300px" />
                                    ) : (
                                        <div style={{ height: '300px', width: '100%', overflow: 'hidden' }}>
                                            {/* <BarChart data={meteorLastYear} key={`dashb-barchart-meteor`} /> */}
                                            {/* <GroupedBarChart data={showerPerYearData} /> */}
                                            <ListGroup style={{ overflowY: 'auto', maxHeight: '300px', height: '100%' }}>
                                                {lastNMeteors?.map((item) => (
                                                    <ListGroup.Item key={`${item.Fecha}-${item.Hora}-${item.IdInforme}`} >
                                                        <Button
                                                            as={Link}
                                                            to={item?.isRadiant ? `/radiant-report/${item.IdInforme}` : `/report/${item.IdInforme}`}
                                                            className="d-flex justify-content-between align-items-center bg-white text-dark border-0"
                                                        >
                                                            <div>
                                                                <div className="fw-bold">MET - {item.Meteoro_Identificador}</div>
                                                                <small className="text-muted">
                                                                    {formatDate(item.Fecha)} - {item.Hora.substring(0, 8)}
                                                                </small>
                                                            </div>


                                                            <Badge bg={item.isRadiant ? "#804000" : "success"} className="rounded-pill" style={{ backgroundColor: '#804000' }}>
                                                                {item.isRadiant ? t('HOME.SMART_INFO.RADIAN_REPORTS') : t('HOME.SMART_INFO.Z_REPORTS')}
                                                            </Badge>



                                                        </Button>
                                                    </ListGroup.Item>
                                                ))}

                                            </ListGroup>
                                        </div>
                                    )}
                                </Box>
                            </Col>
                        </Row>

                        {/* Row 2 */}
                        <Row className="mb-4">
                            {/* Caja 3 - (60% width) */}
                            <Col md={12} key="box6" style={{ position: 'relative', height: '100%' }}>
                                <Box>
                                    <h5>{t('DASHBOARD.GRAPH.THIRD.TITLE')}</h5>
                                    {loading ? (
                                        <ChartSkeleton height="500px" />
                                    ) : (
                                        <div key="box6" style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
                                                <CurveLineChart data={curvePercentageGroupLastYearBolido} width={900} height={500} />
                                            </div>

                                        </div>
                                    )}
                                </Box>
                            </Col>
                        </Row>

                        {/* Row 3 */}
                        <Row className="mb-4">
                            <Col md={4}>
                                <Box key="box9">
                                    <h5>{t('DASHBOARD.GRAPH.FOURTH.TITLE')}</h5>
                                    <div className='d-flex flex-column justify-content-center align-items-center'>
                                        {loading ? (
                                            <ChartSkeleton height="180px" />
                                        ) : (
                                            <div style={{ overflow: 'hidden', aspectRatio: '1', height: '350px', width: '100%', marginBlock: '10px' }}>
                                                <PieChart data={pieChartData} key={`key-pie-chart}`} />
                                            </div>
                                        )}
                                    </div>
                                </Box>
                            </Col>

                            {/* Caja 7 - (30% width) */}
                            <Col md={8}>
                                <Box key="box10">

                                    {loading ? (
                                        <ChartSkeleton height="350px" />
                                    ) : (
                                        <div style={{ overflow: 'auto', width: '100%', height: '450px' }}>
                                            <MultiMarkerMapChart data={predictableImpact} key={`key-a9-${chartsToShow}`} eminHeight={350} zoom={5} />
                                        </div>
                                    )}
                                </Box>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={9}>
                                <Box key="box11">
                                    <h5>{t('DASHBOARD.GRAPH.THIRTEENTH.TITLE')}</h5>
                                    {loading ? (
                                        <ChartSkeleton height="400px" />
                                    ) : (
                                        <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%' }}>
                                            <ScatterPlot data={showerPerYearData} xVariable="Lluvia_Año" yVariable="Lluvia_Identificador" />
                                        </div>
                                    )}
                                </Box>
                            </Col>

                            <Col md={3}>
                                <div className="d-flex flex-column justify-content-center align-items-center">
                                    <Box key={`box12`}>
                                        <p><strong>{t('DASHBOARD.GRAPH.SIXTH.TITLE')}</strong></p>
                                        {loading ? (
                                            <ChartSkeleton height="150px" />
                                        ) : (
                                            <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%' }}>
                                                <BarChart data={chartData} key={`key-a1`} />
                                            </div>
                                        )}
                                        <hr />
                                        <p><strong>{t('DASHBOARD.GRAPH.THIRD.TITLE')}</strong></p>
                                        {loading ? (
                                            <ChartSkeleton height="150px" />
                                        ) : (
                                            <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%' }}>
                                                <LineChart data={datosTransformados} xVariable={'mes_anio'} yVariable={'total_observaciones'} key={`key-a3-${chartsToShow}`} />
                                            </div>
                                        )}
                                        <hr />
                                        <p><strong>{t('DASHBOARD.GRAPH.EIGHTH.TITLE')}</strong></p>
                                        {loading ? (
                                            <ChartSkeleton height="150px" />
                                        ) : (
                                            <div style={{ overflow: 'hidden', aspectRatio: '1', height: '80%', width: '100%' }}>
                                                <LineChart data={hourWithMoreDetection} xVariable={'hora_numerica'} yVariable={'total_meteoros'} key={`key-a8-${chartsToShow}`} />
                                            </div>
                                        )}
                                    </Box>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </main >
            </Container >
        </>
    );
};

export default Dashboard;