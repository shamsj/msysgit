'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import '../../globals.css';

export default function ListingPage() {
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchListing();
    fetchOffers();
    // Poll for new offers every 10 seconds
    const interval = setInterval(fetchOffers, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchListing() {
    try {
      const res = await fetch(`/api/listings/${params.id}`);
      if (!res.ok) throw new Error('Listing not found');
      setListing(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOffers() {
    try {
      const res = await fetch(`/api/listings/${params.id}/offers`);
      if (res.ok) {
        setOffers(await res.json());
      }
    } catch (err) {
      // silently fail on poll
    }
  }

  async function acceptOffer(offerId) {
    try {
      await fetch(`/api/listings/${params.id}/offers/${offerId}/accept`, {
        method: 'POST',
      });
      fetchListing();
      fetchOffers();
    } catch (err) {
      setError('Failed to accept offer');
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <span className="spinner" style={{ borderTopColor: '#2563eb', borderColor: '#e5e7eb' }} />
        <p style={{ marginTop: '12px', color: '#666' }}>Loading listing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>AutoReach</h1>
        <p>Offers Dashboard</p>
      </div>

      {listing && (
        <div className="vehicle-card">
          <h2>
            {listing.year} {listing.make} {listing.model}
          </h2>
          <div className="vehicle-detail">
            <span className="label">Condition</span>
            <span className="value">{listing.condition}</span>
          </div>
          <div className="vehicle-detail">
            <span className="label">Color</span>
            <span className="value">{listing.color}</span>
          </div>
          <div className="vehicle-detail">
            <span className="label">Status</span>
            <span className="status-badge">{listing.status}</span>
          </div>
        </div>
      )}

      <div className="offers-section">
        <h3 style={{ marginBottom: '12px' }}>
          Dealer Offers ({offers.length})
        </h3>

        {offers.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: 'white',
              borderRadius: '12px',
              color: '#999',
            }}
          >
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</p>
            <p>No offers yet. Dealers are reviewing your listing.</p>
          </div>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="offer-card">
              <div>
                <div className="offer-amount">
                  ${Number(offer.amount).toLocaleString()}
                </div>
                <div className="offer-dealer">{offer.dealer_name}</div>
                {offer.message && (
                  <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                    {offer.message}
                  </p>
                )}
              </div>
              <div>
                {offer.status === 'pending' && listing?.status !== 'sold' ? (
                  <button
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '10px 20px', marginTop: 0 }}
                    onClick={() => acceptOffer(offer.id)}
                  >
                    Accept
                  </button>
                ) : (
                  <span
                    className="status-badge"
                    style={
                      offer.status === 'accepted'
                        ? { background: '#dcfce7', color: '#166534' }
                        : {}
                    }
                  >
                    {offer.status}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="btn"
        onClick={() => (window.location.href = '/')}
        style={{
          marginTop: '24px',
          background: 'white',
          border: '1px solid #ddd',
          color: '#666',
        }}
      >
        ← Back to Upload
      </button>
    </div>
  );
}
