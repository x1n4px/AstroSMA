import React from 'react';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Importa el hook de traducción

const BackToAdminPanel = () => {
  const { t } = useTranslation(['text']);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/admin-panel');
  };

  return (

    <div className="container my-4">
      <Container fluid className="my-4 ps-0 "> {/* Contenedor fluido sin padding izquierdo */}
        <div className="d-flex justify-content-start"> {/* Flex para alinear a la izquierda */}
          <Button
            style={{ backgroundColor: 'white', color: '#980100', borderColor: '#980100' }}  // Estilo outline más moderno
            onClick={handleClick}
            className="me-2"  // Margen derecho para separar de otros elementos
            size="sm"  // Tamaño pequeño para que no sea invasivo
          >
            <i className="bi bi-arrow-left me-1"></i> {/* Icono de flecha (requiere bootstrap-icons) */}
            &lt; {t('ADMIN.BACK_ADMIN_PANEL_BTN')} {/* Texto traducido */}
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default BackToAdminPanel;