import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getUser, modifyUserPass } from '@/services/userService';

const Profile = () => {
    const { t } = useTranslation(['text']);
    const [profile, setProfile] = useState({
        name: '',
        surname: '',
        email: '',
        institucion: '',
        countryName: '',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estado para el modal de cambio de contraseña
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Estados para los campos de contraseña dentro del modal
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const userData = await getUser();
                console.log(userData);
                setProfile(userData);
            } catch (err) {
                console.error('Error al obtener datos del usuario:', err);
                setError(t('FETCH_ERROR'));
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [t]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        // Aquí lógica para actualizar el perfil si quieres
        try {
            // await updateUserProfile(profile);
            setSuccess(t('UPDATE_SUCCESS'));
        } catch (err) {
            console.error('Error al actualizar el perfil:', err);
            setError(t('UPDATE_ERROR'));
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError(t('PROFILE.PASSWORD_MISMATCH'));
            return;
        }

        try {
            await modifyUserPass(profile.id, currentPassword, newPassword);
            setSuccess(t('PROFILE.PASSWORD_CHANGE_SUCCESS'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordModal(false);
        } catch (err) {
            console.error('Error al cambiar la contraseña:', err);
            setError(t('PROFILE.PASSWORD_CHANGE_ERROR'));
        }
    };

    if (loading) {
        return <Container><p>{t('PROFILE.LOADING')}</p></Container>;
    }

    return (
        <Container>
            <Row className="justify-content-md-center mt-4">
                <Col md={6}>
                    <h2>{t('PROFILE.TITLE')}</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form.Group controlId="formEmail">
                        <Form.Label>{t('PROFILE.EMAIL')}</Form.Label>
                        <Form.Control type="email" name="email" value={profile.email} readOnly />
                    </Form.Group>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formName">
                            <Form.Label>{t('PROFILE.NAME')}</Form.Label>
                            <Form.Control type="text" name="name" value={profile.name} onChange={handleChange} />
                        </Form.Group>

                        <Form.Group controlId="formSurname">
                            <Form.Label>{t('PROFILE.SURNAME')}</Form.Label>
                            <Form.Control type="text" name="surname" value={profile.surname} onChange={handleChange} />
                        </Form.Group>

                        <Form.Group controlId="formInstitution">
                            <Form.Label>{t('PROFILE.INSTITUTION')}</Form.Label>
                            <Form.Control type="text" name="institucion" value={profile.institucion} onChange={handleChange} />
                        </Form.Group>

                        <Form.Group controlId="formCountry">
                            <Form.Label>{t('PROFILE.COUNTRY')}</Form.Label>
                            <Form.Control type="text" name="countryName" value={profile.countryName} onChange={handleChange} />
                        </Form.Group>

                        <div className="d-flex mb-4">
                            {/* <Button type="submit" className="mt-4" disabled>
                                {t('PROFILE.UPDATE_BTN')}
                            </Button> */}
                            <Button className="mt-4" style={{ backgroundColor: '#980100', borderColor: '#980100' }} onClick={() => setShowPasswordModal(true)}>
                        {t('PROFILE.MODIFY_PASSWORD')}
                    </Button>
                        </div>
                    </Form>

                    

                    {/* Modal para cambiar contraseña */}
                    <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>{t('PROFILE.CHANGE_PASSWORD_BTN')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleChangePassword}>
                                <Form.Group controlId="formCurrentPassword">
                                    <Form.Label>{t('PROFILE.CURRENT_PASSWORD')}</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="formNewPassword">
                                    <Form.Label>{t('PROFILE.NEW_PASSWORD')}</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="formConfirmPassword">
                                    <Form.Label>{t('PROFILE.CONFIRM_PASSWORD')}</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <div className="mt-3 d-flex justify-content-end">
                                    <Button variant="secondary" onClick={() => setShowPasswordModal(false)} className="mr-2 mx-2">
                                        {t('PROFILE.CANCEL')}
                                    </Button>
                                    <Button variant="primary" type="submit">
                                        {t('PROFILE.CHANGE_PASSWORD_BTN')}
                                    </Button>
                                </div>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;
