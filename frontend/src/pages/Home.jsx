import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import heroImage from '../assets/hero1.jpg';
import { MapPin, Sparkles, Route, DollarSign, ShieldCheck, Clock, ArrowRight, TrendingUp, Globe, History, Trash2 } from 'lucide-react';
import { loadGoogleMaps } from '../services/googlePlaces';
import { useToast } from '../components/Toast';
import SearchAutocomplete from '../components/SearchAutocomplete';

const DESTINATIONS = [
  { name: 'Jaipur', slug: 'jaipur', country: 'Rajasthan, India', accent: '#2563eb', img: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=85' },
  { name: 'Goa', slug: 'goa', country: 'India', accent: '#2563eb', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=85' },
  { name: 'Taj Mahal, Agra', slug: 'tajmahal', country: 'Uttar Pradesh, India', accent: '#059669', img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=85' },
  { name: 'Kerala', slug: 'kerala', country: 'India', accent: '#059669', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=85' },
  { name: 'Mumbai', slug: 'mumbai', country: 'Maharashtra, India', accent: '#7c3aed', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=85' },
  { name: 'Varanasi', slug: 'varanasi', country: 'Uttar Pradesh, India', accent: '#d97706', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=85' },
  { name: 'Manali', slug: 'manali', country: 'Himachal Pradesh, India', accent: '#0284c7', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=85' },
  { name: 'Bengaluru', slug: 'bengaluru', country: 'Karnataka, India', accent: '#2563eb', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=85' },
  { name: 'New Delhi', slug: 'delhi', country: 'India', accent: '#dc2626', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=85' },
];

const FEATURE_ICONS = [
  { key: 'findPlaces', icon: <Globe size={20} />, color: 'var(--blue-600)', bg: 'var(--blue-50)', border: 'var(--border-light)' },
  { key: 'routePlanning', icon: <Route size={20} />, color: '#7c3aed', bg: '#f3e8ff', border: 'var(--border-light)' },
  { key: 'budget', icon: <DollarSign size={20} />, color: 'var(--amber-600)', bg: 'var(--amber-100)', border: 'var(--border-light)' },
  { key: 'emergency', icon: <ShieldCheck size={20} />, color: 'var(--emerald-600)', bg: 'var(--emerald-100)', border: 'var(--border-light)' },
  { key: 'packing', icon: <TrendingUp size={20} />, color: 'var(--red-600)', bg: 'var(--red-100)', border: 'var(--border-light)' },
  { key: 'saveTrips', icon: <Clock size={20} />, color: '#0891b2', bg: '#ecfeff', border: 'var(--border-light)' },
];

export default function Home({ onSelectDestination }) {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('smarttrip_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      } else {
        setRecentSearches(['Jaipur', 'Goa', 'Taj Mahal', 'Mumbai']);
      }
    } catch {
      setRecentSearches(['Jaipur', 'Goa', 'Taj Mahal', 'Mumbai']);
    }
  }, []);

  const saveRecentSearch = (city) => {
    if (!city) return;
    const filtered = recentSearches.filter((s) => s.toLowerCase() !== city.toLowerCase());
    const updated = [city, ...filtered].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('smarttrip_recent_searches', JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('smarttrip_recent_searches');
    if (toast) toast.info(t('home.toastHistoryClearedTitle'), t('home.toastHistoryClearedMsg'));
  };

  useEffect(() => {
    let autocomplete;
    loadGoogleMaps()
      .then((google) => {
        if (!searchRef.current) return;
        autocomplete = new google.maps.places.Autocomplete(searchRef.current, {
          types: ['(cities)'],
          fields: ['name', 'formatted_address'],
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          const name = place.name || place.formatted_address || '';
          if (name) {
            setSearchInput(name);
            setSearchError('');
            saveRecentSearch(name);
            onSelectDestination(name);
            if (toast) toast.success(t('home.toastDestSelectedTitle'), t('home.toastLoadingMsg', { city: name }));
          }
        });
      })
      .catch(() => {});
    return () => {
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [onSelectDestination, toast, t]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = searchInput.trim();
    if (!val) {
      setSearchError(t('home.errorEmpty'));
      return;
    }
    if (val.length < 2) {
      setSearchError(t('home.errorShort'));
      return;
    }
    setSearchError('');
    saveRecentSearch(val);
    onSelectDestination(val);
    if (toast) toast.success(t('home.toastSearchingTitle'), t('home.toastFetchingMsg', { city: val }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '4rem' }}>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        borderRadius: 'var(--r-xl)',
        padding: '4rem 2rem 3.5rem',
        textAlign: 'center',
        color: 'white',
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.4) 45%, rgba(15,23,42,0.6) 100%)',
        }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--navy-800)',
            border: '1px solid var(--slate-600)',
            padding: '0.35rem 1rem',
            borderRadius: 'var(--r-full)',
            fontSize: '0.78rem', fontWeight: 600,
            color: '#93c5fd',
            marginBottom: '1.25rem',
          }}>
            <Sparkles size={14} /> {t('home.badge')}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.15,
            marginBottom: '1rem',
          }}>
            {t('home.heroTitle')}
          </h1>

          <p style={{
            fontSize: '1rem', color: '#94a3b8',
            marginBottom: '2rem', maxWidth: '620px', margin: '0 auto 2rem',
            lineHeight: 1.6, fontWeight: 400,
          }}>
            {t('home.heroSubtitle')}
          </p>

          <form onSubmit={handleSubmit} style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <SearchAutocomplete
                  value={searchInput}
                  onChange={(val) => { setSearchInput(val); setSearchError(''); }}
                  onSelect={(selectedCity) => {
                    setSearchInput(selectedCity);
                    saveRecentSearch(selectedCity);
                    onSelectDestination(selectedCity);
                  }}
                  placeholder={t('home.searchPlaceholder')}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '48px', flexShrink: 0 }}>
                {t('home.explore')} <ArrowRight size={15} />
              </button>
            </div>
            {searchError && (
              <p style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 500, textAlign: 'left', paddingLeft: '0.4rem' }}>
                {searchError}
              </p>
            )}
          </form>

          {recentSearches.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.25rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <History size={13} /> {t('home.recentSearches')}
              </span>
              {recentSearches.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSearchInput(city);
                    saveRecentSearch(city);
                    onSelectDestination(city);
                    if (toast) toast.success(t('home.toastDestSelectedTitle'), t('home.toastLoadingMsg', { city }));
                  }}
                  style={{
                    background: 'var(--navy-800)',
                    border: '1px solid var(--slate-700)',
                    color: '#e2e8f0',
                    borderRadius: 'var(--r-full)',
                    padding: '0.25rem 0.7rem',
                    fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'var(--ease-fast)',
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  }}
                >
                  <MapPin size={12} color="#93c5fd" /> {city}
                </button>
              ))}

              <button
                onClick={clearRecentSearches}
                style={{
                  background: 'none', border: 'none', color: '#94a3b8',
                  fontSize: '0.72rem', cursor: 'pointer', padding: '0.2rem',
                }}
                title={t('home.clearHistory')}
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Top Destinations */}
      <section>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>{t('home.topDestinations')}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{t('home.topDestinationsSubtitle')}</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '1.15rem',
        }}>
          {DESTINATIONS.map((dest) => (
            <div
              key={dest.name}
              onClick={() => {
                saveRecentSearch(dest.name);
                onSelectDestination(dest.name);
                if (toast) toast.info(t('home.toastLoadingDestTitle'), t('home.toastFetchingDots', { city: dest.name }));
              }}
              className="card"
              style={{ position: 'relative', height: '190px', overflow: 'hidden', cursor: 'pointer' }}
            >
              <img src={dest.img} alt={dest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.75)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem 1.15rem', color: 'white' }}>
                <span className="badge badge-blue" style={{ marginBottom: '0.3rem' }}>
                  {t(`home.destinations.${dest.slug}.tag`)}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white' }}>{dest.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>{dest.country}</span>
                  <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>{t(`home.destinations.${dest.slug}.stat`)}</span>
                </div>
              </div>
              <div style={{
                position: 'absolute', top: '0.75rem', right: '0.75rem',
                width: '30px', height: '30px', background: '#ffffff', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ArrowRight size={14} color="var(--navy-900)" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System Features */}
      <section>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>{t('home.systemFeatures')}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{t('home.systemFeaturesSubtitle')}</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '1rem',
        }}>
          {FEATURE_ICONS.map((feat) => (
            <div key={feat.key} className="card-flat" style={{ padding: '1.25rem' }}>
              <div style={{
                width: '38px', height: '38px', background: feat.bg, borderRadius: 'var(--r-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: feat.color,
                marginBottom: '0.8rem', border: `1px solid ${feat.border}`,
              }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                {t(`home.features.${feat.key}.title`)}
              </h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-tertiary)', lineHeight: 1.55 }}>
                {t(`home.features.${feat.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}