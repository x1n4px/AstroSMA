import React from 'react';

const GeminiSpinnerOverlay = () => {
    const [size, setSize] = useState(100);
    const [colorIndex, setColorIndex] = useState(0);
    const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

    useEffect(() => {
        const interval = setInterval(() => {
            setColorIndex((prev) => (prev + 1) % colors.length);
            setSize((prev) => (prev % 150) + 50);
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgb(255, 255, 255)',
            color: 'black',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                width: '150px',
                height: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Spinner
                    animation="border"
                    variant={colors[colorIndex]}
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        transition: 'all 0.5s ease'
                    }}
                />
            </div>

            <h3 className="mt-4">Generando análisis...</h3>
            <p>Por favor espere, esto puede tomar unos momentos</p>

            <Button
                variant="outline-danger"
                className="mt-4"
                onClick={() => navigate('/dashboard')}
            >
                Cancelar generación
            </Button>
        </div>
    );
};

export default GeminiSpinnerOverlay;