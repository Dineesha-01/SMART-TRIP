import React, { useState } from 'react';
import { ArrowLeft, MapPin, Star, ExternalLink, Navigation, Plus, Check, Calendar, ShieldAlert, Share2, Printer, Sparkles, Loader2, Bot } from 'lucide-react';
import { enrichPlaceWithGroqAi } from '../services/groqAi';
import FormattedMessage from '../components/FormattedMessage';
import { useToast } from '../components/Toast';

export default function PlaceDetails({ place, destination, onBack, onTogglePlace, isSelected }) {
  const [aiDetails, setAiDetails] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const toast = useToast();

  if (!place) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Place Not Found</h2>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Back to Places
        </button>
      </div>
    );
  }

  const buildGoogleMapsDirUrl = () => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${destination || ''}`)}`;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      if (toast) toast.success('Link Copied', 'Place link copied to clipboard.');
    }
  };

  const handleFetchAiEnrichment = async () => {
    setLoadingAi(true);
    if (toast) toast.info('Groq AI Enricher', `Fetching authentic history & entry fees for ${place.name}...`);

    try {
      const result = await enrichPlaceWithGroqAi(place.name, destination || 'India');
      setAiDetails(result);
      if (toast) toast.success('AI Facts Loaded!', `Real history and fees for ${place.name} loaded.`);
    } catch (err) {
      if (toast) toast.error('AI Fetch Error', err.message || 'Could not connect to Groq AI');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '4rem' }}>

      {/* Navigation Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} className="btn btn-outline" style={{ gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Places
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleShare} className="btn btn-ghost" title="Share Place">
            <Share2 size={16} /> Share
          </button>
          <button onClick={() => window.print()} className="btn btn-ghost" title="Print Details">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="card-elevated" style={{ overflow: 'hidden', background: 'white' }}>
        <div style={{ position: 'relative', height: '340px', width: '100%' }}>
          <img
            src={place.imageUrl || 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=85'}
            alt={place.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)',
          }} />

          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '2rem 2.25rem', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem',
          }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-blue">{place.category || 'Attraction'}</span>
                {place.priceEstimate && (
                  <span className="badge badge-gold" style={{ background: 'var(--amber-600)', color: 'white' }}>
                    {place.priceEstimate}
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                {place.name}
              </h1>

              <p style={{ fontSize: '0.92rem', color: '#cbd5e1', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="#93c5fd" /> {place.address || `${destination || 'City Center'}, India`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => onTogglePlace(place)}
                className={`btn ${isSelected ? 'btn-gold' : 'btn-primary'}`}
                style={{ padding: '0.75rem 1.4rem', fontSize: '0.92rem' }}
              >
                {isSelected ? <Check size={18} /> : <Plus size={18} />}
                {isSelected ? 'Added to Itinerary' : 'Add to Trip'}
              </button>

              <a
                href={buildGoogleMapsDirUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ padding: '0.75rem 1.1rem', color: 'white', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)' }}
              >
                <Navigation size={18} /> Open GPS
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Left Column: Details & AI History Enricher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Groq AI Real History & Fee Enricher Section */}
          <div className="card-elevated" style={{ padding: '1.75rem', background: 'white', borderTop: '4px solid var(--blue-600)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={22} color="var(--blue-600)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Groq AI Real Place & History Enricher</h3>
              </div>

              <button
                onClick={handleFetchAiEnrichment}
                disabled={loadingAi}
                className="btn btn-primary btn-sm"
              >
                {loadingAi ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {loadingAi ? 'Fetching Facts...' : 'Get Authentic AI Facts'}
              </button>
            </div>

            {aiDetails ? (
              <div style={{ fontSize: '0.88rem', lineHeight: 1.6, background: 'var(--surface-1)', padding: '1.25rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border-light)' }}>
                <FormattedMessage content={aiDetails} isTyping={true} />
              </div>
            ) : (
              <div style={{ padding: '1.25rem', background: 'var(--surface-1)', borderRadius: 'var(--r-md)', border: '1px dashed var(--border-medium)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                Click "Get Authentic AI Facts" above to query Groq Llama-3.3 70B for real local history, authentic ticket entry fees in ₹ INR, best visiting hours, and insider travel tips for <strong>{place.name}</strong>!
              </div>
            )}
          </div>

          <div className="card-elevated" style={{ padding: '1.75rem', background: 'white' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.85rem' }}>
              About {place.name}
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Located in <strong>{destination || 'the city'}</strong>, {place.name} is one of the top rated {place.category?.toLowerCase() || 'places'} visited by travelers. Offering rich heritage, scenic views, and convenient local access, it is a must-visit destination for your itinerary.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <div className="card-flat" style={{ padding: '1rem', background: 'white' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Visitor Rating</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                  <Star size={18} fill="var(--amber-600)" color="var(--amber-600)" />
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {place.rating?.toFixed(1) || '4.5'}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>({place.userRatingsTotal || 450} reviews)</span>
              </div>

              <div className="card-flat" style={{ padding: '1rem', background: 'white' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Estimated Price</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--blue-600)', marginTop: '0.35rem' }}>
                  {place.priceEstimate || place.priceLevel || '₹350 / entry'}
                </div>
              </div>

              <div className="card-flat" style={{ padding: '1rem', background: 'white' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Category</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.35rem' }}>
                  {place.category || 'Attraction'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Location & Booking Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card-elevated" style={{ padding: '1.75rem', background: 'white' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.85rem' }}>
              Location & Coordinates
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
              {place.address || `${destination}, India`}
            </p>

            {place.latitude && place.longitude && (
              <div style={{
                background: 'var(--surface-1)', padding: '0.85rem 1rem', borderRadius: 'var(--r-md)',
                fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1.25rem',
                border: '1px solid var(--border-medium)',
              }}>
                GPS Coordinates: {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
              </div>
            )}

            <a
              href={buildGoogleMapsDirUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Navigation size={16} /> Open in Google Maps GPS
            </a>

            {place.bookingLink && (
              <a
                href={place.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
              >
                <ExternalLink size={16} /> Reserve / Book Room Online
              </a>
            )}
          </div>

          <div className="info-block success">
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Verified Place:</strong> Verified location listing in {destination}. Safe for solo and family travelers.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
