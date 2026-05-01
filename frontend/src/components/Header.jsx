import { useState, useEffect } from 'react';

function Header({ deviceConnected, packetCount }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(20px)',
      background: 'rgba(5, 15, 7, 0.95)',
      borderBottom: '1px solid var(--border)',
      padding: '0.9rem 2.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-display)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: 800,
        fontSize: '1.4rem'
      }}>
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6L9,6C11,8 13,10 15,10C15.5,10 16,9.5 16,9C16,8.5 15.5,8 15,8C13.5,8 12,7 12,7C12,7 12.5,8 13,8C14,8 15,7 15,7C15,7 14.5,6 13,6C12,6 11,6.5 11,7C11,7.5 11.5,8 12,8C13,8 14,7.5 14,7C14,6.5 13.5,6 13,6C12.5,6 12,6.5 12,7C12,7.5 12.5,8 13,8C14,8 15,7.5 15,7C15,6.5 14.5,6 14,6C13.5,6 13,6.5 13,7C13,7.5 13.5,8 14,8C15,8 16,7.5 16,7C16,6.5 15.5,6 15,6C14.5,6 14,6.5 14,7C14,7.5 14.5,8 15,8C16,8 17,7.5 17,7C17,6.5 16.5,6 16,6C15.5,6 15,6.5 15,7C15,7.5 15.5,8 16,8C17,8 18,7.5 18,7C18,6.5 17.5,6 17,6C16.5,6 16,6.5 16,7C16,7.5 16.5,8 17,8Z"/>
        </svg>
        <span style={{ color: 'var(--text)' }}>Crop</span>
        <span style={{ color: 'var(--green)' }}>Shield</span>
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        letterSpacing: '4px',
        color: 'var(--text3)',
        textTransform: 'uppercase'
      }}>
        SMART PLANT HEALTH MONITORING
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        padding: '6px 12px',
        borderRadius: '20px',
        background: 'var(--bg3)',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: deviceConnected ? 'var(--green)' : 'var(--red)',
          animation: deviceConnected ? 'pulse 2s infinite' : 'none'
        }}></div>
        <span>{deviceConnected ? 'ESP32 CONNECTED' : 'ESP32 OFFLINE'}</span>
        <span style={{
          fontSize: '10px',
          color: 'var(--text3)',
          marginLeft: '8px'
        }}>
          {packetCount} PACKETS
        </span>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </header>
  );
}

export default Header;