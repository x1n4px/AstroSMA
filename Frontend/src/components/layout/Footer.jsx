import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation(['text']);

    return (
        <footer className="text-white py-3" style={{ backgroundColor: '#980100' }}>
            <Container>
                <Row className="justify-content-between align-items-center">
                    <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
                        <img src="/Logo-50-SMA.webp" alt="AstroUMA" style={{ width: '100px', height: 'auto', marginRight: '0.5rem' }} />
                    </Col>

                    <Col md={4} className="text-center mb-3 mb-md-0">
                        <p className="mb-2">{t('FOOTER.FOLLOW')}</p>
                        <div className="d-flex justify-content-center flex-wrap">
                            <a href="https://x.com/i/flow/login?redirect_after_login=%2Fastromalaga" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/twitter.webp" alt="twitter" style={{ width: '25px', height: 'auto' }} />
                            </a>
                            <a href="https://bsky.app/profile/astromalaga.bsky.social" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/Bluesky.svg" alt="Bluesky" style={{ width: '25px', height: 'auto' }} />
                            </a>
                            <a href="https://es-es.facebook.com/astromalaga/" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/facebook.webp" alt="facebook" style={{ width: '25px', height: 'auto' }} />
                            </a>
                            <a href="https://www.instagram.com/astromalaga/?hl=es" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/instagram.webp" alt="instagram" style={{ width: '25px', height: 'auto' }} />
                            </a>
                            <a href="https://t.me/astromalaga" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/telegram.webp" alt="telegram" style={{ width: '25px', height: 'auto' }} />
                            </a>
                            <a href="https://vimeo.com/astromalaga" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/vimeo.webp" alt="vimeo" style={{ width: '25px', height: 'auto' }} />
                            </a>
                            <a href="https://www.youtube.com/c/astromalaga" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/youtube.webp" alt="youtube" style={{ width: '25px', height: 'auto' }} />
                            </a>
                        </div>
                    </Col>

                    <Col md={4} className="text-center text-md-end">
                        <p className="mb-0">
                            {t('FOOTER.CONTACT_TEXT')} <a href="mailto:astromalaga@gmail.com" className="text-white">{t('FOOTER.CONTACT_INFO')}</a>
                        </p>
                    </Col>

                    <Col xs={12} className="text-center mt-4">
                        <p className="mb-1" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                            {t('FOOTER.DEVELOPER')}
                            <a href="https://www.linkedin.com/in/ignacio-fernández-contreras-89bb3422a/" target="_blank" rel="noopener noreferrer" className="text-white ms-2">
                                Ignacio Fernández Contreras
                            </a>
                        </p>
                        <p className="mb-0 small">{t('FOOTER.BASED_ON')}
                            <a href="https://www.linkedin.com/in/jos%C3%A9-ignacio-garc%C3%ADa-escobar-02b16a266/" target="_blank" rel="noopener noreferrer" className="text-white ms-2">José Ignacio García Escobar</a></p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
