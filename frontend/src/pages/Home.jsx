import React, { useState, useRef, useEffect } from 'react';
import heroImage from '../assets/hero1.jpg';
import { MapPin, Sparkles, Route, DollarSign, ShieldCheck, Clock, ArrowRight, TrendingUp, Globe, History, Trash2 } from 'lucide-react';
import { loadGoogleMaps } from '../services/googlePlaces';
import { useToast } from '../components/Toast';
import SearchAutocomplete from '../components/SearchAutocomplete';

const DESTINATIONS = [
  {
    name: 'Jaipur',
    country: 'Rajasthan, India',
    tag: 'The Pink City',
    accent: '#2563eb',
    img: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=85',
    stat: '4.9 Rating Forts & Palaces',
  },
  {
    name: 'Goa',
    country: 'India',
    tag: 'Beaches & Heritage',
    accent: '#2563eb',
    img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=85',
    stat: '4.8 Rating Sun & Sand',
  },
  {
    name: 'Taj Mahal, Agra',
    country: 'Uttar Pradesh, India',
    tag: 'Famous Landmark',
    accent: '#059669',
    img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=85',
    stat: '4.9 Rating Historic Sight',
  },
  {
    name: 'Kerala',
    country: 'India',
    tag: 'Nature & Backwaters',
    accent: '#059669',
    img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=85',
    stat: '4.9 Rating Greenery',
  },
  {
    name: 'Mumbai',
    country: 'Maharashtra, India',
    tag: 'City of Dreams',
    accent: '#7c3aed',
    img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=85',
    stat: '4.8 Rating Gateway of India',
  },
  {
    name: 'Varanasi',
    country: 'Uttar Pradesh, India',
    tag: 'Holy City',
    accent: '#d97706',
    img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=85',
    stat: '4.9 Rating Holy River Ghats',
  },
  {
    name: 'Manali',
    country: 'Himachal Pradesh, India',
    tag: 'Hill Station',
    accent: '#0284c7',
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=85',
    stat: '4.8 Rating Mountains & Snow',
  },
  {
    name: 'Bengaluru',
    country: 'Karnataka, India',
    tag: 'Garden & IT City',
    accent: '#2563eb',
    img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=85',
    stat: '4.7 Rating Parks & Weather',
  },
  {
    name: 'New Delhi',
    country: 'India',
    tag: 'Capital City',
    accent: '#dc2626',
    img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=85',
    stat: '4.8 Rating Monuments & Food',
  },
];

const FEATURES = [
  {
    icon: <Globe size={20} />,
    title: 'Find Real Places',
    desc: 'Search tourist spots, hotels, restaurants, hospitals, and ATMs across India and the world.',
    color: 'var(--blue-600)', bg: 'var(--blue-50)', border: 'var(--border-light)',
  },
  {
    icon: <Route size={20} />,
    title: 'Easy Route Planning',
    desc: 'Find the shortest path between your travel stops to save time and travel distance.',
    color: '#7c3aed', bg: '#f3e8ff', border: 'var(--border-light)',
  },
  {
    icon: <DollarSign size={20} />,
    title: 'Budget & Price Comparison',
    desc: 'Calculate trip expenses easily in Indian Rupees (₹) and convert currencies.',
    color: 'var(--amber-600)', bg: 'var(--amber-100)', border: 'var(--border-light)',
  },
  {
    icon: <ShieldCheck size={20} />,
    title: 'Emergency Directory',
    desc: 'Quick access to local hospital addresses and emergency helpline numbers.',
    color: 'var(--emerald-600)', bg: 'var(--emerald-100)', border: 'var(--border-light)',
  },
  {
    icon: <TrendingUp size={20} />,
    title: 'Smart Packing List',
    desc: 'Get customized packing checklists for your destination with progress tracking.',
    color: 'var(--red-600)', bg: 'var(--red-100)', border: 'var(--border-light)',
  },
  {
    icon: <Clock size={20} />,
    title: 'Save & View Trips',
    desc: 'Save your completed trip plans securely to your profile and view them anytime.',
    color: '#0891b2', bg: '#ecfeff', border: 'var(--border-light)',
  },
];

export default function Home({ onSelectDestination }) {
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
    if (toast) toast.info('History Cleared', 'Search history cleared.');
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
            if (toast) toast.success('Destination Selected', `Loading places in ${name}`);
          }
        });
      })
      .catch(() => {});
    return () => {
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [onSelectDestination, toast]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = searchInput.trim();
    if (!val) {
      setSearchError('Please enter a destination to search (e.g. Goa, Jaipur, Mumbai)');
      return;
    }
    if (val.length < 2) {
      setSearchError('Destination name must be at least 2 characters');
      return;
    }
    setSearchError('');
    saveRecentSearch(val);
    onSelectDestination(val);
    if (toast) toast.success('Searching Destination', `Fetching real places in ${val}`);
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
        border: '1px solid var(--navy-800)',
        overflow: 'hidden',
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
            <Sparkles size={14} /> EASY & SMART TRAVEL PLANNER
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.15,
            marginBottom: '1rem',
          }}>
            Plan Easy Trips Across India & The World
          </h1>

          <p style={{
            fontSize: '1rem', color: '#94a3b8',
            marginBottom: '2rem', maxWidth: '620px', margin: '0 auto 2rem',
            lineHeight: 1.6, fontWeight: 400,
          }}>
            Search destinations, compare travel options (Bus, Train, Flight), plan shortest routes, and manage trip costs in Rupees (₹).
          </p>

          {/* Search Form */}
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
                  placeholder="Search city (e.g. Jaipur, Manali, Goa, Mumbai)..."
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '48px', flexShrink: 0 }}>
                Explore <ArrowRight size={15} />
              </button>
            </div>
            {searchError && (
              <p style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 500, textAlign: 'left', paddingLeft: '0.4rem' }}>
                {searchError}
              </p>
            )}
          </form>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.25rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <History size={13} /> Recent Searches:
              </span>
              {recentSearches.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSearchInput(city);
                    saveRecentSearch(city);
                    onSelectDestination(city);
                    if (toast) toast.success('Destination Selected', `Loading places in ${city}`);
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
                title="Clear history"
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
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>Top Destinations in India</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Click any city to plan your trip</p>
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
                if (toast) toast.info('Loading Destination', `Fetching places in ${dest.name}...`);
              }}
              className="card"
              style={{
                position: 'relative',
                height: '190px',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <img
                src={dest.img}
                alt={dest.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(15, 23, 42, 0.75)',
              }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '1rem 1.15rem',
                color: 'white',
              }}>
                <span className="badge badge-blue" style={{ marginBottom: '0.3rem' }}>
                  {dest.tag}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white' }}>{dest.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>{dest.country}</span>
                  <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>{dest.stat}</span>
                </div>
              </div>
              <div style={{
                position: 'absolute', top: '0.75rem', right: '0.75rem',
                width: '30px', height: '30px',
                background: '#ffffff',
                borderRadius: '50%',
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
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>Main System Features</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Built with Spring Boot 3.x, React, MongoDB, and Google Maps API</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '1rem',
        }}>
          {FEATURES.map((feat) => (
            <div key={feat.title} className="card-flat" style={{ padding: '1.25rem' }}>
              <div style={{
                width: '38px', height: '38px',
                background: feat.bg,
                borderRadius: 'var(--r-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: feat.color,
                marginBottom: '0.8rem',
                border: `1px solid ${feat.border}`,
              }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>{feat.title}</h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-tertiary)', lineHeight: 1.55 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}