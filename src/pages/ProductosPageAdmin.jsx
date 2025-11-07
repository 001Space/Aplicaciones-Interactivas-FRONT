import React, { useMemo, useState } from 'react';
import { useDiscount } from '../context/DiscountContext';

// Simple, accessible discount wheel modal.
// Shows when `showWheel` is true in DiscountContext.
// Allows a single spin per session/user; persists via context.
const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(43,27,17,0.85)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
};

const modalStyle = {
  width: '92%', maxWidth: 520, background: '#fff', borderRadius: 20,
  boxShadow: '0 20px 40px rgba(43,27,17,0.4)', padding: 24,
  border: '2px solid #ffd700'
};

const headerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: 12
};

const titleStyle = { 
  fontSize: 24, 
  fontWeight: 900, 
  color: '#7b4b2a',
  textAlign: 'center',
  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
};

const textStyle = { 
  color: '#8b5a3c', 
  fontSize: 16, 
  marginBottom: 16,
  textAlign: 'center',
  fontWeight: 500
};

const wheelWrapStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '20px 0 28px', position: 'relative'
};

const wheelContainerStyle = {
  position: 'relative',
  width: 280,
  height: 280
};

const wheelStyle = (rotationDeg) => ({
  width: '100%', 
  height: '100%', 
  borderRadius: '50%', 
  border: '16px solid #ffd700',
  background: 'conic-gradient(from -90deg, #ff6b6b 0 25%, #4ecdc4 0 50%, #45b7d1 0 75%, #96ceb4 0 100%)',
  transition: 'transform 3s cubic-bezier(.17,.67,.83,.67)',
  transform: `rotate(${rotationDeg}deg)`,
  position: 'relative',
  boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
});

const pointerStyle = {
  position: 'absolute',
  top: -12,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 0, 
  height: 0, 
  borderLeft: '14px solid transparent', 
  borderRight: '14px solid transparent',
  borderBottom: '22px solid #e74c3c',
  zIndex: 10,
  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
};

const labelStyle = {
  position: 'absolute',
  fontWeight: 900,
  color: '#2c3e50',
  fontSize: 20,
  textShadow: '2px 2px 4px rgba(255,255,255,0.8)',
  zIndex: 2,
  backgroundColor: 'rgba(255,255,255,0.9)',
  borderRadius: '50%',
  width: '44px',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '3px solid #ffd700',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
};

const actionsStyle = { 
  display: 'flex', 
  gap: 12, 
  justifyContent: 'center',
  marginTop: 8
};

const primaryBtn = {
  background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
  color: '#fff', 
  border: 'none', 
  borderRadius: 12,
  padding: '14px 24px', 
  fontWeight: 800, 
  cursor: 'pointer',
  fontSize: 16,
  boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)',
  transition: 'all 0.3s ease'
};

const secondaryBtn = {
  background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
  color: '#fff', 
  border: 'none', 
  borderRadius: 12,
  padding: '14px 24px', 
  fontWeight: 700, 
  cursor: 'pointer',
  fontSize: 16,
  boxShadow: '0 4px 15px rgba(149, 165, 166, 0.3)',
  transition: 'all 0.3s ease'
};

