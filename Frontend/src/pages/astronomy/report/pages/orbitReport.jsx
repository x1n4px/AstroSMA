import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/pipe/formatDate';
import OrbitalView3D from '@/components/three/OrbitalView3D';
import {
  ReportPanel,
  ReportField,
  ReportMetricCard,
  ReportMetricsGrid,
  ReportSelectField,
  ReportEmptyState
} from '@/pages/astronomy/report/components/ReportSurface.jsx';

function firstToken(value) {
  if (typeof value !== 'string') {
    return value ?? '-';
  }

  return value.split(' ')[0];
}

function toNumber(value) {
  const normalized = firstToken(value);
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function twoDecimals(value) {
  const parsed = toNumber(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : firstToken(value);
}

const OrbitReport = ({ orbit, reportDate }) => {
  const { t } = useTranslation(['text']);
  const [selectedOrbitIndex, setSelectedOrbitIndex] = useState(0);

  useEffect(() => {
    if (orbit && orbit.length === 1) {
      setSelectedOrbitIndex(0);
    }
  }, [orbit]);

  const selectedOrbit = orbit?.[selectedOrbitIndex];

  const summaryMetrics = useMemo(() => {
    if (!selectedOrbit) {
      return [];
    }

    return [
      { label: t('ORBIT_REPORT.DATE.label'), value: formatDate(selectedOrbit.date) },
      { label: t('ORBIT_REPORT.HOUR.label'), value: selectedOrbit.time || '-' },
      { label: t('ORBIT_REPORT.A.label'), value: firstToken(selectedOrbit.a) },
      { label: t('ORBIT_REPORT.E.label'), value: firstToken(selectedOrbit.e) },
      { label: t('ORBIT_REPORT.I.label'), value: firstToken(selectedOrbit.i) },
      { label: t('ORBIT_REPORT.Q.label'), value: firstToken(selectedOrbit.q) }
    ];
  }, [selectedOrbit, t]);

  const canRender3D = useMemo(() => {
    if (!selectedOrbit) {
      return false;
    }

    return (
      toNumber(selectedOrbit.a) > 0
      && toNumber(selectedOrbit.Vel__Inf) > 0
      && toNumber(selectedOrbit.Vel__Geo) > 0
      && toNumber(selectedOrbit.e) >= 0
      && toNumber(selectedOrbit.q) > 0
    );
  }, [selectedOrbit]);

  if (!orbit || orbit.length === 0) {
    return <ReportEmptyState message="No hay elementos orbitales disponibles." />;
  }

  return (
    <Container fluid className="px-0">
      <Row className="g-4">
        {orbit.length > 1 ? (
          <Col xs={12}>
            <ReportPanel title="Seleccion orbital" description="Elige la solucion orbital que quieres inspeccionar.">
              <ReportSelectField
                label={t('ORBIT_REPORT.SELECT_OPT.LABEL')}
                value={selectedOrbitIndex}
                onChange={(event) => setSelectedOrbitIndex(Number.parseInt(event.target.value, 10))}
              >
                {orbit.map((item, index) => (
                  <option key={`${item.date}-${item.time}-${index}`} value={index}>
                    {formatDate(item.date)} - {item.time}
                  </option>
                ))}
              </ReportSelectField>
            </ReportPanel>
          </Col>
        ) : null}

        {selectedOrbit ? (
          <>
            <Col xs={12}>
              <ReportPanel
                title="Resumen orbital"
                description={`Vista sintetica de la solucion orbital${reportDate ? ` para el informe del ${reportDate}` : ''}.`}
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
              <ReportPanel title="Dinamica heliocentrica" description="Velocidades y parametros fisicos principales.">
                <ReportField label={t('ORBIT_REPORT.DATE.label')} value={formatDate(selectedOrbit.date)} />
                <ReportField label={t('ORBIT_REPORT.AR.label')} value={firstToken(selectedOrbit.Ar)} />
                <ReportField label={t('ORBIT_REPORT.VELOCITY_INF.label')} value={firstToken(selectedOrbit.Vel__Inf)} controlClassName={toNumber(selectedOrbit.Vel__Inf) < 0 ? 'border-danger text-danger' : ''} />
                <ReportField label={t('ORBIT_REPORT.VELOCITY_GEOM.label')} value={firstToken(selectedOrbit.Vel__Geo)} controlClassName={toNumber(selectedOrbit.Vel__Geo) < 0 ? 'border-danger text-danger' : ''} />
                <ReportField label={t('ORBIT_REPORT.E.label')} value={firstToken(selectedOrbit.e)} controlClassName={toNumber(selectedOrbit.e) < 0 ? 'border-danger text-danger' : ''} />
                <ReportField label={t('ORBIT_REPORT.Q.label')} value={firstToken(selectedOrbit.q)} controlClassName={toNumber(selectedOrbit.q) <= 0 ? 'border-danger text-danger' : ''} />
                <ReportField label={t('ORBIT_REPORT.OMEGA.label')} value={firstToken(selectedOrbit.omega)} />
              </ReportPanel>
            </Col>

            <Col xs={12} lg={6}>
              <ReportPanel title="Geometria orbital" description="Orientacion espacial y elementos derivados de la orbita.">
                <ReportField label={t('ORBIT_REPORT.HOUR.label')} value={selectedOrbit.time} />
                <ReportField label={t('ORBIT_REPORT.DE.label')} value={firstToken(selectedOrbit.De)} />
                <ReportField label={t('ORBIT_REPORT.I.label')} value={firstToken(selectedOrbit.i)} />
                <ReportField label={t('ORBIT_REPORT.P.label')} value={twoDecimals(selectedOrbit.p)} />
                <ReportField label={t('ORBIT_REPORT.A.label')} value={firstToken(selectedOrbit.a)} controlClassName={toNumber(selectedOrbit.a) < 0 ? 'border-danger text-danger' : ''} />
                <ReportField label={t('ORBIT_REPORT.T.label')} value={firstToken(selectedOrbit.T)} controlClassName={toNumber(selectedOrbit.T) < 0 ? 'border-danger text-danger' : ''} />
                <ReportField label={t('ORBIT_REPORT.OMEGA_DEGREE.label')} value={twoDecimals(selectedOrbit.Omega_grados_votos_max_min)} />
              </ReportPanel>
            </Col>

            <Col xs={12}>
              <ReportPanel
                title="Representacion 3D de la orbita"
                description={canRender3D
                  ? 'Visualizacion espacial de la orbita con referencias fisicas y orbitales.'
                  : 'La visualizacion 3D se oculta porque faltan parametros orbitales validos para reconstruirla correctamente.'}
                accent="cool"
              >
                {canRender3D ? (
                  <OrbitalView3D date={selectedOrbit.date} orbit={selectedOrbit} />
                ) : (
                  <ReportEmptyState message="No hay suficientes parametros orbitales validos para mostrar la orbita en 3D." />
                )}
              </ReportPanel>
            </Col>
          </>
        ) : null}
      </Row>
    </Container>
  );
};

OrbitReport.propTypes = {
  orbit: PropTypes.arrayOf(PropTypes.object),
  reportDate: PropTypes.string
};

OrbitReport.defaultProps = {
  orbit: [],
  reportDate: ''
};

export default OrbitReport;
