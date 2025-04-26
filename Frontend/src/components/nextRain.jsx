import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { getNextShower } from '../services/activeShower'

// Internationalization
import { useTranslation } from 'react-i18next';

const NextRain = () => {
    const { t } = useTranslation(['text']);
    const [nextRain, setNextRain] = useState([]);
    const [bannerText, setBannerText] = useState('');
    const currentYear = new Date().getFullYear();

    const fetchData = async () => {
        try {
            const responseD = await getNextShower();
            setNextRain(responseD);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    }

    useEffect(() => {

        fetchData();

    }, []);

    useEffect(() => {
        if (nextRain && nextRain.length > 0) {
            const textParts = nextRain.map(shower => {
                const startDate = new Date(shower.Fecha_Inicio).toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric' }).replace(shower.Año, currentYear);
                const endDate = new Date(shower.Fecha_Fin).toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric' }).replace(shower.Año, currentYear);
                return `${shower.Nombre} (${shower.Identificador}): ${t('BANNER.PREPOSITION.DEL')} ${startDate} ${t('BANNER.PREPOSITION.AL')} ${endDate}`;
            });
            setBannerText(`${t('BANNER.ACTIVE_RAIN')} ${textParts.join(' - ')}`);
        } else {
            setBannerText(`${t('BANNER.NO_ACTIVE_RAIN')}`);
        }
    }, [nextRain]);


    return (
        <div className="text-white py-3" style={{ backgroundColor: '#980100', borderRadius: '0px 0px 20px 20px' }} >
            <Container fluid className="p-0"> {/* Container fluid con padding 0 para ocupar todo el ancho */}
                <Row className="g-0 justify-content-center"> {/* g-0 elimina el gutter entre columnas */}
                    <Col xs={12} className="moving-text p-0"> {/* Columna que ocupa todo el ancho y sin padding */}
                        <div className="d-inline-block w-100"> {/* Ancho del div al 100% para el marquee */}
                            <marquee behavior="scroll" direction="left" className="text-white w-100">
                                {bannerText}
                            </marquee>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default NextRain;