const DiscountWheel = () => {
  const { showWheel, setShowWheel, setDiscount } = useDiscount();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotationDeg, setRotationDeg] = useState(0);

  if (!showWheel) return null;

  const options = [5, 10, 15, 20];
  const segAngle = useMemo(() => 360 / options.length, [options.length]);

  const spin = () => {
    if (spinning) return;
    setResult(null);
    setSpinning(true);
    const chosenIndex = Math.floor(Math.random() * options.length);
    const chosen = options[chosenIndex];

    // Más giros: 6-8 vueltas completas para más emoción
    const turns = 6 + Math.floor(Math.random() * 3);
    const targetCenterFromTop = chosenIndex * segAngle + segAngle / 2;
    const targetRotation = turns * 360 - targetCenterFromTop;

    requestAnimationFrame(() => setRotationDeg(targetRotation));

    setTimeout(() => {
      setSpinning(false);
      setResult(chosen);
      setDiscount(chosen);
    }, 3000); // Más tiempo para la animación extendida
  };

  const close = () => setShowWheel(false);

  // Posiciones mejor centradas en el medio de cada segmento
  const labelPositions = [
    { top: '22%', left: '72%', transform: 'translate(-50%, -50%)' }, // 5% - segmento superior-derecho
    { top: '72%', right: '22%', transform: 'translate(50%, -50%)' }, // 10% - segmento inferior-derecho
    { bottom: '22%', left: '28%', transform: 'translate(-50%, 50%)' }, // 15% - segmento inferior-izquierdo
    { top: '28%', left: '22%', transform: 'translate(-50%, -50%)' }  // 20% - segmento superior-izquierdo
  ];

  // Efectos hover para botones
  const primaryBtnHover = {
    ...primaryBtn,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(231, 76, 60, 0.6)'
  };

  const secondaryBtnHover = {
    ...secondaryBtn,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(149, 165, 166, 0.5)'
  };

  const [primaryBtnStyle, setPrimaryBtnStyle] = useState(primaryBtn);
  const [secondaryBtnStyle, setSecondaryBtnStyle] = useState(secondaryBtn);

  return (
    <div style={overlayStyle}>
      <div style={modalStyle} role="dialog" aria-modal="true" aria-labelledby="discount-wheel-title">
        <div style={headerStyle}>
          <div style={{width: '100%'}}>
            <div id="discount-wheel-title" style={titleStyle}>🎯 GIRA Y GANA DESCUENTOS 🎯</div>
          </div>
          <button 
            aria-label="Cerrar" 
            onClick={close} 
            style={{ 
              ...secondaryBtn, 
              padding: '8px 12px',
              fontSize: '18px',
              background: 'linear-gradient(135deg, #e74c3c, #c0392b)'
            }}
            onMouseEnter={() => setSecondaryBtnStyle(secondaryBtnHover)}
            onMouseLeave={() => setSecondaryBtnStyle(secondaryBtn)}
          >
            ✕
          </button>
        </div>
        
        <div style={textStyle}>
          🎊 ¡Una oportunidad por sesión! Tu descuento se aplica automáticamente al carrito. 🎊
        </div>

        <div style={wheelWrapStyle}>
          <div style={wheelContainerStyle}>
            <div style={pointerStyle} />
            <div style={wheelStyle(rotationDeg)} aria-hidden>
              {/* Labels INSIDE the rotating wheel - mejor centrados */}
              {options.map((opt, i) => (
                <div 
                  key={opt + '-' + i} 
                  style={{
                    ...labelStyle,
                    ...labelPositions[i]
                  }}
                >
                  {opt}%
                </div>
              ))}
            </div>
          </div>
        </div>

        {result != null && (
          <div style={{ 
            textAlign: 'center', 
            fontWeight: 900, 
            margin: '16px 0 20px', 
            color: '#e74c3c',
            fontSize: '22px',
            textShadow: '1px 1px 3px rgba(0,0,0,0.2)',
            background: 'linear-gradient(135deg, #ffeaa7, #fab1a0)',
            padding: '12px',
            borderRadius: '12px',
            border: '3px solid #ffd700'
          }}>
            🎉 ¡FELICITACIONES! 🎉<br/>
            <span style={{fontSize: '26px'}}>{result}% OFF</span>
          </div>
        )}

        <div style={actionsStyle}>
          <button 
            onClick={close} 
            style={secondaryBtnStyle}
            disabled={spinning}
            onMouseEnter={() => !spinning && setSecondaryBtnStyle(secondaryBtnHover)}
            onMouseLeave={() => setSecondaryBtnStyle(secondaryBtn)}
          >
            {spinning ? '⌛' : 'Cerrar'}
          </button>
          <button 
            onClick={spin} 
            style={primaryBtnStyle}
            disabled={spinning}
            onMouseEnter={() => !spinning && setPrimaryBtnStyle(primaryBtnHover)}
            onMouseLeave={() => setPrimaryBtnStyle(primaryBtn)}
          >
            {spinning ? '🌀 Girando...' : result != null ? '🔄 Volver a Jugar' : '🎡 ¡GIRAR AHORA!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountWheel;