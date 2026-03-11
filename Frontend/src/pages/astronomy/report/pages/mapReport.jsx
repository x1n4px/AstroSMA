import React from 'react';
import PropTypes from 'prop-types';
import ReportMapChart from '@/components/map/ReportMap';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import {
    ReportPanel,
    ReportMetricCard,
    ReportMetricsGrid,
    ReportEmptyState
} from '@/pages/astronomy/report/components/ReportSurface.jsx';

function resolveStationLabel(station, fallbackIndex) {
    return station?.id ?? station?.Numero ?? station?.numero ?? fallbackIndex;
}

function MapReport({ report, observatory }) {
    const { t } = useTranslation(['text']);

    if (!Array.isArray(observatory) || observatory.length < 2) {
        return <ReportEmptyState message="No hay observatorios suficientes para el mapa del informe." />;
    }

    const station1 = observatory[0] || {};
    const station2 = observatory[1] || {};

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
                    <ReportPanel title={t('REPORT.ASSOCIATED_STATIONS.STATION_TITLE', { id: resolveStationLabel(station1, 1) })}>
                        <ReportMetricsGrid>
                            {station1Metrics.map(metric => (
                                <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
                            ))}
                        </ReportMetricsGrid>
                    </ReportPanel>
                </Col>

                <Col xs={12} lg={6}>
                    <ReportPanel title={t('REPORT.ASSOCIATED_STATIONS.STATION_TITLE', { id: resolveStationLabel(station2, 2) })}>
                        <ReportMetricsGrid>
                            {station2Metrics.map(metric => (
                                <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
                            ))}
                        </ReportMetricsGrid>
                    </ReportPanel>
                </Col>

                <Col xs={12}>
                    <ReportPanel title={t('REPORT.ASSOCIATED_STATIONS.CUADRATURA_ERROR')} description="Error de cuadratura asociado al par de estaciones.">
                        <ReportMetricsGrid>
                            <ReportMetricCard label={t('REPORT.ASSOCIATED_STATIONS.CUADRATURA_ERROR')} value={0} />
                        </ReportMetricsGrid>
                    </ReportPanel>
                </Col>

                <Col xs={12}>
                    <ReportPanel title="Mapa de estaciones" description="Visualizacion espacial de las estaciones asociadas al informe." accent="cool">
                        {report ? (
                            <div style={{ width: '100%', minHeight: '36rem', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e5ebf3' }}>
                                <ReportMapChart lat={report.latitude} lon={report.longitude} observatory={observatory} zoom={7} />
                            </div>
                        ) : (
                            <ReportEmptyState message="No hay coordenadas del informe para mostrar el mapa." />
                        )}
                    </ReportPanel>
                </Col>
            </Row>
        </Container>
    );
}

MapReport.propTypes = {
    report: PropTypes.object,
    observatory: PropTypes.arrayOf(PropTypes.object)
};

MapReport.defaultProps = {
    report: null,
    observatory: []
};

export default MapReport;
