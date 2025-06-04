export const AstronomyLoader = () => (
  <div className="starry-sky-loader">
    {/* Cielo estrellado de fondo */}
    <div className="stars-background">
      {[...Array(150)].map((_, i) => (
        <div
          key={i}
          className="star-bg"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>

    {/* Cometa principal como loader */}
    <div className="comet-container">
      <div className="comet">
        <div className="comet-head"></div>
        <div className="comet-tail">
          <div className="tail-segment tail-1"></div>
          <div className="tail-segment tail-2"></div>
          <div className="tail-segment tail-3"></div>
          <div className="tail-segment tail-4"></div>
          <div className="tail-segment tail-5"></div>
        </div>
      </div>
    </div>

    {/* Contenido de texto */}
    <div className="content-overlay">
      <h2 className="society-title">
        Sociedad Malagueña de Astronomía
      </h2>

      {/* Indicador de progreso sutil */}
      <div className="cosmic-dots">
        <div className="dot dot-1"></div>
        <div className="dot dot-2"></div>
        <div className="dot dot-3"></div>
      </div>
    </div>

    <style jsx>{`
      .starry-sky-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 75%, #000000 100%);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }

      .stars-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      .star-bg {
        position: absolute;
        width: 2px;
        height: 2px;
        background: white;
        border-radius: 50%;
        animation: starTwinkle 3s infinite;
      }

      .star-bg:nth-child(3n) {
        width: 1px;
        height: 1px;
        background: #ccccff;
      }

      .star-bg:nth-child(5n) {
        width: 3px;
        height: 3px;
        background: #ffffcc;
        box-shadow: 0 0 4px #ffffcc;
      }

      .comet-container {
        position: absolute;
        width: 100%;
        height: 100%;
        animation: cometOrbit 8s linear infinite;
      }

      .comet {
        position: absolute;
        top: 20%;
        left: -100px;
        animation: cometFly 4s ease-in-out infinite;
      }

      .comet-head {
        width: 12px;
        height: 12px;
        background: radial-gradient(circle, #980100 0%, #ff6b6b 40%, #ffffff 100%);
        border-radius: 50%;
        box-shadow: 
          0 0 20px #980100,
          0 0 40px rgba(152, 1, 0, 0.6),
          0 0 60px rgba(152, 1, 0, 0.3);
        position: relative;
        z-index: 2;
      }

      .comet-tail {
        position: absolute;
        top: 6px;
        right: 12px;
        display: flex;
        align-items: center;
      }

      .tail-segment {
        height: 2px;
        background: linear-gradient(90deg, #980100, transparent);
        margin-left: -2px;
        border-radius: 1px;
        animation: tailFlow 0.8s ease-in-out infinite;
      }

      .tail-1 { width: 40px; animation-delay: 0s; }
      .tail-2 { width: 30px; animation-delay: 0.1s; opacity: 0.8; }
      .tail-3 { width: 20px; animation-delay: 0.2s; opacity: 0.6; }
      .tail-4 { width: 15px; animation-delay: 0.3s; opacity: 0.4; }
      .tail-5 { width: 10px; animation-delay: 0.4s; opacity: 0.2; }

      .content-overlay {
        text-align: center;
        z-index: 10;
        color: white;
        position: relative;
      }

      .society-title {
        font-size: 2.5rem;
        color: white;
        margin-bottom: 1.5rem;
        text-shadow: 
          0 0 10px rgba(152, 1, 0, 0.8),
          0 0 20px rgba(152, 1, 0, 0.4),
          2px 2px 4px rgba(0, 0, 0, 0.8);
        font-weight: 300;
      }

      .title-icon {
        display: inline-block;
        animation: iconPulse 2s ease-in-out infinite;
        margin-right: 0.5rem;
      }

      .loading-message {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        opacity: 0.9;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      }

      .cosmic-dots {
        display: flex;
        justify-content: center;
        gap: 8px;
      }

      .dot {
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        animation: dotPulse 1.5s ease-in-out infinite;
        box-shadow: 0 0 10px rgba(152, 1, 0, 0.6);
      }

      .dot-1 { animation-delay: 0s; }
      .dot-2 { animation-delay: 0.3s; }
      .dot-3 { animation-delay: 0.6s; }

      /* Animaciones */
      @keyframes starTwinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }

      @keyframes cometOrbit {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes cometFly {
        0% { 
          transform: translateX(-100px) translateY(0px);
          opacity: 0;
        }
        10% { opacity: 1; }
        50% { 
          transform: translateX(calc(100vw + 100px)) translateY(-50px);
          opacity: 1;
        }
        100% { 
          transform: translateX(calc(100vw + 200px)) translateY(-100px);
          opacity: 0;
        }
      }

      @keyframes tailFlow {
        0%, 100% { 
          opacity: 1;
          transform: scaleX(1); 
        }
        50% { 
          opacity: 0.7;
          transform: scaleX(1.2); 
        }
      }

      @keyframes iconPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      @keyframes dotPulse {
        0%, 100% { 
          opacity: 0.3; 
          transform: scale(1); 
        }
        50% { 
          opacity: 1; 
          transform: scale(1.3); 
        }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .society-title {
          font-size: 1.8rem;
        }
        
        .loading-message {
          font-size: 1rem;
        }
        
        .comet-head {
          width: 8px;
          height: 8px;
        }
        
        .tail-1 { width: 25px; }
        .tail-2 { width: 20px; }
        .tail-3 { width: 15px; }
        .tail-4 { width: 10px; }
        .tail-5 { width: 8px; }
      }
    `}</style>
  </div>
);
