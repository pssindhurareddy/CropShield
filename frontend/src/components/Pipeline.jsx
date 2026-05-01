function Pipeline({ isAnalysing, analysisStep }) {
  const steps = [
    'IoT Sensors',
    'Data Fusion',
    'CNN Analysis',
    'RF Classifier',
    'Treatment Plan'
  ];

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px'
      }}>
        {steps.map((step, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              background: (!isAnalysing && analysisStep === 0) || analysisStep > index ? 'var(--bg3)' :
                         analysisStep === index && isAnalysing ? 'rgba(0,230,118,0.15)' : 'var(--bg3)',
              border: `1px solid ${(!isAnalysing && analysisStep === 0) || analysisStep > index ? 'var(--border)' :
                           analysisStep === index && isAnalysing ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '11px',
              color: (!isAnalysing && analysisStep === 0) || analysisStep > index ? 'var(--text3)' :
                     analysisStep === index && isAnalysing ? 'var(--green)' : 'var(--text3)',
              transition: 'all 0.3s ease',
              position: 'relative',
              boxShadow: analysisStep === index && isAnalysing ? '0 0 12px rgba(0,230,118,0.4)' : 'none',
              animation: analysisStep === index && isAnalysing ? 'step-pulse 1s infinite' : 'none'
            }}>
              {analysisStep > index && (
                <span style={{
                  color: 'var(--green)',
                  marginRight: '4px',
                  fontSize: '12px'
                }}>✓</span>
              )}
              {step}
            </div>
            {index < steps.length - 1 && (
              <div style={{
                color: 'var(--text3)',
                fontSize: '14px',
                margin: '0 8px'
              }}>
                →
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes step-pulse {
          0%, 100% { box-shadow: 0 0 12px rgba(0,230,118,0.4); }
          50% { box-shadow: 0 0 20px rgba(0,230,118,0.8); }
        }
      `}</style>
    </div>
  );
}

export default Pipeline;