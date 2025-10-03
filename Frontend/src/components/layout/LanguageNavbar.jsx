import React from 'react';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LanguageNavbar = () => {
  const { i18n } = useTranslation();

  // Function to change the application's language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ 
      backgroundColor: 'transparent', 
      padding: '15px 0',
    }}>
      <Container>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '20px'
        }}>
          {/* English Language Option */}
          <button
            onClick={() => changeLanguage('en')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            aria-label="Change to English"
          >
            <img 
              src="/flag/en.webp" 
              alt="English" 
              style={{ 
                width: '35px', 
                height: 'auto',
                borderRadius: '4px',
              }} 
            />
          </button>
          
          <button
            onClick={() => changeLanguage('es')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            aria-label="Cambiar a Español"
          >
            <img 
              src="/flag/es.webp" 
              alt="Español" 
              style={{ 
                width: '35px', 
                height: 'auto',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }} 
            />
          </button>
        </div>
      </Container>
    </div>
  );
};

export default LanguageNavbar;
