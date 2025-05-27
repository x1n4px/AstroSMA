import React from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import MultiMarkerMapChart from '@/components/map/MultiMarkerMapChart';
import { formatDate } from '@/pipe/formatDate.jsx'
import truncateDecimal from '@/pipe/truncateDecimal';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Calendar, Gauge, RefreshCw } from "lucide-react"


const Map = ({ observatoryData, lastReportMap, lastReportData }) => {
  const { t } = useTranslation(['text']);

  return (
    <div style={{ minHeight: '700px', height: 'auto' }}>
      <Row className="justify-content-center mt-4" >
        {/* Use Col components as direct children of Row for grid layout */}

        {/* First Container (Map) */}
        {/* On mobile (xs), take full width (col-12). On medium screens and up (md), take 7 columns out of 12 (col-md-7 for ~58.3%). */}
        {/* Add margin-bottom on mobile (mb-3) for spacing when stacked */}
        <Col xs={12} md={8} className="mb-3 mb-md-0" style={{ maxHeight: '650px' }}>
          <div
            className="flex-grow-1 position-relative" // Use h-100 to fill the column height
            style={{
              backgroundColor: '#e9ecef',
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            {/* Adjusted positioning and z-index for the subtitle */}
            <div
              className="position-absolute top-0 start-0 w-100 m-0 p-3" // Added padding
              style={{ pointerEvents: 'none', zIndex: 1 }}
            >
              <Card.Subtitle className="text-muted" style={{ color: 'black' }}>
                {t('DASHBOARD.GRAPH.EIGHTH.DESCRIPTION')}
              </Card.Subtitle>
            </div>

            {/* Map component */}
            <div style={{ flex: 1, height: '100%', width: '100%' }}>
              {/* Ensure the map component handles its own responsiveness */}
              <MultiMarkerMapChart
                data={lastReportMap.map(item => item.MAP_DATA)}
                key={`key-a9`}
                observatory={observatoryData}
              />
            </div>
          </div>
        </Col>

        {/* Second Container (Details) - Modernized */}
        {/* On mobile (xs), take full width (col-12). On medium screens and up (md), take 5 columns out of 12 (col-md-5 for ~41.7%). */}
        {/* Add subtle shadow (shadow-sm) */}
        <Col xs={12} md={4} style={{ maxHeight: '600px' }}>
         

          <Card className="shadow-sm h-100 border rounded-4 overflow-hidden" style={{ backgroundColor: '#f8f9fa' }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4">
                <Calendar size={20} className="me-2" style={{ color: "#980100" }} />
                <span className="text-muted">{formatDate(lastReportData?.Fecha)}  {lastReportData?.Hora}</span>
              </div>

              {/* Estación 1 */}
              <div className="mb-4 pb-3" style={{ borderBottom: "1px solid #f0f0f0" }}>
                <h5 className="mb-3" style={{ color: "#980100" }}>
                  {t('HOME.LAST_BOLIDE_DATA.STATION')} 1
                </h5>

                <div className="d-flex align-items-center mb-2">
                  <MapPin size={18} className="me-2" style={{ color: "#980100" }} />
                  <div>
                    <div className="text-muted small">{t('HOME.LAST_BOLIDE_DATA.START')}</div>
                    <div className="fw-light">
                      {lastReportData?.Inicio_de_la_trayectoria_Estacion_1?.latitude}, {lastReportData?.Inicio_de_la_trayectoria_Estacion_1?.longitude}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-2">
                  <Navigation size={18} className="me-2" style={{ color: "#980100" }} />
                  <div>
                    <div className="text-muted small">{t('HOME.LAST_BOLIDE_DATA.END')}</div>
                    <div className="fw-light">
                      {lastReportData?.Fin_de_la_trayectoria_Estacion_1?.latitude}, {lastReportData?.Fin_de_la_trayectoria_Estacion_1?.longitude}
                    </div>
                  </div>
                </div>


              </div>

              {/* Estación 2 */}
              <div className="mb-4">
                <h5 className="mb-3" style={{ color: "#980100" }}>
                  {t('HOME.LAST_BOLIDE_DATA.STATION')} 2
                </h5>

                <div className="d-flex align-items-center mb-2">
                  <MapPin size={18} className="me-2" style={{ color: "#980100" }} />
                  <div>
                    <div className="text-muted small">{t('HOME.LAST_BOLIDE_DATA.START')}</div>
                    <div className="fw-light">
                      {lastReportData?.Inicio_de_la_trayectoria_Estacion_2?.latitude}, {lastReportData?.Inicio_de_la_trayectoria_Estacion_2?.longitude}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-2">
                  <Navigation size={18} className="me-2" style={{ color: "#980100" }} />
                  <div>
                    <div className="text-muted small">{t('HOME.LAST_BOLIDE_DATA.END')}</div>
                    <div className="fw-light">
                      {lastReportData?.Fin_de_la_trayectoria_Estacion_2?.latitude}, {lastReportData?.Fin_de_la_trayectoria_Estacion_2?.longitude}
                    </div>
                  </div>
                </div>

              </div>

              <div className="mb-4">
                <div className="d-flex align-items-center">
                  <Gauge size={18} className="me-2" style={{ color: "#980100" }} />
                  <div>
                    <div className="text-muted small">{t('HOME.LAST_BOLIDE_DATA.VELOCITY')}</div>
                    <div className="fw-light">{truncateDecimal(lastReportData?.Velocidad_media)} km/s</div>
                  </div>
                </div>
              </div>

              {/* Botón de actualizar */}
              <Button as={Link} to={`/report/${lastReportData?.IdInforme}`}
                variant="outline-danger"
                className="w-100 d-flex align-items-center justify-content-center"

                style={{ borderColor: "#980100", color: "#980100", borderRadius: "8px", padding: "10px" }}
              >
                <RefreshCw size={18} className="me-2" />
                {t('HOME.LAST_BOLIDE_DATA.SHOW_BTN')}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Map;