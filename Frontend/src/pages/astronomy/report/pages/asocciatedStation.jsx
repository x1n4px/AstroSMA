import React from 'react';
import PropTypes from 'prop-types';
import StationMapChart from '@/components/map/StationMapChart';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import {
    ReportPanel,
    ReportMetricCard,
    ReportMetricsGrid,
    ReportEmptyState
} from '@/pages/astronomy/report/components/ReportSurface.jsx';


const AssociatedStation = ({ reportId, observatories }) => {
    const { t } = useTranslation(['text']);

    if (!Array.isArray(observatories) || observatories.length < 2) {
        return <ReportEmptyState message="No hay estaciones asociadas suficientes para mostrar esta seccion." />;
    }

    const station1 = observatories[0] || {};
    const station2 = observatories[1] || {};
    const station1Id = station1.id ?? station1.Numero ?? station1.numero ?? 1;
    const station2Id = station2.id ?? station2.Numero ?? station2.numero ?? 2;

    const station1Metrics = [
        { label: t('REPORT.ASSOCIATED_STATIONS.STATION_LONGITUDE'), value: station1.longitude ?? station1.Longitud ?? '-' },
        { label: t('REPORT.ASSOCIATED_STATIONS.STATION_LATITUDE'), value: station1.latitude ?? station1.Latitud ?? '-' },
        { label: 'Xi', value: 0 },
        { label: 'Eta', value: 0 },
        { label: 'Zeta', value: 0 }
    ];

    const station2Metrics = [
        { label: t('REPORT.ASSOCIATED_STATIONS.STATION_LONGITUDE'), value: station2.longitude ?? station2.Longitud ?? '-' },
        { label: t('REPORT.ASSOCIATED_STATIONS.STATION_LATITUDE'), value: station2.latitude ?? station2.Latitud ?? '-' },
        { label: 'Xi', value: 0 },
        { label: 'Eta', value: 0 },
        { label: 'Zeta', value: 0 }
    ];

    return (
        <Container fluid className="px-0">
            <Row className="g-4">
                <Col xs={12} lg={6}>
                    <ReportPanel title={t('REPORT.ASSOCIATED_STATIONS.STATION_TITLE', { id: station1Id })}>
                        <ReportMetricsGrid>
                            {station1Metrics.map(metric => (
                                <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
                            ))}
                        </ReportMetricsGrid>
                    </ReportPanel>
                </Col>

                <Col xs={12} lg={6}>
                    <ReportPanel title={t('REPORT.ASSOCIATED_STATIONS.STATION_TITLE', { id: station2Id })}>
                        <ReportMetricsGrid>
                            {station2Metrics.map(metric => (
                                <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
                            ))}
                        </ReportMetricsGrid>
                    </ReportPanel>
                </Col>

                <Col xs={12}>
                    <ReportPanel title={t('REPORT.ASSOCIATED_STATIONS.CUADRATURA_ERROR')}>
                        <ReportMetricsGrid>
                            <ReportMetricCard label={t('REPORT.ASSOCIATED_STATIONS.CUADRATURA_ERROR')} value={0} />
                            {reportId ? <ReportMetricCard label="Informe" value={reportId} /> : null}
                        </ReportMetricsGrid>
                    </ReportPanel>
                </Col>

                <Col xs={12}>
                    <ReportPanel title="Mapa de estaciones asociadas" description="Distribucion geoespacial de las estaciones usadas en el informe." accent="cool">
                        <div style={{ width: '100%', minHeight: '36rem', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e5ebf3' }}>
                            <StationMapChart data={observatories} useStatinIcon={true} zoom={6} activePopUp={true} />
                        </div>
                    </ReportPanel>
                </Col>
            </Row>
        </Container>
    );
};

AssociatedStation.propTypes = {
    reportId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    observatories: PropTypes.arrayOf(PropTypes.object)
};

AssociatedStation.defaultProps = {
    reportId: '',
    observatories: []
};

export default AssociatedStation;
