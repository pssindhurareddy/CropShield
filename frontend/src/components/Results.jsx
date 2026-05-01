import { useEffect, useState } from 'react';

function Results({ result }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (result) {
      setAnimated(true);
    } else {
      setAnimated(false);
    }
  }, [result]);

  if (!result) return null;

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'var(--red)';
      case 'high': return 'var(--amber)';
      case 'moderate': return 'var(--teal)';
      case 'healthy': return 'var(--green)';
      default: return 'var(--green)';
    }
  };

  const getWellnessColor = (score) => {
    if (score > 70) return 'var(--green)';
    if (score > 40) return 'var(--amber)';
    return 'var(--red)';
  };

  return (
    <div style={{
      opacity: animated ? 1 : 0,
      transform: animated ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px'
    }}>
      {/* CNN Visual Diagnosis */}
      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px'
      }}>
        <div style={{
          fontSize: '10px',
          color: 'var(--green)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}>
          CNN · VISUAL DIAGNOSIS
        </div>

        {result.diseases.map((disease, index) => (
          <div key={index} style={{ marginBottom: index < result.diseases.length - 1 ? '8px' : '0' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '12px'
            }}>
              <span>{disease.name}</span>
              <span style={{ color: disease.color }}>
                {(disease.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{
              height: '6px',
              background: 'var(--bg4)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                borderRadius: '3px',
                background: disease.color,
                width: animated ? `${disease.confidence * 100}%` : '0%',
                transition: `width 1.2s cubic-bezier(.4,0,.2,1) ${index * 200}ms`
              }}></div>
            </div>
          </div>
        ))}

        <div style={{
          display: 'inline-block',
          fontSize: '10px',
          padding: '4px 8px',
          borderRadius: '12px',
          marginTop: '8px',
          background: getSeverityColor(result.severity),
          color: result.severity.toLowerCase() === 'high' || result.severity.toLowerCase() === 'moderate' ? 'var(--bg)' : 'white'
        }}>
          {result.severity.toUpperCase()}
        </div>
      </div>

      {/* Wellness Score */}
      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px'
      }}>
        <div style={{
          fontSize: '10px',
          color: 'var(--green)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}>
          RANDOM FOREST · WELLNESS
        </div>

        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto 12px',
          position: 'relative'
        }}>
          <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="var(--bg4)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={getWellnessColor(result.wellnessScore)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={animated ? 283 - (result.wellnessScore / 100) * 283 : 283}
              style={{
                transition: 'stroke-dashoffset 1.4s ease'
              }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            fontWeight: 800,
            color: 'var(--text)'
          }}>
            {result.wellnessScore}
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text2)'
        }}>
          {result.wellnessLabel}
        </div>
      </div>

      {/* Treatment Plan */}
      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px'
      }}>
        <div style={{
          fontSize: '10px',
          color: 'var(--green)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}>
          TREATMENT RECOMMENDATION
        </div>

        {result.treatments.map((treatment, index) => (
          <div key={index} style={{
            marginBottom: index < result.treatments.length - 1 ? '12px' : '0'
          }}>
            <div style={{
              fontSize: '12px',
              marginBottom: '2px'
            }}>
              <span style={{ color: 'var(--green)' }}>●</span> {treatment.text}
            </div>
            <div style={{
              fontSize: '10px',
              color: 'var(--text3)'
            }}>
              {treatment.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Results;