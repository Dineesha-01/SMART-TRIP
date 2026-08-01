import React from 'react';
import { CheckSquare, Trash2, MapPin, Star, Eye, Navigation, Plus, ExternalLink } from 'lucide-react';

export default function SelectedPlacesView({ selectedPlaces, onRemovePlace, onSelectPlaceDetail, onOpenPlacesTab }) {
  const calculateCategoryTotal = (cat) => {
    return selectedPlaces.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header Summary Card */}
      <div className="card-elevated" style={{ padding: '1.5rem 1.75rem', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px', height: '42px',
              background: 'var(--blue-600)',
              borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', flexShrink: 0,
            }}>
              <CheckSquare size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Selected Places ({selectedPlaces.length})
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                Attractions, hotels, restaurants, and spots added to your trip itinerary
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-blue">Attractions: {calculateCategoryTotal('Attraction')}</span>
            <span className="badge badge-blue">Hotels: {calculateCategoryTotal('Hotel')}</span>
            <span className="badge badge-blue">Restaurants: {calculateCategoryTotal('Restaurant')}</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {selectedPlaces.length === 0 ? (
        <div className="card-elevated" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'white' }}>
          <MapPin size={48} color="var(--blue-600)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>No Places Selected Yet</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
            Browse nearby attractions, hotels, and restaurants in the "Nearby Places" tab and click "Add to Trip" to build your itinerary.
          </p>
          <button onClick={onOpenPlacesTab} className="btn btn-primary">
            + Explore & Add Places
          </button>
        </div>
      ) : (
        /* Selected Places Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {selectedPlaces.map((place) => (
            <div
              key={place.id}
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                borderColor: 'var(--blue-600)',
                background: 'white',
              }}
            >
              <div>
                {place.imageUrl && (
                  <div
                    onClick={() => onSelectPlaceDetail && onSelectPlaceDetail(place)}
                    style={{ height: '150px', borderRadius: 'var(--r-md)', overflow: 'hidden', marginBottom: '0.85rem', cursor: 'pointer' }}
                    title="Click to view details"
                  >
                    <img src={place.imageUrl} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span className="badge badge-blue">{place.category}</span>
                  {(place.priceEstimate || place.priceLevel) && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--blue-600)', fontWeight: 800 }}>
                      {place.priceEstimate || place.priceLevel}
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => onSelectPlaceDetail && onSelectPlaceDetail(place)}
                  style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.35rem', cursor: 'pointer' }}
                  title="Click to view details"
                >
                  {place.name}
                </h3>

                {place.address && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                    <Navigation size={13} color="var(--blue-600)" style={{ marginTop: '3px', flexShrink: 0 }} />
                    {place.address}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--gold-600)' }}>
                  <Star size={14} fill="var(--amber-600)" color="var(--amber-600)" />
                  <span style={{ fontWeight: 800 }}>{place.rating?.toFixed(1) || '4.5'}</span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>({place.userRatingsTotal?.toLocaleString() || 0} reviews)</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem' }}>
                <button
                  onClick={() => onRemovePlace(place)}
                  className="btn btn-danger"
                  style={{ flex: 1, fontSize: '0.82rem', gap: '0.35rem' }}
                >
                  <Trash2 size={15} /> Remove
                </button>

                {onSelectPlaceDetail && (
                  <button
                    onClick={() => onSelectPlaceDetail(place)}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 0.75rem' }}
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
