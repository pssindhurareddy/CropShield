import SensorCard from './SensorCard.jsx';

function SensorGrid({ sensorData }) {
  const sensors = [
    { key: 'soilTemp', name: 'SOIL TEMP', unit: '°C', min: 15, max: 40, idealMin: 20, idealMax: 32, color: '#00e676' },
    { key: 'soilMoist', name: 'MOISTURE', unit: '%', min: 20, max: 90, idealMin: 45, idealMax: 75, color: '#40c4ff' },
    { key: 'ph', name: 'PH LEVEL', unit: '', min: 5, max: 8.5, idealMin: 5.8, idealMax: 7.2, color: '#ea80fc' },
    { key: 'nitrogen', name: 'NITROGEN', unit: 'ppm', min: 10, max: 100, idealMin: 30, idealMax: 80, color: '#ffab00' },
    { key: 'airHumidity', name: 'AIR HUMID', unit: '%', min: 20, max: 95, idealMin: 50, idealMax: 80, color: '#00e5c0' },
    { key: 'airTemp', name: 'AIR TEMP', unit: '°C', min: 15, max: 42, idealMin: 22, idealMax: 34, color: '#ff6d00' }
  ];

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px'
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: 'var(--green)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '4px'
      }}>
        LIVE IoT FEED
      </div>
      <div style={{
        fontSize: '10px',
        color: 'var(--text3)',
        marginBottom: '16px'
      }}>
        ESP32-CropShield-01 · 2s interval
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        {sensors.map(sensor => (
          <SensorCard
            key={sensor.key}
            name={sensor.name}
            value={sensorData ? sensorData[sensor.key] : null}
            unit={sensor.unit}
            min={sensor.min}
            max={sensor.max}
            idealMin={sensor.idealMin}
            idealMax={sensor.idealMax}
            color={sensor.color}
          />
        ))}
      </div>
    </div>
  );
}

export default SensorGrid;