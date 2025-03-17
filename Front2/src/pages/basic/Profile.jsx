import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getUser } from '@/services/userService';

const Profile = () => {
    const { t } = useTranslation(['text']);
    const [profile, setProfile] = useState({
        name: '',
        surname: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                
                const userData = await getUser();
                setProfile(userData);
                setLoading(false);
            } catch (err) {
                console.error('Error al obtener datos del usuario:', err);
                setError(t('FETCH_ERROR')); // Usa traducción para el mensaje de error
                setLoading(false);
            }
        };

        fetchUserData();
    }, [t]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Implementa aquí la lógica para actualizar el perfil
        try {
            // Ejemplo: llamada a una función de servicio para actualizar el perfil
            // await updateUserProfile(profile);
            setSuccess(t('UPDATE_SUCCESS'));
        } catch (err) {
            console.error('Error al actualizar el perfil:', err);
            setError(t('UPDATE_ERROR'));
        }
    };

    const handleDeleteAccount = () => {
        // Lógica para manejar la eliminación de la cuenta
        alert(t('DELETE_CONFIRM'));
    };

    if (loading) {
        return <Container><p>{t('PROFILE.LOADING')}</p></Container>;
    }

    return (
        <Container>
            <Row className="justify-content-md-center mt-4">
                <Col md={6}>
                    <h2>{t('PROFILE.TITLE')}</h2>
                    {/* {error && <Alert variant="danger">{error}</Alert>} */}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formName">
                            <Form.Label>{t('PROFILE.NAME')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group controlId="formSurname">
                            <Form.Label>{t('PROFILE.SURNAME')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="surname"
                                value={profile.surname}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group controlId="formEmail">
                            <Form.Label>{t('PROFILE.EMAIL')}</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={profile.email}
                                readOnly
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword">
                            <Form.Label>{t('PROFILE.PASSWORD')}</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder='********'
                                onChange={handleChange}
                                disabled={true}
                            />
                        </Form.Group>
                         <Button style={{backgroundColor:'#980100', borderColor: '#980100'}} type="submit" className='mr-2 mt-4' disabled={true}>
                            {t('PROFILE.UPDATE_BTN')}
                        </Button>
                        <Button variant="secondary" onClick={handleDeleteAccount} className="mx-2 mt-4" disabled={true}>
                            {t('PROFILE.DELETE_BTN')}
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;