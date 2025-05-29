import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { LoginPasswordless } from '@/services/authService.jsx'; // Adjust this path to your AuthService
import LanguageNavbar from '@/components/layout/LanguageNavbar';

function PasswordlessLogin({ onBack, onLogin }) {
    const { t } = useTranslation(['text']);
    const { code: codeFromParams } = useParams();
    const [accessCode, setAccessCode] = useState(codeFromParams || '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isQRMode, setIsQRMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const qrCode = urlParams.get('code') || urlParams.get('qr');

        if (qrCode) {
            setAccessCode(qrCode);
            setIsQRMode(true);
            handleAccessWithCode(null, qrCode);
        }
    }, []);

    const handleAccessWithCode = async (e, codeFromQR = null) => {
        if (e) e.preventDefault();

        const codeToUse = codeFromQR || accessCode;
        if (!codeToUse.trim()) {
            setError(t('PASSWORDLESS.ERROR.EMPTY_CODE') || 'Por favor, introduce un código de acceso');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Note: The `isMobile` variable was used in a commented-out line previously.
            // If `LoginPasswordless` doesn't need it, you can remove its declaration.
            // const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            // const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

            const { token, rol, config } = await LoginPasswordless(codeToUse);
            console.log('Login successful:', token, rol, config);

            if (config) {
                localStorage.setItem('config', JSON.stringify(config));
            }

            onLogin(token, rol);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error verifying access code:', error);

            if (error.response?.status === 401) {
                setError(t('PASSWORDLESS.ERROR.INVALID_CODE') || 'Código de acceso inválido o expirado');
            } else if (error.response?.status === 404) {
                setError(t('PASSWORDLESS.ERROR.CODE_NOT_FOUND') || 'Código de acceso no encontrado');
            } else if (error.response?.status === 403) {
                setError(t('PASSWORDLESS.ERROR.CODE_USED') || 'Este código ya ha sido utilizado');
            } else {
                setError(t('PASSWORDLESS.ERROR.GENERAL') || 'Error de acceso. Verifica el código e inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (e) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        setAccessCode(value);
        setError('');
    };

    const handlePasteCode = (e) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        const cleanCode = paste.toUpperCase().replace(/[^A-Z0-9]/g, '');
        setAccessCode(cleanCode);
        setError('');
    };

    return (
        // Apply flexbox to the root div to manage vertical space
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <LanguageNavbar />
            {/* The main content area will now take up the remaining vertical space */}
            <Container className="d-flex justify-content-center align-items-center flex-grow-1">
                <Card style={{ borderColor: '#980100', boxShadow: '0 4px 6px rgba[0, 0, 0, 0.1]' }}>
                    <Card.Body>
                        <Card.Title className="text-center mb-4" style={{ color: '#980100', fontSize: '24px' }}>
                            {t('PASSWORDLESS.TITLE') || 'Acceso con código'}
                        </Card.Title>

                        {isQRMode && (
                            <Alert variant="info" className="mb-3">
                                <i className="fas fa-qrcode me-2"></i>
                                {t('PASSWORDLESS.QR_DETECTED') || 'Código QR detectado automáticamente'}
                            </Alert>
                        )}

                        <Form onSubmit={handleAccessWithCode}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">
                                    {t('PASSWORDLESS.CODE_LABEL') || 'Código de acceso'}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="ABC123XYZ"
                                    value={accessCode}
                                    onChange={handleCodeChange}
                                    onPaste={handlePasteCode}
                                    required
                                    disabled={loading}
                                    style={{
                                        textAlign: 'center',
                                        fontSize: '1.2em',
                                        letterSpacing: '0.1em',
                                        fontFamily: 'monospace',
                                        textTransform: 'uppercase'
                                    }}
                                    maxLength={20}
                                />
                                <Form.Text className="text-muted">
                                    {t('PASSWORDLESS.CODE_HELP') || 'Introduce el código generado desde la aplicación o escanea el QR'}
                                </Form.Text>
                            </Form.Group>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 mb-3"
                                style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                                disabled={loading || !accessCode.trim()}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        {t('PASSWORDLESS.VERIFYING') || 'Verificando acceso...'}
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-sign-in-alt me-2"></i>
                                        {t('PASSWORDLESS.ACCESS') || 'Acceder'}
                                    </>
                                )}
                            </Button>
                        </Form>

                        <div className="text-center mb-3">
                            <small className="text-muted">
                                {t('PASSWORDLESS.INFO') || 'Los códigos se generan desde dentro de la aplicación y tienen tiempo limitado'}
                            </small>
                        </div>

                        <Card className="bg-light mb-3">
                            <Card.Body className="py-2">
                                <div className="d-flex align-items-center justify-content-center">
                                    <i className="fas fa-info-circle me-2" style={{ color: '#980100' }}></i>
                                    <small>
                                        <strong>{t('PASSWORDLESS.HELP_TITLE') || '¿Cómo obtener un código?'}</strong>
                                    </small>
                                </div>
                                <small className="text-muted d-block text-center mt-1">
                                    {t('PASSWORDLESS.HELP_TEXT') || 'Solicita a un administrador que genere un código desde la aplicación'}
                                </small>
                            </Card.Body>
                        </Card>

                        <Button as={Link} to="/login"
                            variant="outline-secondary"
                            onClick={onBack}
                            className="w-100"
                            style={{ color: '#6c757d', borderColor: '#6c757d' }}
                            disabled={loading}
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            {t('PASSWORDLESS.BACK') || 'Volver al login'}
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default PasswordlessLogin;