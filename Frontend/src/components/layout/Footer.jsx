import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

// Internationalization
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation(['text']);

    return (
        <footer className=" text-white py-3" style={{ backgroundColor: '#980100' }}>
            <Container>
                <Row className="justify-content-between align-items-center">
                    <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
                        {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: "rgba(255, 255, 255, 1)", marginRight: "0.5rem" }}>
                            <path d="M20.92 2.38A15.72 15.72 0 0 0 17.5 2a8.26 8.26 0 0 0-6 2.06Q9.89 5.67 8.31 7.27c-1.21-.13-4.08-.2-6 1.74a1 1 0 0 0 0 1.41l11.3 11.32a1 1 0 0 0 1.41 0c1.95-2 1.89-4.82 1.77-6l3.21-3.2c3.19-3.19 1.74-9.18 1.68-9.43a1 1 0 0 0-.76-.73zm-2.36 8.75L15 14.67a1 1 0 0 0-.27.9 6.81 6.81 0 0 1-.54 3.94L4.52 9.82a6.67 6.67 0 0 1 4-.5A1 1 0 0 0 9.39 9s1.4-1.45 3.51-3.56A6.61 6.61 0 0 1 17.5 4a14.51 14.51 0 0 1 2.33.2c.24 1.43.62 5.04-1.27 6.93z"></path><circle cx="15.73" cy="8.3" r="2"></circle><path d="M5 16c-2 1-2 5-2 5a7.81 7.81 0 0 0 5-2z"></path></svg>
                        <span className="font-weight-bold text-uppercase" style={{ fontSize: '1.5rem' }}>AstroUMA</span> */}
                        <img src="/Logo-50-SMA.webp" alt="AstroUMA" style={{ width: '100px', height: 'auto', marginRight: '0.5rem' }} />
                    </Col>

                    <Col md={4} className="text-center mb-3 mb-md-0">
                        <p className="mb-2">{t('FOOTER.FOLLOW')}</p>
                        <div className="d-flex justify-content-center">
                            <a href="https://x.com/i/flow/login?redirect_after_login=%2Fastromalaga" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/twitter.webp" alt="twitter" style={{ width: '25px', height: 'auto', marginRight: '0.5rem' }} />
                            </a>
                            <a href="https://bsky.app/profile/astromalaga.bsky.social" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/Bluesky.svg" alt="Bluesky" style={{ width: '25px', height: 'auto', marginRight: '0.5rem' }} />
                            </a>
                            <a href="https://es-es.facebook.com/astromalaga/" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/facebook.webp" alt="facebook" style={{ width: '25px', height: 'auto', marginRight: '0.5rem' }} />
                            </a>
                            <a href="https://www.instagram.com/astromalaga/?hl=es" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/instagram.webp" alt="instagram" style={{ width: '25px', height: 'auto', marginRight: '0.5rem' }} />
                            </a>
                            <a href="https://t.me/astromalaga" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/telegram.webp" alt="telegram" style={{ width: '25px', height: 'auto', marginRight: '0.5rem' }} />
                            </a>
                            <a href="https://vimeo.com/astromalaga" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/vimeo.webp" alt="vimeo" style={{ width: '25px', height: 'auto', marginRight: '0.5rem' }} />
                            </a>
                            <a href="https://www.youtube.com/c/astromalaga" className="text-white mx-2" style={{ fontSize: '2em' }}>
                                <img src="/social_media/youtube.webp" alt="youtube" style={{ width: '25px', height: 'auto', marginRight: '0.5rem' }} />
                            </a>
                        </div>
                    </Col>
                    <Col md={4} className="text-center text-md-end">
                        <p className="mb-0">{t('FOOTER.CONTACT_TEXT')} <a href="mailto:astromalaga@gmail.com" className="text-white">{t('FOOTER.CONTACT_INFO')}</a></p>
                    </Col>

                    <Col md={4} className="text-center text-md-end">
                        <p className="mb-0">
                            {t('FOOTER.CONTACT_TEXT')}
                            <a href="mailto:astromalaga@gmail.com" className="text-white">{t('FOOTER.CONTACT_INFO')}</a>
                        </p>
                        <p className="mb-0 mt-2">Desarrollado por Ignacio Fernández Contreras</p>
                        <p className="mb-0 small">Basado en el trabajo de José Ignacio García Escobar</p>

                    </Col>

                </Row>
            </Container>
        </footer>
    );
};

export default Footer;