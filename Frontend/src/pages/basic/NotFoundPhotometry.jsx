import React, { useEffect, useRef } from 'react';

/**
 * Página temporal mostrada mientras se calibran y validan los datos
 * fotométricos de un bólido antes de generar el informe científico.
 *
 * Paleta:
 *  --void     #05070c  fondo
 *  --panel    #0c1220  paneles
 *  --line     rgba(255,255,255,.08)  bordes/hairlines
 *  --text     #eef2f8  texto principal
 *  --text-dim #8592a8  texto secundario
 *  --brand    #980100  acento activo / marca (calibración en curso)
 *  --paper    #f8f9fa  texto y estados completados
 *
 * Tipografía:
 *  Display -> Space Grotesk (titular técnico)
 *  Cuerpo  -> Inter
 *  Datos   -> IBM Plex Mono (telemetría / panel de estado)
 */

const STATUS_ITEMS = [
  { label: 'Detección del evento', state: 'done' },
  { label: 'Sincronización temporal', state: 'done' },
  { label: 'Extracción de fotogramas', state: 'done' },
  { label: 'Ajuste de curva de luz', state: 'active' },
  { label: 'Cálculo de magnitud', state: 'active' },
  { label: 'Generación del informe PDF', state: 'pending' },
];

const PROGRESS = 62;

// Curva de luz sintética de un bólido: subida abrupta y caída exponencial
const CURVE_PATH =
  'M 10,150 C 40,148 65,146 90,140 C 115,132 130,60 150,32 C 165,12 175,8 185,10 ' +
  'C 205,14 215,55 235,90 C 260,132 300,150 340,154 C 400,158 470,160 560,160';

