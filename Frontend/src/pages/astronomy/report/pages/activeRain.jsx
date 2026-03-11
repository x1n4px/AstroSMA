import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatDate } from '@/pipe/formatDate.jsx';
import { useTranslation } from 'react-i18next';
import truncateDecimal from '@/pipe/truncateDecimal';
import formatShowerState from '@/pipe/formatShowerState';
import { useLogicDistance } from '@/pipe/useLogicDistance';
import { convertDistanceToMembershipValue } from '@/pipe/converDistanceToMembershipValue';
import {
  ReportPanel,
  ReportMetricCard,
  ReportMetricsGrid,
  ReportTableShell,
  ReportEmptyState
} from '@/pages/astronomy/report/components/ReportSurface.jsx';

const showerCode = {
  CAP: 'Alpha-Capricornids',
  ETA: 'Eta-Aquariids',
  GEM: 'Geminids',
  LEO: 'Leonids',
  LYR: 'Lyrids',
  NTA: 'Northern-Taurids',
  ORI: 'Orionids',
  PER: 'Perseids',
  QUA1: 'Quadrantids',
  QUA2: 'Quadrantids',
  QUA: 'Quadrantids',
  SDA: 'Southern-Delta-Aquariids',
  STA: 'Southern-Taurids',
  URS: 'Ursids'
};

function ShowerTable({ children }) {
  return (
    <ReportTableShell>
      <Table hover responsive className="mb-0 align-middle">
        {children}
      </Table>
    </ReportTableShell>
  );
}

ShowerTable.propTypes = {
  children: PropTypes.node.isRequired
};

