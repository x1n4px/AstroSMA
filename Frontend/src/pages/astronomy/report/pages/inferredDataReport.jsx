import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import FormatDate from '@/pipe/formatDate.jsx';
import truncateDecimal from '@/pipe/truncateDecimal';
import {
  ReportPanel,
  ReportField,
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

function formatEquationCoefficients(value) {
  if (!value) {
    return '';
  }

  const parts = value.trim().split(' ');
  if (parts.length < 3) {
    return '';
  }

  const [a, b, c] = parts;
  return `a = ${a}, b = ${b}, c = ${c}`;
}

function InferredDataReport({ data }) {
  const { t } = useTranslation(['text']);

  if (!data) {
    return <ReportEmptyState message="No hay datos del informe." />;
  }

  const userRol = localStorage.getItem('rol');
  const isAdmin = userRol === '10000000';

  const summaryMetrics = [
    { label: t('INFERRED_DATA.DATE.label'), value: FormatDate(data.date) },
    { label: t('INFERRED_DATA.HOUR.label'), value: data.time?.substring(0, 8) || '-' },
    { label: t('INFERRED_DATA.AZIMUTH.label'), value: `${truncateDecimal(data.azimuth)} °` },
    { label: t('INFERRED_DATA.ZENITHAL_DISTANCE.label'), value: `${truncateDecimal(data.zenithDistance)} °` },
    { label: t('INFERRED_DATA.STATISTICAL_WEIGHTS.label'), value: truncateDecimal(data.statisticalWeight) },
    { label: t('INFERRED_DATA.DIHEDRAL_ANGLE_BTW_PLANES.label'), value: `${truncateDecimal(data.trajectoryPlanesDihedralAngle)} °` }
  ];

  return (
    <Container fluid className="px-0">
      <Row className="g-4">
        <Col xs={12}>
          <ReportPanel
            title="Resumen inferido"
            description="Parametros geometricos y de calidad del informe organizados con el mismo lenguaje visual que el resto del reporte."
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
          <ReportPanel title="Geometria del evento" description="Magnitudes principales de orientacion y trayectoria.">
            <ReportField label={t('INFERRED_DATA.DATE.label')} value={FormatDate(data.date)} />
            <ReportField label={t('INFERRED_DATA.AZIMUTH.label')} value={truncateDecimal(data.azimuth)} suffix="°" />
            <ReportField label={t('INFERRED_DATA.DIHEDRAL_ANGLE_BTW_PLANES.label')} value={truncateDecimal(data.trajectoryPlanesDihedralAngle)} suffix="°" />
            <ReportField label={t('INFERRED_DATA.ASTRONOMICAL_COORDINATES_OF_THE_RADIANT_ECLIPTIC_OF_THE_DATE.label')} value={getDecimalCoordinates(data.radiantEclipticCoordinatesOfDate)} suffix="°" />
          </ReportPanel>
        </Col>

        <Col xs={12} lg={6}>
          <ReportPanel title="Radiante y calidad" description="Resumen temporal y de consistencia estadistica.">
            <ReportField label={t('INFERRED_DATA.HOUR.label')} value={data.time?.substring(0, 8) || '-'} />
            <ReportField label={t('INFERRED_DATA.ZENITHAL_DISTANCE.label')} value={truncateDecimal(data.zenithDistance)} suffix="°" />
            <ReportField label={t('INFERRED_DATA.STATISTICAL_WEIGHTS.label')} value={truncateDecimal(data.statisticalWeight)} />
            {isAdmin ? (
              <>
                <ReportField label={t('INFERRED_DATA.Errores_AR_RADIANT.label')} value={data.radiantRaDeErrors?.split(' ')[0]} suffix="arcsec" />
                <ReportField label={t('INFERRED_DATA.Errores_DE_RADIANT.label')} value={data.radiantRaDeErrors?.split(' ')[1]} suffix="arcsec" />
                <ReportField label={t('INFERRED_DATA.ORTHOGONALITY_QUADRATIC_ERROR_IN_THE_WEST_SPHERE_1.label')} value={data.celestialSphereOrthogonalityError1} suffix="km²" />
                <ReportField label={t('INFERRED_DATA.ORTHOGONALITY_QUADRATIC_ERROR_IN_THE_WEST_SPHERE_2.label')} value={data.celestialSphereOrthogonalityError2} suffix="km²" />
              </>
            ) : null}
          </ReportPanel>
        </Col>

        {isAdmin ? (
          <Col xs={12} lg={6}>
            <ReportPanel title="Diagnostico tecnico" description="Campos avanzados visibles solo para administracion.">
              <ReportField label={t('INFERRED_DATA.ASTRONOMICAL_COORDINATES_OF_THE_RADIANT_J200.label')} value={data.radiantJ2000Coordinates} suffix="°" />
              <ReportField label={t('INFERRED_DATA.EQUATION_OF_MOVEMENT_IN_GS.label')} value={data.accelerationGs} suffix="m/s²" />
              <ReportField label={t('INFERRED_DATA.REPORT_ROUTE.label')} value={data.reportPath} />
            </ReportPanel>
          </Col>
        ) : null}

        <Col xs={12} lg={isAdmin ? 6 : 12}>
          <ReportPanel title="Ecuacion del movimiento" description="Coeficientes del ajuste cinematico en el sistema de unidades del informe.">
            <ReportField
              label={`${t('INFERRED_DATA.EQUATION_OF_MOTION_IN_KMS.label')} (e = at^2 + bt + c)`}
              value={formatEquationCoefficients(data.Ecuacion_del_movimiento_en_Kms)}
              suffix="Km/s"
            />
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
