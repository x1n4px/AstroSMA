import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import truncateDecimal from '@/pipe/truncateDecimal';
import MultiMarkerMapChart from '@/components/map/MultiMarkerMapChart';
import CompleteTrajectoryView3D from '@/components/three/CompleteTrajectoryView3D';
import {
  ReportPanel,
  ReportMetricCard,
  ReportMetricsGrid,
  ReportEmptyState
} from '@/pages/astronomy/report/components/ReportSurface.jsx';

function formatCoordinate(point) {
  if (
    point?.latitude === undefined
    || point?.latitude === null
    || point?.longitude === undefined
    || point?.longitude === null
  ) {
    return '-';
  }

  return `${point.latitude}, ${point.longitude}`;
}

function formatMetric(value, unit = '', decimalPlaces = 3) {
  const truncated = truncateDecimal(value, decimalPlaces);
  return unit ? `${truncated} ${unit}` : truncated;
}

function getAverage(values) {
  const validValues = values
    .map(value => Number(value))
    .filter(Number.isFinite);

  if (validValues.length === 0) {
    return null;
  }

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function StationMetricsPanel({ title, metrics }) {
  return (
    <ReportPanel title={title} description="Coordenadas, distancias y alturas reconstruidas para la estacion.">
      <ReportMetricsGrid>
        {metrics.map(metric => (
          <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </ReportMetricsGrid>
    </ReportPanel>
  );
}

StationMetricsPanel.propTypes = {
  title: PropTypes.string.isRequired,
  metrics: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired
};

const PendingReport = ({ reportData, observatory, slopeMapData, trajectoryData, regressionTrajectory }) => {
  const { t } = useTranslation(['text']);

  if (!reportData) {
    return <ReportEmptyState message={t('REPORT.PENDING.NO_DATA')} />;
  }

  const station1Distance = Number(reportData.trajectoryStartStation1?.distance) - Number(reportData.trajectoryEndStation1?.distance);
  const station2Distance = Number(reportData.trajectoryStartStation2?.distance) - Number(reportData.trajectoryEndStation2?.distance);
  const visibleStartHeight = getAverage([
    reportData.trajectoryStartStation1?.height,
    reportData.trajectoryStartStation2?.height
  ]);
  const visibleEndHeight = getAverage([
    reportData.trajectoryEndStation1?.height,
    reportData.trajectoryEndStation2?.height
  ]);
  const predictedImpact = reportData.predictedImpact
    ? formatCoordinate(reportData.predictedImpact)
    : '-';

  const station1Metrics = [
    { label: t('REPORT.PENDING.START_COORDINATES'), value: formatCoordinate(reportData.trajectoryStartStation1) },
    { label: t('REPORT.PENDING.END_COORDINATES'), value: formatCoordinate(reportData.trajectoryEndStation1) },
    { label: t('REPORT.PENDING.INITIAL_DISTANCE'), value: formatMetric(reportData.trajectoryStartStation1?.distance, 'Km') },
    { label: t('REPORT.PENDING.FINAL_DISTANCE'), value: formatMetric(reportData.trajectoryEndStation1?.distance, 'Km') },
    { label: t('REPORT.PENDING.INITIAL_HEIGHT'), value: formatMetric(reportData.trajectoryStartStation1?.height, 'Km') },
    { label: t('REPORT.PENDING.FINAL_HEIGHT'), value: formatMetric(reportData.trajectoryEndStation1?.height, 'Km') }
  ];

  const station2Metrics = [
    { label: t('REPORT.PENDING.START_COORDINATES'), value: formatCoordinate(reportData.trajectoryStartStation2) },
    { label: t('REPORT.PENDING.END_COORDINATES'), value: formatCoordinate(reportData.trajectoryEndStation2) },
    { label: t('REPORT.PENDING.INITIAL_DISTANCE'), value: formatMetric(reportData.trajectoryStartStation2?.distance, 'Km') },
    { label: t('REPORT.PENDING.FINAL_DISTANCE'), value: formatMetric(reportData.trajectoryEndStation2?.distance, 'Km') },
    { label: t('REPORT.PENDING.INITIAL_HEIGHT'), value: formatMetric(reportData.trajectoryStartStation2?.height, 'Km') },
    { label: t('REPORT.PENDING.FINAL_HEIGHT'), value: formatMetric(reportData.trajectoryEndStation2?.height, 'Km') }
  ];

  const summaryMetrics = [
    {
      label: 'Inicio visible medio',
      value: visibleStartHeight !== null ? formatMetric(visibleStartHeight, 'Km') : '-'
    },
    {
      label: 'Fin visible medio',
      value: visibleEndHeight !== null ? formatMetric(visibleEndHeight, 'Km') : '-'
    },
    {
      label: t('REPORT.PENDING.AVERAGE_VELOCITY'),
      value: formatMetric(reportData.averageVelocity, 'Km/s')
    },
    {
      label: t('REPORT.PENDING.ACCELERATION'),
      value: formatMetric(reportData.accelerationKms, 'Km/s²')
    },
    {
      label: `${t('REPORT.PENDING.DISTANCE_TRAVELLED', { id: '1' })}`,
      value: formatMetric(station1Distance, 'Km')
    },
    {
      label: `${t('REPORT.PENDING.DISTANCE_TRAVELLED', { id: '2' })}`,
      value: formatMetric(station2Distance, 'Km')
    },
    {
      label: `${t('REPORT.PENDING.TIME_TRAVELLED', { id: '1' })}`,
      value: formatMetric(reportData.timeStation1, 's')
    },
    {
      label: `${t('REPORT.PENDING.TIME_TRAVELLED', { id: '2' })}`,
      value: formatMetric(reportData.trajectoryTimeStation2, 's')
    },
    {
      label: 'Impacto previsto',
      value: predictedImpact
    },
    {
      label: 'Puntos de trayectoria',
      value: Array.isArray(trajectoryData) ? String(trajectoryData.length) : '0'
    },
    {
      label: 'Puntos de regresion',
      value: Array.isArray(regressionTrajectory) ? String(regressionTrajectory.length) : '0'
    }
  ];

  return (
    <Container fluid className="px-0">
      <Row className="g-4">
        <Col xs={12}>
          <ReportPanel
            title="Resumen dinamico"
            description="Sintesis de velocidades, tiempos y parametros globales del tramo atmosferico."
            accent="warm"
          >
            <ReportMetricsGrid>
              {summaryMetrics.map(metric => (
                <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </ReportMetricsGrid>
          </ReportPanel>
        </Col>

        <Col xs={12} lg={6}>
          <StationMetricsPanel
            title={t('REPORT.PENDING.STATION_DETAILS', { id: reportData.ob1 })}
            metrics={station1Metrics}
          />
        </Col>

        <Col xs={12} lg={6}>
          <StationMetricsPanel
            title={t('REPORT.PENDING.STATION_DETAILS', { id: reportData.ob2 })}
            metrics={station2Metrics}
          />
        </Col>

        <Col xs={12}>
          <ReportPanel
            title="Proyeccion en superficie por estacion"
            description="El mapa 2D conserva la lectura por estaciones y sirve como referencia geodesica complementaria al modelo 3D."
          >
            <div style={{ width: '100%', minHeight: '36rem', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e5ebf3' }}>
              <MultiMarkerMapChart
                data={Array.isArray(slopeMapData) ? slopeMapData.map(item => item.MAP_DATA) : []}
                observatory={observatory}
                eminHeight={576}
              />
            </div>
          </ReportPanel>
        </Col>

        <Col xs={12}>
          <ReportPanel
            title="Entrada atmosferica, origen simulado y desaparicion teorica"
            description="Vista global del trayecto completo desde la aproximacion simulada hasta el tramo visible reconstruido."
            accent="warm"
            eyebrow="Trayectoria 3D completa"
          >
            <CompleteTrajectoryView3D
              reportData={reportData}
              trajectoryData={trajectoryData}
              regressionTrajectory={regressionTrajectory}
              observatory={observatory}
            />
          </ReportPanel>
        </Col>
      </Row>
    </Container>
  );
};

PendingReport.propTypes = {
  reportData: PropTypes.object,
  observatory: PropTypes.arrayOf(PropTypes.object),
  slopeMapData: PropTypes.arrayOf(PropTypes.object),
  trajectoryData: PropTypes.arrayOf(PropTypes.object),
  regressionTrajectory: PropTypes.arrayOf(PropTypes.object)
};

PendingReport.defaultProps = {
  reportData: null,
  observatory: [],
  slopeMapData: [],
  trajectoryData: [],
  regressionTrajectory: []
};

export default PendingReport;