const ActiveRain = ({ activeShowerData, reportType, AIUShowerData }) => {
  const { t } = useTranslation(['text']);
  const [selectedShower, setSelectedShower] = useState(null);
  const { getDistanceLabel } = useLogicDistance();

  const hasValidShowers = useMemo(() => {
    if (!activeShowerData || activeShowerData.length === 0) {
      return false;
    }

    return activeShowerData.some(shower => shower.src || showerCode[shower.Identificador] || showerCode[shower.Code]);
  }, [activeShowerData]);

  const summaryMetrics = [
    { label: 'Lluvias IMO', value: activeShowerData.length },
    { label: 'Lluvias IAU', value: AIUShowerData.length },
    { label: 'Tipo de informe', value: reportType === '1' ? 'Informe Z' : 'Informe radiante' },
    { label: 'Representacion activa', value: selectedShower ? (selectedShower.Nombre || selectedShower.ShowerNameDesignation || selectedShower.Identificador || selectedShower.Code) : 'Ninguna' }
  ];

  return (
    <Container fluid className="px-0">
      <Row className="g-4">
        <Col xs={12}>
          <ReportPanel
            title="Resumen de lluvias activas"
            description="Coincidencias IMO e IAU asociadas al evento actual con el mismo lenguaje visual del resto del informe."
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
          <ReportPanel title={t('REPORT.ACTIVE_RAIN.IMO_TITLE')} description="Coincidencias de lluvias activas detectadas desde la capa IMO.">
            {reportType === '1' ? (
              <ShowerTable>
                <thead>
                  <tr>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.ID')}</th>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.NAME')}</th>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.START_DATE')}</th>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.END_DATE')}</th>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.MINIMUM_DISTANCE', { it: '' })}</th>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.MEMBERSHIP_VALUE')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {activeShowerData.length > 0 ? (
                    activeShowerData.map((shower, index) => (
                      <tr key={`${shower.Identificador}-${index}`}>
                        <td>{shower.Identificador}</td>
                        <td>
                          <Link to={`/shower-info/${shower.Identificador}`} target="_blank" rel="noopener noreferrer">
                            {shower.Nombre}
                          </Link>
                        </td>
                        <td>{formatDate(shower.Fecha_Inicio)}</td>
                        <td>{formatDate(shower.Fecha_Fin)}</td>
                        <td>{truncateDecimal(shower.Distancia_mínima_entre_radianes_y_trayectoria)}</td>
                        <td>{getDistanceLabel(shower.membership)}</td>
                        <td>
                          {showerCode[shower.Identificador] ? (
                            <Button
                              style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                              onClick={() => setSelectedShower({ ...shower, src: showerCode[shower.Identificador] })}
                              size="sm"
                            >
                              {t('REPORT.ACTIVE_RAIN.TABLE.SHOW_BUTTON')}
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        {hasValidShowers ? t('REPORT.ACTIVE_RAIN.NO_ACTIVE_RAIN') : t('REPORT.ACTIVE_RAIN.NO_SHOWERS_AVAILABLE')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </ShowerTable>
            ) : (
              <ShowerTable>
                <thead>
                  <tr>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.ID')}</th>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.NAME')}</th>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.MINIMUM_DISTANCE', { it: '(Ra of date)' })}</th>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.MINIMUM_DISTANCE', { it: '(De of date)' })}</th>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.MINIMUM_DISTANCE', { it: '(Closer Ra)' })}</th>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.MINIMUM_DISTANCE', { it: '(Close De)' })}</th>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.DISTANCE')}</th>
                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.MEMBERSHIP_VALUE')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {activeShowerData.length > 0 ? (
                    activeShowerData.map((shower, index) => (
                      <tr key={`${shower.Lluvia_Identificador}-${index}`}>
                        <td>{shower.Lluvia_Identificador}</td>
                        <td>
                          <Link to={`/shower-info/${shower.Identificador}`} target="_blank" rel="noopener noreferrer">
                            {shower.Nombre}
                          </Link>
                        </td>
                        <td>{shower.Ar_de_la_fecha}</td>
                        <td>{shower.De_de_la_fecha}</td>
                        <td>{shower.Ar_más_cercano}</td>
                        <td>{shower.De_más_cercano}</td>
                        <td>{shower.Distancia}</td>
                        <td>{getDistanceLabel(convertDistanceToMembershipValue(shower.Distancia))}</td>
                        <td>
                          {showerCode[shower.Identificador] ? (
                            <Button
                              style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                              onClick={() => setSelectedShower({ ...shower, src: showerCode[shower.Identificador] })}
                              size="sm"
                            >
                              {t('REPORT.ACTIVE_RAIN.TABLE.SHOW_BUTTON')}
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">
                        {hasValidShowers ? t('REPORT.ACTIVE_RAIN.NO_ACTIVE_RAIN') : t('REPORT.ACTIVE_RAIN.NO_SHOWERS_AVAILABLE')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </ShowerTable>
            )}
          </ReportPanel>
        </Col>

        {reportType === '1' ? (
          <Col xs={12}>
            <ReportPanel title={t('REPORT.ACTIVE_RAIN.AIU_TITLE')} description="Coincidencias complementarias procedentes del catalogo IAU.">
              {AIUShowerData.length > 0 ? (
                <ShowerTable>
                  <thead>
                    <tr>
                      <th>{t('REPORT.ACTIVE_RAIN.TABLE.ID')}</th>
                      <th>{t('REPORT.ACTIVE_RAIN.TABLE.NAME')}</th>
                      <th>{t('REPORT.ACTIVE_RAIN.TABLE.STATUS')}</th>
                      <th>{t('REPORT.ACTIVE_RAIN.TABLE.DATE')}</th>
                      <th>{t('REPORT.ACTIVE_RAIN.TABLE.MINIMUM_DISTANCE', { it: '' })}</th>
                      <th>{t('REPORT.ACTIVE_RAIN.TABLE.MEMBERSHIP_VALUE')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {AIUShowerData.map((shower, index) => (
                      <tr key={`${shower.Code}-${index}`}>
                        <td>{shower.Code}</td>
                        <td>
                          {shower.Status !== 1 ? (
                            shower.ShowerNameDesignation
                          ) : (
                            <Link to={`/shower-info/${shower.Code}`} target="_blank" rel="noopener noreferrer">
                              {shower.ShowerNameDesignation}
                            </Link>
                          )}
                        </td>
                        <td>{formatShowerState(shower.Status, t)}</td>
                        <td>{formatDate(shower.SubDate)}</td>
                        <td>{shower.Distancia_mínima_entre_radianes_y_trayectoria}</td>
                        <td>{getDistanceLabel(shower.membership)}</td>
                        <td>
                          {showerCode[shower.Code] ? (
                            <Button
                              style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                              onClick={() => setSelectedShower({ ...shower, src: showerCode[shower.Code] })}
                              size="sm"
                            >
                              {t('REPORT.ACTIVE_RAIN.TABLE.SHOW_BUTTON')}
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </ShowerTable>
              ) : (
                <ReportEmptyState message={t('REPORT.ACTIVE_RAIN.NO_ACTIVE_RAIN')} />
              )}
            </ReportPanel>
          </Col>
        ) : null}

        {selectedShower?.src ? (
          <Col xs={12}>
            <ReportPanel
              title={`${t('REPORT.ACTIVE_RAIN.REPRESENTATION.TITLE')} ${selectedShower.Lluvia_Identificador || selectedShower.Code || ''} - ${selectedShower.Nombre || selectedShower.ShowerNameDesignation || ''}`}
              description="Representacion externa de la lluvia seleccionada para revisar contexto orbital y posicion relativa."
              accent="cool"
            >
              <div style={{ height: '800px', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e5ebf3', backgroundColor: '#ffffff' }}>
                <iframe
                  src={`https://www.meteorshowers.org/view/${selectedShower.src}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title={`Informacion de la lluvia de meteoros ${selectedShower.Lluvia_Identificador || selectedShower.Code}`}
                ></iframe>
              </div>
              <small style={{ display: 'block', marginTop: '0.85rem', color: '#64748b' }}>
                {t('REPORT.ACTIVE_RAIN.REPRESENTATION.CREDITS.PART1')} <a href="https://en.wikipedia.org/wiki/Peter_Jenniskens">Peter Jenniskens</a>, {t('REPORT.ACTIVE_RAIN.REPRESENTATION.CREDITS.PART2')} <a href="https://www.ianww.com/">Ian Webster</a>
              </small>
              <div className="mt-3">
                <Button variant="secondary" onClick={() => setSelectedShower(null)}>
                  {t('REPORT.ACTIVE_RAIN.REPRESENTATION.HIDDEN_BTN')}
                </Button>
              </div>
            </ReportPanel>
          </Col>
        ) : null}
      </Row>
    </Container>
  );
};

ActiveRain.propTypes = {
  activeShowerData: PropTypes.arrayOf(PropTypes.object),
  reportType: PropTypes.string,
  AIUShowerData: PropTypes.arrayOf(PropTypes.object)
};

ActiveRain.defaultProps = {
  activeShowerData: [],
  reportType: '1',
  AIUShowerData: []
};

export default ActiveRain;
