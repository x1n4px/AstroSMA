import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Modal, Image } from 'react-bootstrap';
import TermsAndConditions from '@/components/legal/TermsAndCondition';
import { registerUser } from '@/services/authService';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { getCountry } from '@/services/auxiliaryService';

// Internationalization
import { useTranslation } from 'react-i18next';

function Register() {
  const { t } = useTranslation(['text']);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();
  const [institution, setInstitution] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryOptions, setCountryOptions] = useState([]);
  const [showLogos, setShowLogos] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      const countries = await getCountry();
      setCountryOptions(countries.map(country => ({
        value: country.id,
        label: country.nombre,
      })));
    };
    fetchCountries();

    const handleResize = () => {
      setShowLogos(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError(<>{t('REGISTER.ERROR.PASSWORDS_NOT_MATCH')}</>);
      return;
    }

    if (!acceptedTerms) {
      setError(<>{t('REGISTER.ERROR.TERMS_AND_CONDITIONS')}</>);
      return;
    }

    try {
      const countryId = selectedCountry?.value;
      const { token, rol } = await registerUser(email, password, firstName, lastName, countryId, institution);
      navigate('/login');
    } catch (error) {
      setError(<>{t('REGISTER.ERROR.CREDENTIALS')}</>);
    }
  };

  const handleShowTermsModal = () => setShowTermsModal(true);
  const handleCloseTermsModal = () => setShowTermsModal(false);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', position: 'relative' }}>
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Row className="justify-content-center w-100">
          <Col xs={12} sm={10} md={8} lg={6}>
            <Card style={{ borderColor: '#980100', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <Card.Body>
                <div className="text-center mb-4">
                  <Image src="/Logo-50-SMA.webp" alt="Logo" style={{ maxWidth: '150px' }} />
                </div>
                <Card.Title className="text-center mb-4" style={{ color: '#980100', fontSize: '24px' }}>{t('REGISTER.TITLE')}</Card.Title>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('REGISTER.EMAIL')}</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder={t('REGISTER.PLACEHOLDER.EMAIL')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('REGISTER.NAME')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('REGISTER.PLACEHOLDER.NAME')}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('REGISTER.SURNAME')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('REGISTER.PLACEHOLDER.SURNAME')}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('REGISTER.COUNTRY')}</Form.Label>
                    <Select
                      options={countryOptions}
                      value={selectedCountry}
                      onChange={(selectedOption) => setSelectedCountry(selectedOption)}
                      placeholder={t('REGISTER.COUNTRY')}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('REGISTER.INSTITUTION')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('REGISTER.INSTITUTION')}
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('REGISTER.PASSWORD')}</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="****"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('REGISTER.PASSWORD_CONFIRM')}</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="****"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label={
                        <>
                          {t('REGISTER.TERM.ACEPT')} <span style={{ color: '#980100', cursor: 'pointer' }} onClick={handleShowTermsModal}>{t('REGISTER.TERM.TERMS_AND_CONDITIONS')}</span>
                        </>
                      }
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                    />
                  </Form.Group>
                  {error && <Alert variant="danger">{error}</Alert>}
                  <Button variant="primary" type="submit" className="w-100 mb-3" style={{ backgroundColor: '#980100', borderColor: '#980100' }}>
                    {t('REGISTER.REGISTER_BTN')}
                  </Button>
                </Form>
                <Button variant="outline-secondary" className="w-100" as={Link} to="/login" style={{ color: '#980100', borderColor: '#980100' }}>
                  {t('REGISTER.LOGIN_BTN')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Modal show={showTermsModal} onHide={handleCloseTermsModal}>
          <Modal.Header closeButton>
            <Modal.Title>{t('TERMS_AND_CONDITIONS.TITLE')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TermsAndConditions />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseTermsModal}>
              {t('TERMS_AND_CONDITIONS.CLOSE_BTN')}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      {showLogos && (
        <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
          {/*<Image src={'/logoSMA.webp'} alt="SMA Logo" style={{ maxWidth: '100px', margin: '0 5px' }} />
          <Image src={'/logoUMA.webp'} alt="UMA Logo" style={{ maxWidth: '100px', margin: '0 5px' }} />*/}
        </div>
      )}
    </div>
  );
}

export default Register;