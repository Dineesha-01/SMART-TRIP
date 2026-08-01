import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Check, ShieldCheck, KeyRound, Award, Sparkles, Lock, ChevronRight, Globe, Bell } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Profile({ user, onUpdateProfile }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [homeCity, setHomeCity] = useState(user?.homeCity || '');
  const [travelStyle, setTravelStyle] = useState('Standard');

  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const userRole = user?.role || 'ROLE_TRAVELLER';
  const roleBadgeText = userRole === 'ROLE_SUPER_ADMIN' ? 'Super Admin' : userRole === 'ROLE_ADMIN' ? 'Employee Admin' : 'Verified Member';

  const displayName = name || user?.name || (email ? email.split('@')[0] : 'Account Member');

  useEffect(() => {
    // 1. Update from user prop or local session
    const storedUser = user || JSON.parse(localStorage.getItem('smarttrip_user') || 'null');
    if (storedUser) {
      setName(storedUser.name || storedUser.username || (storedUser.email ? storedUser.email.split('@')[0] : ''));
      setEmail(storedUser.email || '');
      setPhone(storedUser.phone || '');
      setHomeCity(storedUser.homeCity || '');
    }

    // 2. Fetch live from MongoDB
    const lookupId = user?.userId || user?.id || user?.email;
    if (lookupId) {
      fetch(`http://localhost:8080/api/v1/users/${encodeURIComponent(lookupId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((dbUser) => {
          if (dbUser) {
            if (dbUser.name) setName(dbUser.name);
            if (dbUser.email) setEmail(dbUser.email);
            if (dbUser.phone) setPhone(dbUser.phone);
            if (dbUser.homeCity) setHomeCity(dbUser.homeCity);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updated = {
      ...user,
      name,
      email,
      phone,
      homeCity,
    };

    try {
      const userId = user?.userId || user?.id || user?.email || 'usr_1';
      await fetch(`http://localhost:8080/api/v1/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('smarttrip_jwt') || ''}`,
        },
        body: JSON.stringify(updated),
      }).catch(() => null);

      if (onUpdateProfile) onUpdateProfile(updated);
      setSaved(true);
      if (toast) toast.success('Profile Saved', 'Account profile details saved to MongoDB.');
      setTimeout(() => setSaved(false), 2500);
    } catch {
      if (toast) toast.error('Update Failed', 'Could not update profile details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '1rem auto 4rem', padding: '0 1rem' }}>
      
      {/* ─── Hero Cover Banner (MakeMyTrip Style) ───────────────────────── */}
      <div className="card-elevated" style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #2563eb 100%)',
        color: 'white',
        padding: '2.5rem 2rem 2rem',
        marginBottom: '2rem',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          
          {/* Large Avatar */}
          <div style={{
            width: '84px', height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '2.2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            flexShrink: 0,
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                {displayName}
              </h1>
              <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem' }}>
                <Award size={13} /> {roleBadgeText}
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <span><Mail size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{email}</span>
              <span>•</span>
              <span><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{homeCity}</span>
            </p>
          </div>
        </div>

        {/* Banner Quick Stats Bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem',
          marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.12)',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>ACCOUNT STATUS</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
              <ShieldCheck size={15} /> Active & Verified
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>PREFERRED REGION</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>
              India & International
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>SECURITY PIN</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>
              •••• Configured
            </div>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ───────────────────────────────────────── */}
      <div className="tab-group" style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`tab-item${activeTab === 'profile' ? ' active-blue' : ''}`}
          style={{ gap: '0.4rem' }}
        >
          <User size={15} /> Personal Profile
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`tab-item${activeTab === 'preferences' ? ' active-blue' : ''}`}
          style={{ gap: '0.4rem' }}
        >
          <Sparkles size={15} /> Travel Preferences
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`tab-item${activeTab === 'security' ? ' active-blue' : ''}`}
          style={{ gap: '0.4rem' }}
        >
          <Lock size={15} /> Security & Account
        </button>
      </div>

      {/* ─── Tab Content: Personal Profile ───────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="card-elevated" style={{ padding: '2.25rem', background: 'white', borderRadius: '16px' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.02em' }}>Personal Information</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Manage your contact details and home location</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Full Name</label>
                <div className="input-group">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <div className="input-group">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Mobile Number</label>
                <div className="input-group">
                  <Phone size={16} className="input-icon" />
                  <input
                    type="tel"
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Home City & Country</label>
                <div className="input-group">
                  <MapPin size={16} className="input-icon" />
                  <input
                    type="text"
                    className="input"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
                disabled={loading}
                style={{ padding: '0.75rem 1.75rem', gap: '0.4rem', fontSize: '0.92rem' }}
              >
                {saved ? <Check size={18} /> : <Save size={18} />}
                {saved ? 'Changes Saved!' : (loading ? 'Saving Profile...' : 'Save Profile Changes')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Tab Content: Travel Preferences ────────────────────────── */}
      {activeTab === 'preferences' && (
        <div className="card-elevated" style={{ padding: '2.25rem', background: 'white', borderRadius: '16px' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.02em' }}>Travel Preferences</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Personalize your AI itinerary recommendations</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Preferred Travel Style</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginTop: '0.4rem' }}>
                {[
                  { title: 'Standard', desc: 'Balanced luxury & budget' },
                  { title: 'Luxury', desc: '5-star resorts & fine dining' },
                  { title: 'Backpacker', desc: 'Budget-friendly travel' },
                  { title: 'Family', desc: 'Kid & family suitable' },
                ].map((s) => (
                  <div
                    key={s.title}
                    onClick={() => setTravelStyle(s.title)}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: `2px solid ${travelStyle === s.title ? 'var(--blue-600)' : 'var(--border-light)'}`,
                      background: travelStyle === s.title ? 'var(--blue-50)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: travelStyle === s.title ? 'var(--blue-600)' : 'var(--navy-900)' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {s.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab Content: Security ──────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="card-elevated" style={{ padding: '2.25rem', background: 'white', borderRadius: '16px' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.02em' }}>Security & Account Protection</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Manage security settings, secret recovery PIN, and active sessions</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.25rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <KeyRound size={20} color="var(--blue-600)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Secret Recovery PIN</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Used for account recovery and password resets</div>
                </div>
              </div>
              <button className="btn btn-outline btn-sm">Update PIN</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.25rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <ShieldCheck size={20} color="var(--emerald-600)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Account Status</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Role-Based Access Control verified</div>
                </div>
              </div>
              <span className="badge badge-emerald">Verified</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
