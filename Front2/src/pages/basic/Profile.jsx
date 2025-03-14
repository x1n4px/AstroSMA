import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

import { useTranslation } from 'react-i18next';


const Profile = () => {
    const { t } = useTranslation(['profile']);


    const [profile, setProfile] = useState({
        name: '',
        surname: '',
        email: 'user@gmail.com',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            [name]: value
        });
    };

    const handleDeleteAccount = () => {
        // Logic to handle account deletion
        alert('Account deletion requested');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to handle profile update
        alert('Profile updated');
    };

    return (
        <Container>
            <Row className="justify-content-md-center mt-4">
                <Col md={6}>
                    <h2>{t('TITLE')}</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formName">
                            <Form.Label>{t('NAME')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group controlId="formSurname">
                            <Form.Label>{t('SURNAME')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="surname"
                                value={profile.surname}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group controlId="formEmail">
                            <Form.Label>{t('EMAIL')}</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={profile.email}
                                readOnly
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword">
                            <Form.Label>{t('PASSWORD')}</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={profile.password}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className='mt-2'>
                            {t('UPDATE_BTN')}
                        </Button>
                        <Button variant="danger" onClick={handleDeleteAccount} className="ml-4 mt-2">
                            {t('DELETE_BTN')}
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;