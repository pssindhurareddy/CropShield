import { useRef, useState, useEffect } from 'react';

function UploadPanel({ imageFile, setImageFile }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (imageFile instanceof File) {
      const url = URL.createObjectURL(imageFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof imageFile === 'string') {
      setPreview(imageFile);
    } else {
      setPreview(null);
    }
  }, [imageFile]);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      setImageFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleClick = () => {
    if (imageFile) {
      setImageFile(null);
    } else {
      fileInputRef.current?.click();
    }
  };

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
        VISION AI · LEAF ANALYSIS
      </div>
      <div style={{
        fontSize: '10px',
        color: 'var(--text3)',
        marginBottom: '16px'
      }}>
        CNN-powered disease detection
      </div>

      {imageFile ? (
        <div>
          <img
            src={preview}
            alt="Leaf preview"
            style={{
              width: '100%',
              borderRadius: '8px',
              marginBottom: '12px',
              cursor: 'pointer'
            }}
            onClick={handleClick}
          />
          <div style={{
            fontSize: '12px',
            color: 'var(--green)',
            textAlign: 'center'
          }}>
            IMAGE CAPTURED · READY FOR CNN INFERENCE
          </div>
        </div>
      ) : (
        <div
          style={{
            border: '2px dashed var(--border2)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <svg
            viewBox="0 0 24 24"
            width="48"
            height="48"
            fill="currentColor"
            style={{
              color: 'var(--green)',
              margin: '0 auto 16px',
              opacity: 0.6
            }}
          >
            <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <div style={{
            fontSize: '16px',
            marginBottom: '4px'
          }}>
            Upload leaf image to begin CNN analysis
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text3)'
          }}>
            Drag & drop or click · JPG PNG supported
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </div>
  );
}

export default UploadPanel;