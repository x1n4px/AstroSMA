import React from 'react';

const NoPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'url(/space.webp) no-repeat center center/cover',
        color: 'white',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#000',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', margin: '0' }}>
        ¡Oops! La nave se perdió en el espacio
      </h1>
      <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
        No encontramos la página que buscas. Tal vez esté explorando una galaxia lejana.
      </p>
      <a
        href="/"
        style={{
          marginTop: '2rem',
          padding: '1rem 2rem',
          backgroundColor: '#007bff',
          color: 'white',
          fontSize: '1rem',
          textDecoration: 'none',
          borderRadius: '8px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px', // Espacio entre el ícono y el texto
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
      >
        {/* Icono SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: 'rgba(255, 255, 255, 1)' }}>
          <path d="M15.78 15.84S18.64 13 19.61 12c3.07-3 1.54-9.18 1.54-9.18S15 1.29 12 4.36C9.66 6.64 8.14 8.22 8.14 8.22S4.3 7.42 2 9.72L14.25 22c2.3-2.33 1.53-6.16 1.53-6.16zm-1.5-9a2 2 0 0 1 2.83 0 2 2 0 1 1-2.83 0zM3 21a7.81 7.81 0 0 0 5-2l-3-3c-2 1-2 5-2 5z"></path>
        </svg>
        Regresar al centro de control
      </a>
    </div>
  );
};

export default NoPage;
