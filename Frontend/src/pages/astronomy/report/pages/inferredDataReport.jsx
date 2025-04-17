import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import FormatDate from '@/pipe/formatDate.jsx'
import truncateDecimal from '@/pipe/truncateDecimal';


function InferredDataReport({ data }) {
  if (!data) {
    return <div>Cargando datos...</div>; // O un mensaje de error si prefieres
  }
  const { t } = useTranslation(['text']);

  const userRol = localStorage.getItem('rol');


  return (
    <Container>
     
      <Row className="mb-4">
        <Col xs={12} md={6}>

          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.DATE.label')}</Form.Label>
            <Form.Control type="text" value={FormatDate(data.Fecha)} readOnly />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.AZIMUTH.label')}</Form.Label>
            <Form.Control type="text" value={truncateDecimal(data.Azimut)} readOnly />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.DIHEDRAL_ANGLE_BTW_PLANES.label')}</Form.Label>
            <Form.Control type="text" value={truncateDecimal(data.Ángulo_diedro_entre_planos_trayectoria)} readOnly />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.Errores_AR_RADIANT.label')}</Form.Label>
            <Form.Control type="text" value={data.Errores_AR_DE_radiante?.split(" ")[0]} readOnly />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.ORTHOGONALITY_QUADRATIC_ERROR_IN_THE_WEST_SPHERE_1.label')}</Form.Label>
            <Form.Control type="text" value={(data.Error_cuadrático_de_ortogonalidad_en_la_esfera_celeste_1)} readOnly />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.ASTRONOMICAL_COORDINATES_OF_THE_RADIANT_ECLIPTIC_OF_THE_DATE.label')}</Form.Label>
            <Form.Control type="text" value={(data.Coordenadas_astronómicas_del_radiante_Eclíptica_de_la_fecha)} readOnly />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.EQUATION_OF_MOTION_IN_KMS.label')}</Form.Label>
            <Form.Control type="text" value={(data.Ecuacion_del_movimiento_en_Kms)} readOnly />
          </Form.Group>
        </Col>
        <Col xs={12} md={6}>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.HOUR.label')}</Form.Label>
            <Form.Control type="text" value={data.Hora.substring(0,8)} readOnly />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.ZENITHAL_DISTANCE.label')}</Form.Label>
            <Form.Control type="text" value={truncateDecimal(data.Dist_Cenital)} readOnly />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.STATISTICAL_WEIGHTS.label')}</Form.Label>
            <Form.Control type="text" value={truncateDecimal(data.Peso_estadístico)} readOnly />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.Errores_DE_RADIANT.label')}</Form.Label>
            <Form.Control type="text" value={data.Errores_AR_DE_radiante?.split(" ")[1]} readOnly />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.ORTHOGONALITY_QUADRATIC_ERROR_IN_THE_WEST_SPHERE_2.label')}</Form.Label>
            <Form.Control type="text" value={data.Error_cuadrático_de_ortogonalidad_en_la_esfera_celeste_2} readOnly />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.ASTRONOMICAL_COORDINATES_OF_THE_RADIANT_J200.label')}</Form.Label>
            <Form.Control type="text" value={data.Coordenadas_astronómicas_del_radiante_J200} readOnly />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.EQUATION_OF_MOVEMENT_IN_GS.label')}</Form.Label>
            <Form.Control type="text" value={data.Ecuacion_del_movimiento_en_gs} readOnly />
          </Form.Group>
        </Col>
        {userRol === '10000000' && (
        <Col>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.REPORT_ROUTE.label')}</Form.Label>
            <Form.Control type="text" value={data.Ruta_del_informe} readOnly />
          </Form.Group>
        </Col>
        )}
      </Row>

    </Container >
  );
}

export default InferredDataReport;