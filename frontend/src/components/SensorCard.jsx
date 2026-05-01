import { useEffect, useRef } from 'react';

function SensorCard({ name, value, unit, min, max, idealMin, idealMax, color }) {
  const prevValueRef = useRef(value);
  const valueRef = useRef(null);

  useEffect(() => {
    if (prevValueRef.current !== value && valueRef.current) {
      valueRef.current.style.color = 'var(--green)';
      const timer = setTimeout(() => {
        if (valueRef.current) {
          valueRef.current.style.color = 'var(--text)';
        }
      }, 600);
      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  const getStatus = () => {
    if (value === null || value === undefined) return 'optimal';
    const range = max - min;
    const tolerance = range * 0.15;

    if (value >= idealMin - tolerance && value <= idealMax + tolerance) {
      return 'optimal';
    } else if (value >= idealMin - tolerance * 2 && value <= idealMax + tolerance * 2) {
      return 'warning';
    } else {
      return 'alert';
    }
  };

  const status = getStatus();
  const percentage = value === null || value === undefined ? 50 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div style={{
      background: 'var(--bg3)',
      border: `1px solid ${status === 'alert' ? 'var(--red)' : status === 'warning' ? 'var(--amber)' : 'var(--border)'}`,
      borderRadius: '10px',
      padding: '14px',
      transition: 'all 0.3s ease',
      boxShadow: status === 'alert' ? '0 0 16px rgba(255,23,68,0.25)' : 'none',
      animation: status === 'alert' ? 'alert-glow 2s infinite' : 'none'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '10px',
          color: 'var(--text3)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {name}
        </div>
        <div style={{
          fontSize: '8px',
          padding: '2px 6px',
          borderRadius: '8px',
          background: status === 'optimal' ? 'var(--green)' :
                     status === 'warning' ? 'var(--amber)' : 'var(--red)',
          color: status === 'warning' ? 'var(--bg)' : 'white',
          fontWeight: 500
        }}>
          {status.toUpperCase()}
        </div>
      </div>

      <div style={{
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--text)',
        transition: 'color 0.6s ease',
        marginBottom: '8px'
      }} ref={valueRef}>
        {value === null || value === undefined ? '--' : value.toFixed(1)}
        {unit && <span style={{
          fontSize: '12px',
          color: 'var(--green)',
          marginLeft: '4px'
        }}>{unit}</span>}
      </div>

      <div style={{
        height: '5px',
        background: 'var(--bg4)',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          borderRadius: '3px',
          background: color,
          width: `${percentage}%`,
          transition: 'width 0.8s ease'
        }}></div>
      </div>

      <style jsx>{`
        @keyframes alert-glow {
          0%, 100% { box-shadow: 0 0 16px rgba(255,23,68,0.25); }
          50% { box-shadow: 0 0 24px rgba(255,23,68,0.4); }
        }
      `}</style>
    </div>
  );
}

export default SensorCard;