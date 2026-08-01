import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Compass, Building2 } from 'lucide-react';

const POPULAR_DESTINATIONS = [
  { name: 'Jaipur', region: 'Rajasthan, India', category: 'City' },
  { name: 'Goa', region: 'India', category: 'Beach & Forts' },
  { name: 'Agra', region: 'Uttar Pradesh, India', category: 'Taj Mahal & Forts' },
  { name: 'Manali', region: 'Himachal Pradesh, India', category: 'Hill Station' },
  { name: 'Bengaluru', region: 'Karnataka, India', category: 'Garden City' },
  { name: 'Mumbai', region: 'Maharashtra, India', category: 'Coastal Gateway' },
  { name: 'Delhi', region: 'India', category: 'Capital Monuments' },
  { name: 'Udaipur', region: 'Rajasthan, India', category: 'Lake City' },
  { name: 'Varanasi', region: 'Uttar Pradesh, India', category: 'Holy Ganges River' },
  { name: 'Kerala', region: 'India', category: 'Backwaters & Nature' },
  { name: 'Vijayawada', region: 'Andhra Pradesh, India', category: 'Krishna River & Temples' },
  { name: 'Hyderabad', region: 'Telangana, India', category: 'Charminar & IT Hub' },
  { name: 'Paris', region: 'France', category: 'Louvre & Eiffel Tower' },
];

export default function SearchAutocomplete({ value, onChange, onSelect, placeholder = 'Search city or destination (e.g. Jaipur, Manali, Goa)...' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);

    if (val.trim().length >= 1) {
      const q = val.toLowerCase().trim();
      const filtered = POPULAR_DESTINATIONS.filter(
        (d) => d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
      );
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleChoose = (destName) => {
    onChange(destName);
    setIsOpen(false);
    if (onSelect) onSelect(destName);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <Search size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          type="text"
          className="input"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (value.trim().length >= 1) setIsOpen(true);
          }}
          placeholder={placeholder}
          style={{ paddingLeft: '2.75rem', height: '48px', fontSize: '0.95rem', borderRadius: '12px' }}
        />
      </div>

      {/* Live Suggestions Dropdown Panel */}
      {isOpen && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'white', borderRadius: '14px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)',
          border: '1px solid var(--border-medium)',
          zIndex: 9999, overflow: 'hidden',
          maxHeight: '280px', overflowY: 'auto',
        }}>
          <div style={{ padding: '0.5rem 0.85rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--blue-600)', letterSpacing: '0.06em', background: 'var(--surface-1)', borderBottom: '1px solid var(--border-light)' }}>
            MATCHING DESTINATIONS
          </div>
          {suggestions.map((item) => (
            <div
              key={item.name}
              onClick={() => handleChoose(item.name)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem', cursor: 'pointer',
                borderBottom: '1px solid var(--border-light)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--blue-50)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <MapPin size={16} color="var(--blue-600)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.region}</div>
                </div>
              </div>
              <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                {item.category}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
