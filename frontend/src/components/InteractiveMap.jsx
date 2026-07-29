import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Star, ExternalLink, Phone, Navigation, Plus, Check, Loader2, Map, Layers, Eye } from 'lucide-react';
import { renderGoogleMap, renderOpenStreetMap } from '../services/mapService';

export default function InteractiveMap({
  destination,
  places,
  selectedCategory,
  setSelectedCategory,
  selectedPlaces,
  onTogglePlace,
  onSelectPlaceDetail,
  loading,
}) {
  const mapRef = useRef(null);
  const [mapTab, setMapTab] = useState('grid');
  const [mapEngine, setMapEngine] = useState('osm');

  const categories = ['All', 'Attraction', 'Hotel', 'Restaurant', 'Hospital', 'ATM'];

  const filteredPlaces =
    !selectedCategory || selectedCategory === 'All'
      ? places
      : places.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  useEffect(() => {
    if (mapTab !== 'map') return;
    if (!mapRef.current) return;

    if (mapEngine === 'google') {
      renderGoogleMap(mapRef.current, destination, filteredPlaces.length > 0 ? filteredPlaces : places);
    } else {
      renderOpenStreetMap(mapRef.current, destination, filteredPlaces.length > 0 ? filteredPlaces : places);
    }
  }, [mapTab, destination, places, filteredPlaces, mapEngine]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Category Filter Chips + View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`chip${selectedCategory === cat || (cat === 'All' && !selectedCategory) ? ' active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View mode buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {mapTab === 'map' && (
            <div className="tab-group" style={{ padding: '2px' }}>
              <button
                onClick={() => setMapEngine('osm')}
                className={`tab-item${mapEngine === 'osm' ? ' active-blue' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                OpenStreetMap (Active)
              </button>
              <button
                onClick={() => setMapEngine('google')}
                className={`tab-item${mapEngine === 'google' ? ' active-blue' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                Google Maps
              </button>
            </div>
          )}

          <div className="tab-group" style={{ padding: '3px' }}>
            <button
              onClick={() => setMapTab('grid')}
              className={`tab-item${mapTab === 'grid' ? ' active' : ''}`}
            >
              <Layers size={14} /> Cards View
            </button>
            <button
              onClick={() => setMapTab('map')}
              className={`tab-item${mapTab === 'map' ? ' active-blue' : ''}`}
            >
              <Map size={14} /> Live Interactive Map
            </button>
          </div>
        </div>
      </div>

      {/* ── Live Map View ─────────────────────────────────────────── */}
      {mapTab === 'map' && (
        <div className="card-elevated" style={{ overflow: 'hidden', height: '480px', position: 'relative', background: 'white' }}>

          {/* Map Header Status */}
          <div style={{
            position: 'absolute', top: '0.85rem', left: '0.85rem', zIndex: 1000,
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(255,255,255,0.95)',
            padding: '0.45rem 1rem', borderRadius: 'var(--r-full)',
            border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-md)',
          }}>
            <MapPin size={16} color="var(--blue-600)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {destination} — {filteredPlaces.length} place{filteredPlaces.length !== 1 ? 's' : ''}
            </span>
            <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
              {mapEngine === 'google' ? 'Google Maps Mode' : 'OpenStreetMap Mode (Free & Reliable)'}
            </span>
          </div>

          {/* Category Color Legend */}
          <div style={{
            position: 'absolute', bottom: '0.85rem', left: '0.85rem', zIndex: 1000,
            background: 'rgba(255,255,255,0.95)',
            padding: '0.5rem 0.9rem', borderRadius: 'var(--r-md)',
            border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-md)',
            display: 'flex', gap: '0.85rem', flexWrap: 'wrap',
          }}>
            {[
              { label: 'Attraction', color: '#2563eb' },
              { label: 'Hotel', color: '#7c3aed' },
              { label: 'Restaurant', color: '#d97706' },
              { label: 'Hospital', color: '#dc2626' },
              { label: 'ATM', color: '#059669' },
            ].map((item) => (
              <span key={item.label} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                {item.label}
              </span>
            ))}
          </div>

          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* ── Card Grid View ───────────────────────────────────────────────── */}
      {mapTab === 'grid' && (
        <>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <Loader2 size={32} color="var(--blue-600)" className="animate-spin" />
              <span>Loading places near <strong>{destination}</strong>…</span>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="card-flat" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-tertiary)', background: 'white' }}>
              No places found for category "<strong>{selectedCategory}</strong>" near <strong>{destination}</strong>.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {filteredPlaces.map((place) => {
                const isSelected = selectedPlaces.some((p) => p.id === place.id);
                return (
                  <div
                    key={place.id}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      borderColor: isSelected ? 'var(--blue-600)' : 'var(--border-light)',
                    }}
                  >
                    <div>
                      {place.imageUrl && (
                        <div
                          onClick={() => onSelectPlaceDetail && onSelectPlaceDetail(place)}
                          style={{ height: '140px', borderRadius: 'var(--r-md)', overflow: 'hidden', marginBottom: '0.85rem', cursor: 'pointer' }}
                          title="Click to view full details page"
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
                        style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.35rem', letterSpacing: '-0.02em', cursor: 'pointer' }}
                        title="Click to view full details page"
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
                        onClick={() => onTogglePlace(place)}
                        className={`btn ${isSelected ? 'btn-gold' : 'btn-ghost'}`}
                        style={{ flex: 1, fontSize: '0.85rem' }}
                      >
                        {isSelected ? <Check size={16} /> : <Plus size={16} />}
                        {isSelected ? 'Added to Trip' : 'Add to Trip'}
                      </button>

                      {onSelectPlaceDetail && (
                        <button
                          onClick={() => onSelectPlaceDetail(place)}
                          className="btn btn-outline"
                          style={{ padding: '0.5rem 0.75rem' }}
                          title="View Full Page Details"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
}
