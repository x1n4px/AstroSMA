import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from "react-router-dom";
import '@/assets/customTabs.css'

import InferredDataReport from '@/pages/astronomy/report/pages/inferredDataReport';
import ActiveRain from '@/pages/astronomy/report/pages/activeRain.jsx'
import PendingReport from '@/pages/astronomy/report/pages/pendingReport.jsx'
import PointAdjustReport from '@/pages/astronomy/report/pages/pointAdjustReport';
import OrbitReport from '@/pages/astronomy/report/pages/orbitReport.jsx'
import PhotometryReport from '@/pages/astronomy/report/pages/photometryReport.jsx';
import RotationReport from './pages/rotationReport';
import SonificationReport from '@/pages/astronomy/report/pages/sonification/sonification.jsx';
import AssociatedDownloadReport from '@/pages/astronomy/report/pages/associatedDownloadReport.jsx';
import MediaReport from '@/pages/astronomy/report/pages/mediaReport.jsx';
import RelatedReportsTab from '@/pages/astronomy/report/pages/relatedReportsTab.jsx';
import { formatDate } from '@/pipe/formatDate.jsx';
import '@/assets/TabsStyles.css';

import { getReportZ } from '@/services/reportService.jsx'


// Internationalization
import { useTranslation } from 'react-i18next';
import { isNotQRUser } from '@/utils/roleMaskUtils';
import { AstronomyLoader } from '@/components/loader/AstronomyLoader.jsx';
import GeminiSpinnerOverlay from '@/components/GeminiSpinnerOverlay';