const PhotometryReportReview = () => {
  const pathRef = useRef(null);
  const dotRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const dot = dotRef.current;
    const glow = glowRef.current;
    if (!path || !dot) return;

    const length = path.getTotalLength();
    const duration = 4400;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      const p = path.getPointAtLength(length * 0.42);
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      if (glow) {
        glow.setAttribute('cx', p.x);
        glow.setAttribute('cy', p.y);
      }
      return;
    }

    let raf;
    let start;
    const step = (ts) => {
      if (start === undefined) start = ts;
      const t = ((ts - start) % duration) / duration;
      const p = path.getPointAtLength(t * length);
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      if (glow) {
        glow.setAttribute('cx', p.x);
        glow.setAttribute('cy', p.y);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="prr-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500&display=swap');

        .prr-root {
          --void: #05070c;
          --panel: #0c1220;
          --line: rgba(255,255,255,0.08);
          --text: #f8f9fa;
          --text-dim: rgba(248,249,250,0.55);
          --brand: #980100;
          --brand-dim: rgba(152,1,0,0.35);
          --paper: #f8f9fa;

          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--void);
          color: var(--text);
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          box-sizing: border-box;
          padding: 3rem 1.25rem;
        }

        .prr-root *, .prr-root *::before, .prr-root *::after {
          box-sizing: border-box;
        }

        /* --- fondo: estrellas + nebulosa sutil --- */
        .prr-sky {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(1.5px 1.5px at 12% 22%, rgba(255,255,255,.8) 50%, transparent 51%),
            radial-gradient(1px 1px at 28% 68%, rgba(255,255,255,.6) 50%, transparent 51%),
            radial-gradient(1.5px 1.5px at 44% 12%, rgba(255,255,255,.7) 50%, transparent 51%),
            radial-gradient(1px 1px at 62% 78%, rgba(255,255,255,.5) 50%, transparent 51%),
            radial-gradient(1.5px 1.5px at 76% 34%, rgba(255,255,255,.8) 50%, transparent 51%),
            radial-gradient(1px 1px at 85% 58%, rgba(255,255,255,.6) 50%, transparent 51%),
            radial-gradient(1.5px 1.5px at 92% 15%, rgba(255,255,255,.7) 50%, transparent 51%),
            radial-gradient(1px 1px at 8% 85%, rgba(255,255,255,.5) 50%, transparent 51%),
            radial-gradient(1px 1px at 55% 45%, rgba(255,255,255,.5) 50%, transparent 51%);
          background-repeat: repeat;
          background-size: 380px 380px;
          opacity: .8;
        }

        .prr-nebula {
          position: absolute;
          inset: -10%;
          background:
            radial-gradient(38rem 24rem at 18% 12%, rgba(152,1,0,0.16), transparent 60%),
            radial-gradient(42rem 30rem at 85% 82%, rgba(152,1,0,0.10), transparent 60%);
          filter: blur(2px);
          animation: prr-drift 26s ease-in-out infinite alternate;
        }

        @keyframes prr-drift {
          from { transform: translate3d(0,0,0) scale(1); }
          to   { transform: translate3d(-1.5%, 1%, 0) scale(1.03); }
        }

        .prr-content {
          position: relative;
          z-index: 1;
          width: min(720px, 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        /* --- cabecera: eyebrow + id --- */
        .prr-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: .6rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: .72rem;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--text-dim);
        }

        .prr-eyebrow .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
          box-shadow: 0 0 8px 1px var(--brand);
          animation: prr-pulse 1.8s ease-in-out infinite;
        }

        .prr-id {
          margin-top: .6rem;
          font-family: 'IBM Plex Mono', monospace;
          font-variant-numeric: tabular-nums;
          font-size: .95rem;
          letter-spacing: .1em;
          color: var(--brand);
        }

        .prr-headline {
          margin: .9rem 0 0;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: clamp(2.2rem, 5.4vw, 3.4rem);
          line-height: 1.05;
          letter-spacing: -.01em;
          text-transform: uppercase;
        }

        .prr-body {
          margin-top: 1.1rem;
          max-width: 46rem;
          font-size: 1.05rem;
          line-height: 1.65;
          color: var(--text-dim);
        }

        .prr-body strong {
          color: var(--text);
          font-weight: 500;
        }

        /* --- tarjeta: curva de luz --- */
        .prr-curve-card {
          margin-top: 2.4rem;
          width: 100%;
          background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0));
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 1.1rem 1.2rem .8rem;
        }

        .prr-curve-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'IBM Plex Mono', monospace;
          font-size: .72rem;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: .4rem;
        }

        .prr-curve-head span.live {
          color: var(--brand);
        }

        .prr-curve-svg {
          width: 100%;
          height: auto;
          display: block;
        }

        .prr-axis-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          fill: var(--text-dim);
          letter-spacing: .05em;
        }

        /* --- panel de estado --- */
        .prr-status-panel {
          margin-top: 1.6rem;
          width: 100%;
          text-align: left;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
        }

        .prr-status-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: .95rem 1.2rem;
          border-bottom: 1px solid var(--line);
        }

        .prr-status-top .label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: .75rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--text-dim);
        }

        .prr-status-top .value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: .8rem;
          letter-spacing: .1em;
          color: var(--brand);
        }

        .prr-progress-track {
          height: 3px;
          width: 100%;
          background: rgba(255,255,255,.06);
        }

        .prr-progress-fill {
          height: 100%;
          width: ${PROGRESS}%;
          background: linear-gradient(90deg, var(--brand), var(--paper));
          box-shadow: 0 0 10px var(--brand-dim);
          transition: width .6s ease;
        }

        .prr-status-list {
          padding: .5rem .4rem;
        }

        .prr-status-row {
          display: flex;
          align-items: center;
          gap: .7rem;
          padding: .6rem .8rem;
          border-radius: 8px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: .88rem;
          color: var(--text-dim);
          transition: background .2s ease;
        }

        .prr-status-row:hover {
          background: rgba(255,255,255,.03);
        }

        .prr-status-row.done { color: var(--text); }
        .prr-status-row.active { color: var(--text); }

        .prr-icon {
          flex: 0 0 auto;
          width: 1.1rem;
          text-align: center;
        }

        .prr-status-row.done .prr-icon { color: var(--paper); }
        .prr-status-row.active .prr-icon {
          color: var(--brand);
          animation: prr-pulse 1.4s ease-in-out infinite;
        }
        .prr-status-row.pending .prr-icon { color: var(--text-dim); opacity: .6; }

        @keyframes prr-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .35; }
        }

        .prr-quote {
          margin-top: 1.9rem;
          max-width: 34rem;
          font-family: 'Space Grotesk', sans-serif;
          font-style: italic;
          font-weight: 500;
          font-size: 1rem;
          color: var(--text-dim);
        }

        .prr-cta {
          margin-top: 1.8rem;
          display: inline-flex;
          align-items: center;
          gap: .6rem;
          padding: .85rem 1.7rem;
          border-radius: 999px;
          border: 1px solid var(--brand-dim);
          background: transparent;
          color: var(--brand);
          font-family: 'IBM Plex Mono', monospace;
          font-size: .85rem;
          letter-spacing: .06em;
          text-decoration: none;
          text-transform: uppercase;
          transition: background .25s ease, color .25s ease, transform .25s ease, box-shadow .25s ease;
        }

        .prr-cta:hover {
          background: var(--brand);
          color: var(--paper);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(152,1,0,.35);
        }

        .prr-cta .arrow {
          transition: transform .25s ease;
        }
        .prr-cta:hover .arrow {
          transform: translateX(3px);
        }

        @media (max-width: 640px) {
          .prr-headline { font-size: clamp(1.7rem, 8vw, 2.4rem); }
          .prr-body { font-size: .95rem; }
          .prr-curve-card, .prr-status-panel { border-radius: 12px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .prr-nebula { animation: none; }
          .prr-eyebrow .dot,
          .prr-status-row.active .prr-icon { animation: none; }
        }
      `}</style>

      <div className="prr-sky" />
      <div className="prr-nebula" />

      <div className="prr-content">
        <div className="prr-eyebrow">
          <span className="dot" />
          Red de vigilancia de bólidos
        </div>

        <h1 className="prr-headline">Informe en revisión</h1>

        <p className="prr-body">
          El evento ha sido detectado correctamente. Los datos fotométricos del{' '}
          <strong>bólido</strong> están siendo calibrados y validados antes de
          generar el informe científico.
        </p>

        {/* Curva de luz: elemento distintivo de la página */}
        <div className="prr-curve-card">
          <div className="prr-curve-head">
            <span>Curva de luz · ajuste en curso</span>
            <span className="live">● live</span>
          </div>
          <svg
            className="prr-curve-svg"
            viewBox="0 0 570 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* rejilla */}
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="10"
                x2="560"
                y1={30 + i * 40}
                y2={30 + i * 40}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            ))}
            <line x1="10" x2="10" y1="10" y2="164" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
            <line x1="10" x2="560" y1="164" y2="164" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />

            <text x="14" y="22" className="prr-axis-label">Δm</text>
            <text x="530" y="178" className="prr-axis-label">t (s)</text>

            <path
              ref={pathRef}
              d={CURVE_PATH}
              stroke="#980100"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 6px rgba(152,1,0,.65))' }}
            />
            <circle ref={glowRef} r="9" fill="rgba(152,1,0,0.25)" />
            <circle ref={dotRef} r="3.5" fill="#f8f9fa" />
          </svg>
        </div>


        <p className="prr-quote">
          «La ciencia requiere tiempo… incluso para los meteoros más rápidos.»
        </p>

        <a href="/" className="prr-cta">
          Volver al centro de control
          <span className="arrow">→</span>
        </a>
      </div>
    </div>
  );
};

export default PhotometryReportReview;