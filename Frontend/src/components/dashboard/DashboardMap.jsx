import React from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import MultiMarkerMapChart from '@/components/map/MultiMarkerMapChart';
import { formatDate } from '@/pipe/formatDate.jsx'
import truncateDecimal from '@/pipe/truncateDecimal';
import { Link } from 'react-router-dom';


const Map = ({ observatoryData, lastReportMap, lastReportData }) => {
  const { t } = useTranslation(['text']);

  return (
    <div style={{ maxHeight: '500px', height: '450px' }}>
      <Row className="justify-content-center mt-4" >
        {/* Use Col components as direct children of Row for grid layout */}

        {/* First Container (Map) */}
        {/* On mobile (xs), take full width (col-12). On medium screens and up (md), take 7 columns out of 12 (col-md-7 for ~58.3%). */}
        {/* Add margin-bottom on mobile (mb-3) for spacing when stacked */}
        <Col xs={12} md={8} className="mb-3 mb-md-0" style={{ maxHeight: '450px' }}>
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
        <Col xs={12} md={4} style={{ maxHeight: '400px' }}>
          <div
            className="p-3 d-flex flex-column justify-content-between h-100 shadow-sm" // Use h-100 to fill the column height
            style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              border: '1px solid #ddd',
              // Spacing handled by Col gutters and internal elements
            }}
          >
            <div>

              <h6 className="text-secondary mb-3 d-flex align-items-center gap-2">
                <span className="fw-bold">{formatDate(lastReportData?.Fecha)}  {lastReportData?.Hora.substring(0, 8)}</span>
              </h6>


              <h6 className="text-secondary mb-3 fw-bold">
                {t('HOME.LAST_BOLIDE_DATA.STATION')} 1
              </h6>

              <p className="mb-2 text-muted" style={{ fontSize: '0.95rem' }}>
                <strong className="text-body">{t('HOME.LAST_BOLIDE_DATA.START_COORDINATES')}:</strong> {lastReportData?.Inicio_de_la_trayectoria_Estacion_1?.latitude}, {lastReportData?.Inicio_de_la_trayectoria_Estacion_1?.longitude}
              </p>

              <p className="mb-2 text-muted" style={{ fontSize: '0.95rem' }}>
                <strong className="text-body">{t('HOME.LAST_BOLIDE_DATA.END_COORDINATES')}:</strong> {lastReportData?.Fin_de_la_trayectoria_Estacion_1?.latitude}, {lastReportData?.Fin_de_la_trayectoria_Estacion_1?.longitude}
              </p>


              <h6 className="text-secondary mb-3 fw-bold">
                {t('HOME.LAST_BOLIDE_DATA.STATION')} 2
              </h6>

              <p className="mb-2 text-muted" style={{ fontSize: '0.95rem' }}>
                <strong className="text-body">{t('HOME.LAST_BOLIDE_DATA.START_COORDINATES')}:</strong> {lastReportData?.Inicio_de_la_trayectoria_Estacion_2?.latitude}, {lastReportData?.Inicio_de_la_trayectoria_Estacion_2?.longitude}
              </p>

              <p className="mb-2 text-muted" style={{ fontSize: '0.95rem' }}>
                <strong className="text-body">{t('HOME.LAST_BOLIDE_DATA.END_COORDINATES')}:</strong> {lastReportData?.Fin_de_la_trayectoria_Estacion_2?.latitude}, {lastReportData?.Fin_de_la_trayectoria_Estacion_2?.longitude}
              </p>

              <hr className="my-3" style={{ borderColor: '#eee' }} />

              <p className="mb-0 text-muted" style={{ fontSize: '0.95rem' }}>
                <strong className="text-body">{t('HOME.LAST_BOLIDE_DATA.VELOCITY')}:</strong> {truncateDecimal(lastReportData?.Velocidad_media)} km/s
              </p>
            </div>

            {/* Link Button */}
            <div className="mt-4">
              <Link to={`/report/${lastReportData?.IdInforme}`}
                className="btn w-100 d-flex flex-column align-items-center justify-content-center"
                style={{
                  backgroundColor: '#980100',
                  border: 'none',
                  borderRadius: '30px',
                  color: '#f8f9fa',
                  padding: '0.5rem 1rem',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>Ver más</span>
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Map;