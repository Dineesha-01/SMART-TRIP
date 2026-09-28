import React, { useState, useEffect, useRef } from 'react';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    i18n.changeLanguage(code); // this alone persists to localStorage via LanguageDetector
    setOpen(false);
  };

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="chip"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
      >
        <Languages size={14} /> {current.label} <ChevronDown size={13} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 50,
          background: 'white', border: '1px solid var(--border-light)',
          borderRadius: 'var(--r-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          minWidth: '180px', overflow: 'hidden',
        }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              style={{
                width: '100%', textAlign: 'left', padding: '0.6rem 0.9rem',
                background: lang.code === i18n.language ? 'var(--blue-50)' : 'white',
                border: 'none', cursor: 'pointer', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              {lang.label}
              {lang.code === i18n.language && <Check size={14} color="var(--blue-600)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}