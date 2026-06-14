import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import truncateDecimal from '@/pipe/truncateDecimal';
import MultiMarkerMapChart from '@/components/map/MultiMarkerMapChart';
import CompleteTrajectoryView3D from '@/components/three/CompleteTrajectoryView3D';
import SpainBolidePlane3D from '@/components/three/SpainBolidePlane3D';
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

function extractNumbers(value) {
  if (!value) return [];
  return String(value).match(/[+-]?\d+(?:[.,]\d+)?/g)?.map(item => Number(item.replace(',', '.'))) || [];
}

function formatVector(value, decimals) {
  const numbers = Array.isArray(value) ? value : extractNumbers(value);
  if (!numbers.length) return '-';
  return numbers.map(item => Number.isFinite(item) ? item.toFixed(decimals) : '-').join(' ');
}

function formatMotionEquation(value) {
  const [a, b, c] = extractNumbers(value);
  const parts = [];
  if (Number.isFinite(a)) parts.push(`a = ${a.toFixed(6)}`);
  if (Number.isFinite(b)) parts.push(`b = ${b.toFixed(6)}`);
  if (Number.isFinite(c)) parts.push(`c = ${c.toFixed(6)}`);
  return parts.length ? parts.join(', ') : '-';
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

const PendingReport = ({ reportData, observatory, slopeMapData, trajectoryData, regressionTrajectory, parametricEquation }) => {
  const { t } = useTranslation(['text']);

  if (!reportData) {
    return <ReportEmptyState message={t('REPORT.PENDING.NO_DATA')} />;
  }

  const predictedImpact = reportData.predictedImpact
    ? formatCoordinate(reportData.predictedImpact)
    : '-';

  const station1Metrics = [
    { label: t('REPORT.PENDING.START_COORDINATES'), value: formatCoordinate(reportData.trajectoryStartStation1) },
    { label: t('REPORT.PENDING.INITIAL_DISTANCE'), value: formatMetric(reportData.trajectoryStartStation1?.distance, 'Km') },
    { label: t('REPORT.PENDING.INITIAL_HEIGHT'), value: formatMetric(reportData.trajectoryStartStation1?.height, 'Km') },
    { label: t('REPORT.PENDING.END_COORDINATES'), value: formatCoordinate(reportData.trajectoryEndStation1) },
    { label: t('REPORT.PENDING.FINAL_DISTANCE'), value: formatMetric(reportData.trajectoryEndStation1?.distance, 'Km') },
    { label: t('REPORT.PENDING.FINAL_HEIGHT'), value: formatMetric(reportData.trajectoryEndStation1?.height, 'Km') }
  ];

  const station2Metrics = [
    { label: t('REPORT.PENDING.START_COORDINATES'), value: formatCoordinate(reportData.trajectoryStartStation2) },
    { label: t('REPORT.PENDING.INITIAL_DISTANCE'), value: formatMetric(reportData.trajectoryStartStation2?.distance, 'Km') },
    { label: t('REPORT.PENDING.INITIAL_HEIGHT'), value: formatMetric(reportData.trajectoryStartStation2?.height, 'Km') },
    { label: t('REPORT.PENDING.END_COORDINATES'), value: formatCoordinate(reportData.trajectoryEndStation2) },
    { label: t('REPORT.PENDING.FINAL_DISTANCE'), value: formatMetric(reportData.trajectoryEndStation2?.distance, 'Km') },
    { label: t('REPORT.PENDING.FINAL_HEIGHT'), value: formatMetric(reportData.trajectoryEndStation2?.height, 'Km') }
  ];

  const summaryMetrics = [
    {
      label: t('REPORT.PENDING.AVERAGE_VELOCITY'),
      value: formatMetric(reportData.averageVelocity, 'Km/s')
    },
    {
      label: t('REPORT.PENDING.INITIAL_VELOCITY', { id: '2' }),
      value: formatMetric(reportData.initialVelocityStation2, 'Km/s')
    },
    {
      label: t('REPORT.PENDING.ACCELERATION'),
      value: formatMetric(reportData.accelerationKms, 'Km/s²')
    },
    {
      label: `${t('REPORT.PENDING.DISTANCE_TRAVELLED', { id: '1' })}`,
      value: formatMetric(reportData.distanceTraveledStation1, 'Km')
    },
    {
      label: `${t('REPORT.PENDING.DISTANCE_TRAVELLED', { id: '2' })}`,
      value: formatMetric(reportData.distanceTraveledStation2, 'Km')
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
      label: 'Intersección con la Tierra (Lat. y long.)',
      value: predictedImpact
    },
    {
      label: t('INFERRED_DATA.DIHEDRAL_ANGLE_BTW_PLANES.label'),
      value: formatMetric(reportData.trajectoryPlanesDihedralAngle, '°')
    },
    {
      label: 'Fotogramas usados para trayectoria',
      value: String(reportData.usedFrames ?? (Array.isArray(trajectoryData) ? trajectoryData.length : 0))
    },
    {
      label: 'Fotogramas usados para velocidad',
      value: Array.isArray(regressionTrajectory) ? String(regressionTrajectory.length) : '0'
    }
  ];

  const equationMetrics = [
    {
      label: 'Vector de posición del inicio (Km)',
      value: formatVector(parametricEquation?.Inicio_Estacion_1, 3)
    },
    {
      label: 'Vector dirección del radiante',
      value: formatVector([parametricEquation?.a, parametricEquation?.b, parametricEquation?.c], 6)
    },
    {
      label: 'Ecuación del movimiento (e=at²+bt+c)',
      value: formatMotionEquation(reportData.motionEquationKms)
    },
    {
      label: t('REPORT.PENDING.ACCELERATION'),
      value: formatMetric(reportData.accelerationKms, 'Km/s²')
    }
  ];

  return (
    <Container fluid className="px-0">
      <Row className="g-4">
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
            title="Características de la trayectoria"
            accent="warm"
          >
            <ReportMetricsGrid>
              {summaryMetrics.map(metric => (
                <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </ReportMetricsGrid>
          </ReportPanel>
        </Col>

        <Col xs={12}>
          <ReportPanel
            title="Ecuación de la trayectoria"
            description="Ajuste a un polinomio de segundo grado."
          >
            <ReportMetricsGrid>
              {equationMetrics.map(metric => (
                <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </ReportMetricsGrid>
          </ReportPanel>
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
            title="Trayectoria 3D"
            description="Arrastre para rotar, use la rueda para acercar o alejar y click derecho para desplazar la vista."
            accent="warm"
          >
            <CompleteTrajectoryView3D
              reportData={reportData}
              trajectoryData={trajectoryData}
              regressionTrajectory={regressionTrajectory}
              observatory={observatory}
            />
          </ReportPanel>
        </Col>

        <Col xs={12}>
          <ReportPanel
            title="Trayectoria 3D y proyección"
            description="Arrastre para rotar, use la rueda para acercar o alejar y click derecho para desplazar la vista."
            accent="cool"
          >
            <SpainBolidePlane3D
              reportData={reportData}
              trajectoryData={trajectoryData}
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
  regressionTrajectory: PropTypes.arrayOf(PropTypes.object),
  parametricEquation: PropTypes.object
};

PendingReport.defaultProps = {
  reportData: null,
  observatory: [],
  slopeMapData: [],
  trajectoryData: [],
  regressionTrajectory: [],
  parametricEquation: null
};

export default PendingReport;
