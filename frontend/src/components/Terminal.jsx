import { useEffect, useRef } from 'react';

function Terminal({ logs }) {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div style={{
      flex: 1,
      background: '#020a03',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        background: 'var(--bg3)',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '10px',
        color: 'var(--text3)'
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--green)',
          animation: 'pulse 2s infinite'
        }}></div>
        SERIAL MONITOR · 115200 BAUD · COM3
      </div>

      <div
        ref={terminalRef}
        style={{
          flex: 1,
          padding: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          lineHeight: '1.4',
          overflowY: 'auto',
          color: 'var(--text2)'
        }}
      >
        {logs.map((log, index) => (
          <div key={index} style={{
            marginBottom: '2px',
            color: log.type === 'ok' ? 'var(--green)' :
                   log.type === 'warn' ? 'var(--amber)' :
                   log.type === 'err' ? 'var(--red)' : 'var(--text3)'
          }}>
            {log.time && `[${log.time}] `}{log.message}
          </div>
        ))}
        <div style={{
          display: 'inline-block',
          width: '8px',
          height: '14px',
          background: 'var(--green)',
          animation: 'blink 1s infinite'
        }}></div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default Terminal;