const Report = () => {
    const { t } = useTranslation(['text']);
    
    const params = useParams();
    const navigate = useNavigate();
    const id = params?.reportId || '-1'; // Asegura que id tenga un valor válido
    const normalizeTab = (tab) => {
            const aliases = {
                INFERRED_DATA_TAB: 'RADIANT',
                ZWO: 'FRAMES',
                SONIFICATION_TAB: 'SONIFICATION',
                ASSOCIATED_DOWNLOAD_LINK: 'RESOURCES',
                RELATED_REPORTS_TAB: 'OTHER_REPORTS'
            };
        return aliases[tab] || tab || 'RADIANT';
    };

    const initialTab = normalizeTab(params?.tab); // Obtiene la pestaña de la URL o usa una por defecto

    const [activeTab, setActiveTab] = useState(initialTab); // Inicializa activeTab con el valor de la URL
    const [reportData, setReportData] = useState(null);
    const [observatoryData, setObservatoryData] = useState([]);
    const [orbitalData, setOrbitalData] = useState([]);
    const [regressionTrajectory, setRegressionTrajectory] = useState(null);
    const [trajectoryData, setTrajectoryData] = useState(null);
    const [parametricEquation, setParametricEquation] = useState(null);
    const [activeShowerData, setActiveShowerData] = useState([]);
    const [AIUShowerData, setAIUShowerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState(null);
    const [photometryData, setPhotometryData] = useState([]);
    const [slopeMapData, setSlopeMapData] = useState(null);
    const rol = localStorage.getItem('rol');

    const [resetCount, setResetCount] = useState(0);
    const [cachedReport, setCachedReport] = useState(null);
    const [generatingGemini] = useState(false);
    const adviceData = [];



    useEffect(() => {
        if (params?.tab && params.tab !== activeTab) {
            setActiveTab(normalizeTab(params.tab));
        }
    }, [params.tab]);


    useEffect(() => {
        if (resetCount < 2) {
            const timer = setTimeout(() => setResetCount(resetCount + 1), 10);
            return () => clearTimeout(timer);
        }
    }, [resetCount]);

    useEffect(() => {
        if (!cachedReport) {
            const newReport = getTabAdvice("SUMMARY_TAB"); // Obtén los datos una vez
            setCachedReport(newReport);
        }
    }, [cachedReport]); // Solo se ejecuta si no hay un reporte almacenado

    const fetchReportData = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getReportZ(id); // Ajusta la URL del endpoint
            setActiveShowerData(response.activeShower);
            setReportData(response.report);
            setObservatoryData(response.observatorios);
            setOrbitalData(response.orbitalElement);
            setPhotometryData(response.photometryReport);
            setRegressionTrajectory(response.regressionTrajectory);
            setTrajectoryData(response.trajectory);
            setParametricEquation(response.parametricEquation);
            setAIUShowerData(response.showers.sort((a, b) => new Date(a.SubDate) - new Date(b.SubDate)));
            setSlopeMapData(response.slopeMap);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && id !== '-1') {
            fetchReportData(id);
        }
    }, [id]);




    const getTabAdvice = (tabKey) => {
        const tabMap = {
            'RADIANT': 'INFERRED_DATA_TAB',
            'MAP_TAB': 'MAP_TAB',
            'ACTIVE_RAIN_TAB': 'ACTIVE_RAIN_TAB',
            'STATIONS': 'STATIONS',
            'ORBIT': 'ORBIT',
            'PENDING_TAB': 'PENDING_TAB',
            'FRAMES': 'ZWO',
            'SONIFICATION': 'SONIFICATION',
            'PHOTOMETRY': 'PHOTOMETRY',
            'ASSOCIATED_STATIONS': 'ASSOCIATED_STATIONS',
            'RESOURCES': 'ASSOCIATED_DOWNLOAD_LINK',
            'MEDIA_TAB': 'MEDIA_TAB',
            'OTHER_REPORTS': 'RELATED_REPORTS_TAB'
        };
        const adviceForTab = adviceData.filter(advice => advice.Tab === tabMap[tabKey] && advice.status == '1');
        return adviceForTab;
    };


    // Función para manejar el cambio de pestaña y la actualización de la URL
    const handleTabSelect = (tabKey) => {
        setActiveTab(tabKey);
        navigate(`/report/${id}/${tabKey}`);
    };

    const resolveStationHeader = (stationNumber, stationLabel) => {
        const cleanNumber = stationNumber ?? '';
        if (!stationLabel) {
            return cleanNumber ? `${cleanNumber}-No tiene` : '';
        }

        const text = String(stationLabel).trim();
        const parenthesized = text.match(/^(.*)\(([^)]+)\)$/);
        if (parenthesized) {
            return `${parenthesized[2].trim()}-${parenthesized[1].trim()}`;
        }

        return cleanNumber && !text.startsWith(`${cleanNumber}-`) ? `${cleanNumber}-${text}` : text;
    };

    const eventTitle = reportData
        ? [
            'Evento',
            formatDate(reportData?.date),
            reportData?.time?.substring(0, 8) || '',
            resolveStationHeader(reportData?.observatoryNumber, reportData?.ob1),
            resolveStationHeader(reportData?.observatoryNumber2, reportData?.ob2)
        ].filter(Boolean).join(' ')
        : '';
    if (loading) {
        return <AstronomyLoader />;
    }

    return (
        <Container>

            <Row className="mb-4">

                <div className="p-4">

                    <Row className="justify-content-between align-items-center">
                        <Col xs="auto">
                            {reportData && (
                                <>
                                    <h1>{eventTitle}</h1>
                                </>
                            )}
                        </Col>

                    </Row>

                    <Tabs
                        activeKey={activeTab}
                        onSelect={handleTabSelect} // Usa la nueva función para manejar la selección
                        className="mb-3"
                        mountOnEnter
                        unmountOnExit

                    >

                        {/* <Tab eventKey="SUMMARY_TAB" title={t('REPORT.SUMMARY_TAB')}>
                            <SummaryReport
                                data={reportData}
                                observatory={observatoryData}
                                orbitalElement={orbitalData}
                                reportGemini={reportGemini}
                                setReportGemini={setReportGemini}
                                onGeneratingStart={() => setGeneratingGemini(true)}
                                onGeneratingEnd={() => setGeneratingGemini(false)}
                            />
                        </Tab> */}
                        <Tab eventKey="RADIANT" title={t('REPORT.INFERRED_DATA_TAB')}>

                            <InferredDataReport data={reportData} />
                            {/* <VideoReport nombreCamara={observatoryName} report={reportData} /> */}
                        </Tab>

                        <Tab eventKey="ACTIVE_RAIN_TAB" title={t('REPORT.ACTIVE_RAIN_TAB')}>

                            <ActiveRain activeShowerData={activeShowerData} reportType={'1'} AIUShowerData={AIUShowerData} />
                        </Tab>

                        {orbitalData.length > 0 && (
                            <Tab eventKey="ORBIT" title={t('REPORT.TRAJECTORY')}>

                                <OrbitReport orbit={orbitalData} observatory={observatoryData[0]} reportDate={formatDate(reportData.date)} />
                            </Tab>
                        )}
                        <Tab eventKey="PENDING_TAB" title={t('REPORT.PENDING.TITLE')}>

                            <PendingReport
                                reportData={reportData}
                                observatory={observatoryData}
                                slopeMapData={slopeMapData}
                                trajectoryData={trajectoryData}
                                regressionTrajectory={regressionTrajectory}
                                parametricEquation={parametricEquation}
                            />
                            <RotationReport data={reportData} />
                        </Tab>

                        <Tab eventKey="FRAMES" title={t('REPORT.ZWO')}>

                            <PointAdjustReport regressionTrajectory={regressionTrajectory} trajectoryData={trajectoryData} />
                        </Tab>

                        <Tab eventKey="SONIFICATION" title={t('REPORT.SONIFICATION.TAB_TITLE')}>
                            <SonificationReport report={reportData} />
                        </Tab>


                        {Array.isArray(photometryData) && photometryData.length > 0 && (
                            <Tab eventKey="PHOTOMETRY" title={t('REPORT.PHOTOMETRY.TITLE')}>

                                <PhotometryReport photometryData={photometryData} isChild={true} />
                            </Tab>
                        )}

                        {isNotQRUser(rol) && (
                            <Tab eventKey="RESOURCES" title={t('REPORT.ASSOCIATED_DOWNLOAD_LINK.TITLE')}>

                                <AssociatedDownloadReport report={reportData} />
                            </Tab>
                        )}

                        <Tab eventKey="MEDIA_TAB" title={t('REPORT.MEDIA_TAB')}>
                            <MediaReport reportId={id} />
                        </Tab>

                        <Tab eventKey="OTHER_REPORTS" title={t('REPORT.RELATED_REPORTS.TAB_TITLE')}>
                            <RelatedReportsTab reportId={id} meteorId={reportData?.meteorId} currentReportType="REPORT_Z" />
                        </Tab>

                         
                    </Tabs>

                </div>
            </Row>
            {generatingGemini && <GeminiSpinnerOverlay />}

        </Container>
    );
};

export default Report;
