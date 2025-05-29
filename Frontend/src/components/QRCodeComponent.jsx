import { useEffect, useRef } from 'react';

function QRCodeComponent({ text }) {
  const canvasRef = useRef(null);
  const logoSizeRatio = 0.25;

  useEffect(() => {
    const canvas = canvasRef.current;

    // Crear QR con QRious
    const qr = new window.QRious({
      element: canvas,
      value: text,
      size: 200,
      background: 'white',
      foreground: 'black',
    });
  }, [text]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'codigo-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center">
      {/* QR */}
      <div>
        <canvas ref={canvasRef} />
      </div>

      {/* Botón de descarga */}
      <div style={{ marginTop: '8px' }}>
        <button
          onClick={downloadQR}
          className="px-4 py-2"
          style={{backgroundColor: '#980100', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
        >
          Descargar QR
        </button>
      </div>
    </div>
  );
}

export default QRCodeComponent;
