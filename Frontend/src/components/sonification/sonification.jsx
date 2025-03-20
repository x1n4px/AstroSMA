import React from 'react';
import { Card, Button, ProgressBar } from 'react-bootstrap';

const SonificationComponent = () => {
    return (
        <Card style={{
            width: '100%',
            border: '1px solid #e0e0e0',
            borderRadius: '15px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#f9f9f9',
        }}>
            <Card.Body>
                <Card.Title style={{ fontSize: '1.5rem', color: '#333', marginBottom: '15px' }}>
                    Sonificación del Bólido
                </Card.Title>

                {/* Botón de Play */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Button
                        variant="primary"
                        style={{
                            borderRadius: '50%',
                            width: '60px',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" style={{ fill: "rgba(255, 255, 255, 1)" }}><path d="M7 6v12l10-6z"></path></svg>          </Button>
                </div>

                {/* Barra de progreso del audio */}
                <div style={{ marginBottom: '20px' }}>
                    <ProgressBar
                        now={30} // Progreso fijo al 30%
                        style={{ height: '8px', borderRadius: '4px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#555' }}>0:00</span>
                        <span style={{ fontSize: '0.9rem', color: '#555' }}>1:30</span>
                    </div>
                </div>

                {/* Información adicional (opcional) */}
                <Card.Text style={{ color: '#555', lineHeight: '1.6', textAlign: 'center' }}>
                    Reproduciendo sonificación del bólido...
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default SonificationComponent;