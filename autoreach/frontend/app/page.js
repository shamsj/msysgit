'use client';

import { useState, useRef } from 'react';
import './globals.css';

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      const res = await fetch('/api/listings/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  function getConfidenceClass(confidence) {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.5) return 'confidence-medium';
    return 'confidence-low';
  }

  function reset() {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="container">
      <div className="header">
        <h1>AutoReach</h1>
        <p>Upload your car photo. Get competing offers from dealers.</p>
      </div>

      {!result ? (
        <>
          <div
            className={`upload-area ${preview ? 'has-image' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Car preview" />
            ) : (
              <>
                <div className="upload-icon">📸</div>
                <p style={{ fontSize: '16px', fontWeight: 600 }}>
                  Tap to upload a photo of your car
                </p>
                <p style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
                  JPG, PNG, or WebP up to 10MB
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {preview && (
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Identifying your vehicle...
                </>
              ) : (
                'Identify My Car'
              )}
            </button>
          )}

          {error && <div className="error-message">{error}</div>}
        </>
      ) : (
        <>
          <div className="vehicle-card">
            <h2>
              {result.vehicle.year} {result.vehicle.make} {result.vehicle.model}
            </h2>

            {preview && (
              <img
                src={preview}
                alt="Your car"
                style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }}
              />
            )}

            <div className="vehicle-detail">
              <span className="label">Make</span>
              <span className="value">{result.vehicle.make}</span>
            </div>
            <div className="vehicle-detail">
              <span className="label">Model</span>
              <span className="value">{result.vehicle.model}</span>
            </div>
            <div className="vehicle-detail">
              <span className="label">Year</span>
              <span className="value">{result.vehicle.year}</span>
            </div>
            {result.vehicle.trim && (
              <div className="vehicle-detail">
                <span className="label">Trim</span>
                <span className="value">{result.vehicle.trim}</span>
              </div>
            )}
            <div className="vehicle-detail">
              <span className="label">Condition</span>
              <span className="value">{result.vehicle.condition}</span>
            </div>
            <div className="vehicle-detail">
              <span className="label">Color</span>
              <span className="value">{result.vehicle.color}</span>
            </div>
            <div className="vehicle-detail">
              <span className="label">Est. Mileage</span>
              <span className="value">{result.vehicle.estimated_mileage}</span>
            </div>
            <div className="vehicle-detail">
              <span className="label">AI Confidence</span>
              <span
                className={`confidence-badge ${getConfidenceClass(
                  result.vehicle.confidence
                )}`}
              >
                {Math.round(result.vehicle.confidence * 100)}%
              </span>
            </div>
          </div>

          <p
            style={{
              textAlign: 'center',
              color: '#666',
              marginTop: '16px',
              fontSize: '14px',
            }}
          >
            Your listing is now live! Dealers will start submitting offers.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => window.location.href = `/listing/${result.id}`}
            style={{ marginTop: '12px' }}
          >
            View Offers Dashboard
          </button>

          <button
            className="btn"
            onClick={reset}
            style={{
              marginTop: '8px',
              background: 'white',
              border: '1px solid #ddd',
              color: '#666',
            }}
          >
            Upload Another Car
          </button>
        </>
      )}
    </div>
  );
}
