import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { sendPasswordResetEmail, checkUuidValidity, resetPasswordFromEmail } from '../../services/authService'; // Asegúrate de que la ruta sea correcta
import { useTranslation } from 'react-i18next';

function ResetPassword() {
    const { t } = useTranslation(['text']);

    const { uuid } = useParams(); // Para obtener el UUID de la URL
    const navigate = useNavigate(); // Para la navegación programática

    // Estados para el formulario de email
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState('');

    // Estados para la validación del UUID y el formulario de nueva contraseña
    const [isValidUuid, setIsValidUuid] = useState(false);
    const [uuidCheckLoading, setUuidCheckLoading] = useState(true);
    const [uuidCheckError, setUuidCheckError] = useState('');

    // Estados para el formulario de cambio de contraseña
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
    const [passwordChangeError, setPasswordChangeError] = useState('');
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

    // --- Lógica para la ruta '/reset-password/:uuid' ---
    useEffect(() => {
        if (uuid) {
            const validateUuid = async () => {
                try {
                    await checkUuidValidity(uuid);
                    setIsValidUuid(true);
                } catch (err) {
                    setIsValidUuid(false);
                    setUuidCheckError(t('RESET_PASSWORD.ERROR.LINK_EXPIRED'));
                } finally {
                    setUuidCheckLoading(false);
                }
            };
            validateUuid();
        }
    }, [uuid]); // Se ejecuta cuando el UUID cambia en la URL

    // --- Manejadores de envío de formularios ---

    const handleSendEmailSubmit = async (e) => {
        e.preventDefault();
        setEmailError('');
        setEmailSent(false);

        try {
            // Aquí podrías añadir una validación básica de email
            if (!email) {
                setEmailError(t('RESET_PASSWORD.ERROR.PASSWORD_EMPTY'));
                return;
            }

            await sendPasswordResetEmail(email);
            setEmailSent(true);
        } catch (err) {
            setEmailError(err || t('RESET_PASSWORD.ERROR.SEND_EMAIL'));
        }
    };

    const handleChangePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordChangeError('');
        setPasswordChangeLoading(true);

        if (newPassword !== confirmPassword) {
            setPasswordChangeError(t('RESET_PASSWORD.ERROR.PASSWORD_DONT_MATCH'));
            setPasswordChangeLoading(false);
            return;
        }

u
        try {
            console.log(newPassword, uuid);
            await resetPasswordFromEmail(newPassword, uuid);
            setPasswordChangeSuccess(true);
            // Redirigir a /login después de un pequeño retraso
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Redirige después de 2 segundos para que el usuario vea la confirmación
        } catch (err) {
            setPasswordChangeError(err || t('RESET_PASSWORD.ERROR.PASSWORD'));
        } finally {
            setPasswordChangeLoading(false);
        }
    };

    // --- Renderizado Condicional ---

    // Si estamos en la ruta /reset-password/:uuid
    if (uuid) {
        if (uuidCheckLoading) {
            return (
                <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">{t('RESET_PASSWORD.LINK.LINK_VALID')}</span>
                    </Spinner>
                    <p className="ms-3">  {t('RESET_PASSWORD.LINK.LINK_VALID')}</p>
                </Container>
            );
        }

        if (uuidCheckError) {
            return (
                <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                    <Alert variant="danger" className="text-center">
                        {uuidCheckError}
                        <Button variant="link" onClick={() => navigate('/reset-password')}>
                            {t('RESET_PASSWORD.LINK.LINK_REQUEST')}
                        </Button>
                    </Alert>
                </Container>
            );
        }

        if (isValidUuid) {
            return (
                <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                    <Row>
                        <Col md={12} lg={12} className="mx-auto">
                            <h2 className="text-center mb-4">{t('RESET_PASSWORD.PASSWORD.HEADER')}</h2>
                            <Form onSubmit={handleChangePasswordSubmit} className="p-4 border rounded shadow-sm">
                                {passwordChangeSuccess && (
                                    <Alert variant="success" className="text-center">
                                        {t('RESET_PASSWORD.PASSWORD.ALERT.PASSWORD_CHANGED')}
                                    </Alert>
                                )}
                                {passwordChangeError && <Alert variant="danger">{passwordChangeError}</Alert>}

                                <Form.Group className="mb-3" controlId="formNewPassword">
                                    <Form.Label>{t('RESET_PASSWORD.PASSWORD.TITLE')}</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder={t('RESET_PASSWORD.PASSWORD.PLACEHOLDER')}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formConfirmPassword">
                                    <Form.Label>{t('RESET_PASSWORD.PASSWORD.TITLE_CONFIRM')}</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder={t('RESET_PASSWORD.PASSWORD.PLACEHOLDER_CONFIRM')}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Button style={{ backgroundColor: '#980100', border: '#980100' }} type="submit" className="w-100" disabled={passwordChangeLoading}>
                                    {passwordChangeLoading ? (
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                    ) : null}
                                    {t('RESET_PASSWORD.PASSWORD.BUTTON')}
                                </Button>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            );
        }
    }

    // --- Lógica para la ruta '/reset-password' (solicitar email) ---
    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <Row>
                <Col md={12} lg={12} className="mx-auto">
                    <h2 className="text-center mb-4">{t('RESET_PASSWORD.EMAIL.HEADER')}</h2>
                    <Form onSubmit={handleSendEmailSubmit} className="p-4 border rounded shadow-sm">
                        {emailSent && (
                            <Alert variant="success" className="text-center">
                                {t('RESET_PASSWORD.EMAIL.ALERT.REGISTER_EMAIL')}
                            </Alert>
                        )}
                        {emailError && <Alert variant="danger">{emailError}</Alert>}

                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>{t('RESET_PASSWORD.EMAIL.TITLE')}</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder={t('RESET_PASSWORD.EMAIL.PLACEHOLDER')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button style={{ backgroundColor: '#980100', border: '#980100' }} type="submit" className="w-100">
                            {t('RESET_PASSWORD.EMAIL.BUTTON')}
                        </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <Button style={{ color: '#980100' }} variant="link" onClick={() => navigate('/login')}>
                            {t('RESET_PASSWORD.BACK_TO_LOGIN')}
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default ResetPassword;