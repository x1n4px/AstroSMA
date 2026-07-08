import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import FormatDate from '@/pipe/formatDate.jsx';
import {
  ReportPanel,
  ReportMetricCard,
  ReportMetricsGrid,
  ReportEmptyState
} from '@/pages/astronomy/report/components/ReportSurface.jsx';

function getDecimalCoordinates(value) {
  if (!value) {
    return '';
  }

  const parts = value.trim().split(' ');
  if (parts.length < 4) {
    return '';
  }

  return `${parts[2]} ${parts[3]}`;
}

function extractNumbers(value) {
  if (!value) return [];
  return String(value).match(/[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?/g)?.map(item => Number(item.replace(',', '.'))) || [];
}

function formatNumber(value, decimals = 4) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(decimals) : '-';
}

function formatDegrees(value, suffix) {
  return `${formatNumber(value, 4)} ${suffix}`;
}

function radiansToDegrees(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric * 180 / Math.PI : NaN;
}

function InferredDataReport({ data }) {
  const { t, i18n } = useTranslation(['text']);
  const angleSuffix = i18n.language?.startsWith('en') ? 'deg' : '°';

  if (!data) {
    return <ReportEmptyState message="No hay datos del informe." />;
  }

  const radiantCoordinates = extractNumbers(getDecimalCoordinates(data.radiantJ2000Coordinates));
  const radiantErrors = extractNumbers(data.radiantRaDeErrors);

  const summaryMetrics = [
    { label: t('INFERRED_DATA.DATE.label'), value: FormatDate(data.date) },
    { label: t('INFERRED_DATA.HOUR.label'), value: data.time?.substring(0, 8) || '-' },
    { label: t('INFERRED_DATA.AZIMUTH.label'), value: formatDegrees(data.azimuth, angleSuffix) },
    { label: t('INFERRED_DATA.ZENITHAL_DISTANCE.label'), value: formatDegrees(data.zenithDistance, angleSuffix) },
    { label: 'Ascensión recta', value: formatDegrees(radiantCoordinates[0], angleSuffix) },
    { label: 'Declinación', value: formatDegrees(radiantCoordinates[1], angleSuffix) },
    { label: 'Error ascensión recta', value: formatDegrees(radiansToDegrees(radiantErrors[0]), angleSuffix) },
    { label: 'Error declinación', value: formatDegrees(radiansToDegrees(radiantErrors[1]), angleSuffix) }
  ];

  return (
    <Container fluid className="px-0">
      <Row className="g-4">
        <Col xs={12}>
          <ReportPanel
            title="Resumen"
            description="Coordenadas altacimutales y ecuatoriales a J2000 del radiante aparente."
            accent="warm"
          >
            <ReportMetricsGrid>
              {summaryMetrics.map(metric => (
                <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </ReportMetricsGrid>
          </ReportPanel>
        </Col>

      </Row>
    </Container>
  );
}

InferredDataReport.propTypes = {
  data: PropTypes.object
};

InferredDataReport.defaultProps = {
  data: null
};

export default InferredDataReport;
