import React from 'react';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import FormatDate from '@/pipe/formatDate.jsx'
import truncateDecimal from '@/pipe/truncateDecimal';

function InferredDataReport({ data }) {
  if (!data) {
    return <div>Cargando datos...</div>;
  }
  
  const { t } = useTranslation(['text']);
  const userRol = localStorage.getItem('rol');

  function getDecimalCoordinates(value) {
    if (!value) return "";
    const parts = value.trim().split(" ");
    if (parts.length < 4) return "";
    return `${parts[2]} ${parts[3]}`;
  }

  function formatEquationCoefficients(value) {
    if (!value) return "";
    const parts = value.trim().split(" ");
    if (parts.length < 3) return "";
    const [a, b, c] = parts;
    return `a = ${a}, b = ${b}, c = ${c}`;
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col xs={12} md={6}>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.DATE.label')}</Form.Label>
            <Form.Control type="text" value={FormatDate(data.date)} readOnly />
          </Form.Group>
          
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.AZIMUTH.label')}</Form.Label>
            <InputGroup>
              <Form.Control type="text" value={truncateDecimal(data.azimuth)} readOnly />
              <InputGroup.Text>°</InputGroup.Text>
            </InputGroup>
          </Form.Group>
          
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.DIHEDRAL_ANGLE_BTW_PLANES.label')}</Form.Label>
            <InputGroup>
              <Form.Control type="text" value={truncateDecimal(data.trajectoryPlanesDihedralAngle)} readOnly />
              <InputGroup.Text>°</InputGroup.Text>
            </InputGroup>
          </Form.Group>
          
          {userRol === '10000000' && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>{t('INFERRED_DATA.Errores_AR_RADIANT.label')}</Form.Label>
                <InputGroup>
                  <Form.Control type="text" value={data.radiantRaDeErrors?.split(" ")[0]} readOnly />
                  <InputGroup.Text>arcsec</InputGroup.Text>
                </InputGroup>
              </Form.Group>
              
              <Form.Group className="mb-2">
                <Form.Label>{t('INFERRED_DATA.ORTHOGONALITY_QUADRATIC_ERROR_IN_THE_WEST_SPHERE_1.label')}</Form.Label>
                <InputGroup>
                  <Form.Control type="text" value={(data.celestialSphereOrthogonalityError1)} readOnly />
                  <InputGroup.Text>km²</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.ASTRONOMICAL_COORDINATES_OF_THE_RADIANT_ECLIPTIC_OF_THE_DATE.label')}</Form.Label>
            <InputGroup>
              <Form.Control type="text" value={(getDecimalCoordinates(data.radiantEclipticCoordinatesOfDate))} readOnly />
              <InputGroup.Text>°</InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Col>
        
        <Col xs={12} md={6}>
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.HOUR.label')}</Form.Label>
            <Form.Control type="text" value={data.time.substring(0, 8)} readOnly />
          </Form.Group>
          
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.ZENITHAL_DISTANCE.label')}</Form.Label>
            <InputGroup>
              <Form.Control type="text" value={truncateDecimal(data.zenithDistance)} readOnly />
              <InputGroup.Text>°</InputGroup.Text>
            </InputGroup>
          </Form.Group>
          
          <Form.Group className="mb-2">
            <Form.Label>{t('INFERRED_DATA.STATISTICAL_WEIGHTS.label')}</Form.Label>
            <Form.Control type="text" value={truncateDecimal(data.statisticalWeight)} readOnly />
          </Form.Group>
          
          {userRol === '10000000' && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>{t('INFERRED_DATA.Errores_DE_RADIANT.label')}</Form.Label>
                <InputGroup>
                  <Form.Control type="text" value={data.radiantRaDeErrors?.split(" ")[1]} readOnly />
                  <InputGroup.Text>arcsec</InputGroup.Text>
                </InputGroup>
              </Form.Group>
              
              <Form.Group className="mb-2">
                <Form.Label>{t('INFERRED_DATA.ORTHOGONALITY_QUADRATIC_ERROR_IN_THE_WEST_SPHERE_2.label')}</Form.Label>
                <InputGroup>
                  <Form.Control type="text" value={data.celestialSphereOrthogonalityError2} readOnly />
                  <InputGroup.Text>km²</InputGroup.Text>
                </InputGroup>
              </Form.Group>
              
              <Form.Group className="mb-2">
                <Form.Label>{t('INFERRED_DATA.ASTRONOMICAL_COORDINATES_OF_THE_RADIANT_J200.label')}</Form.Label>
                <InputGroup>
                  <Form.Control type="text" value={data.radiantJ2000Coordinates} readOnly />
                  <InputGroup.Text>°</InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>{t('INFERRED_DATA.EQUATION_OF_MOVEMENT_IN_GS.label')}</Form.Label>
                <InputGroup>
                  <Form.Control type="text" value={data.accelerationGs} readOnly />
                  <InputGroup.Text>m/s²</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </>
          )}
        </Col>
        
        {userRol === '10000000' && (
          <Col>
            <Form.Group className="mb-2">
              <Form.Label>{t('INFERRED_DATA.REPORT_ROUTE.label')}</Form.Label>
              <Form.Control type="text" value={data.reportPath} readOnly />
            </Form.Group>
          </Col>
        )}
      </Row>

      <Row>
        <Form.Group className="mb-2">
          <Form.Label>{t('INFERRED_DATA.EQUATION_OF_MOTION_IN_KMS.label')} (e=at^2 + bt + c)</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              value={formatEquationCoefficients(data.Ecuacion_del_movimiento_en_Kms)}
              readOnly
            />
            <InputGroup.Text>Km/s</InputGroup.Text>
          </InputGroup>
        </Form.Group>
      </Row>
    </Container>
  );
}

export default InferredDataReport;