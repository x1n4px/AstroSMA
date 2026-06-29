import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import OrbitalView3D from '@/components/three/OrbitalView3D';
import {
  ReportPanel,
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

function formatValue(value, unit = '') {
  const text = firstToken(value);
  return unit ? `${text} ${unit}` : text;
}

function resolveOrbitOption(item, index, isEnglish) {
  const raw = String(item?.Calculados_con || '').toLowerCase();
  if (raw.includes('media') || index === 1) {
    return isEnglish ? 'Mean velocity' : 'Velocidad media';
  }
  if (raw.includes('aceler') || index === 0) {
    return isEnglish
      ? 'Velocity fitted to uniformly accelerated motion'
      : 'Velocidad ajustada a movimiento uniformemente acelerado';
  }
  return item?.Calculados_con || (isEnglish ? `Orbital solution ${index + 1}` : `Solución orbital ${index + 1}`);
}

const OrbitReport = ({ orbit, reportDate }) => {
  const { t, i18n } = useTranslation(['text']);
  const [selectedOrbitIndex, setSelectedOrbitIndex] = useState(0);
  const isEnglish = i18n.language?.startsWith('en');

  useEffect(() => {
    if (orbit && orbit.length === 1) {
      setSelectedOrbitIndex(0);
    }
  }, [orbit]);

  const selectedOrbit = orbit?.[selectedOrbitIndex];

  const orbitalMetrics = useMemo(() => {
    if (!selectedOrbit) {
      return [];
    }

    return [
      { label: isEnglish ? 'Velocity at infinity' : 'Velocidad en el infinito', value: formatValue(selectedOrbit.Vel__Inf, 'Km/s') },
      { label: isEnglish ? 'Geocentric velocity' : 'Velocidad geocéntrica', value: formatValue(selectedOrbit.Vel__Geo, 'Km/s') },
      { label: isEnglish ? 'Geocentric radiant right ascension J2000' : 'Ascensión recta geocéntrica del radiante a J2000', value: formatValue(selectedOrbit.Ar, '°') },
      { label: isEnglish ? 'Geocentric radiant declination J2000' : 'Declinación geocéntrica del radiante a J2000', value: formatValue(selectedOrbit.De, '°') },
      { label: 'a', value: formatValue(selectedOrbit.a, 'UA') },
      { label: 'e', value: firstToken(selectedOrbit.e) },
      { label: 'i', value: formatValue(selectedOrbit.i, '°') },
      { label: isEnglish ? 'ω at date' : 'ω a la fecha', value: formatValue(selectedOrbit.omega, '°') },
      { label: isEnglish ? 'Ω at J2000' : 'Ω a J2000', value: formatValue(twoDecimals(selectedOrbit.Omega_grados_votos_max_min), '°') },
      { label: 'p', value: formatValue(twoDecimals(selectedOrbit.p), 'UA') },
      { label: 'q', value: formatValue(selectedOrbit.q, 'UA') },
      { label: 'T', value: firstToken(selectedOrbit.T) }
    ];
  }, [selectedOrbit, isEnglish]);

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
            <ReportPanel title="Selección orbital" description="Elija la solución orbital que quiere inspeccionar.">
              <ReportSelectField
                label={t('ORBIT_REPORT.SELECT_OPT.LABEL')}
                value={selectedOrbitIndex}
                onChange={(event) => setSelectedOrbitIndex(Number.parseInt(event.target.value, 10))}
              >
                {orbit.map((item, index) => (
                  <option key={`${item.date}-${item.time}-${index}`} value={index}>
                    {resolveOrbitOption(item, index, isEnglish)}
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
                title="Elementos orbitales"
                description={reportDate ? `Solución orbital para el informe del ${reportDate}.` : ''}
                accent="warm"
              >
                <ReportMetricsGrid>
                  {orbitalMetrics.map(metric => (
                    <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
                  ))}
                </ReportMetricsGrid>
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
