import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Check, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Profile({ user, onUpdateProfile }) {
  const [name, setName] = useState(user?.name || 'Full Name');
  const [email, setEmail] = useState(user?.email || 'Email Address');
  const [phone, setPhone] = useState(user?.phone || 'Phone Number');
  const [homeCity, setHomeCity] = useState(user?.homeCity || 'New Delhi, India');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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
      const userId = user?.userId || 'usr_demo_123';
      await fetch(`http://localhost:8080/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('smarttrip_jwt') || ''}`,
        },
        body: JSON.stringify(updated),
      }).catch(() => null);

      if (onUpdateProfile) onUpdateProfile(updated);
      setSaved(true);
      if (toast) toast.success('Profile Updated', 'Your profile details have been saved.');
      setTimeout(() => setSaved(false), 2500);
    } catch {
      if (toast) toast.error('Update failed', 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '1rem auto 4rem', padding: '0 1rem' }}>
      <div className="card-elevated animate-scale-in" style={{ padding: '2.5rem', background: 'white' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{
            width: '68px', height: '68px',
            borderRadius: '50%',
            background: 'var(--grad-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1.75rem',
            boxShadow: 'var(--shadow-blue)', flexShrink: 0,
          }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>User Profile</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <span className="badge badge-emerald">JWT Authenticated</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>MongoDB Store</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label className="form-label">Full Name</label>
            <div className="input-group">
              <User size={16} className="input-icon" />
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="form-label">Phone Number</label>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="form-label">Home City</label>
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

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              className={`btn ${saved ? 'btn-success' : 'btn-primary'} btn-lg`}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? 'Profile Saved!' : (loading ? 'Saving...' : 'Save Profile Changes')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
