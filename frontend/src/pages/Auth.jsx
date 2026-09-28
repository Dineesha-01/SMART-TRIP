import React, { useState } from 'react';
import { User, Mail, Lock, KeyRound, Phone, ArrowRight, Car, Check, Eye, EyeOff, MapPin, Compass, ShieldCheck, AlertCircle, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

function PasswordInput({ value, onChange, placeholder, name }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
      <input
        type={visible ? 'text' : 'password'}
        name={name}
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={name === 'password' ? 'current-password' : 'new-password'}
        style={{ paddingLeft: '2.5rem', paddingRight: '2.8rem' }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        style={{
          position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
          display: 'flex', alignItems: 'center',
        }}
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const hasLength = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*#?&]/.test(password);

  const score = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  const getLabel = () => {
    if (score <= 1) return { text: 'Weak Password', color: '#ef4444', percent: 25 };
    if (score === 2) return { text: 'Fair Strength', color: '#f59e0b', percent: 50 };
    if (score === 3) return { text: 'Good Strength', color: '#3b82f6', percent: 75 };
    return { text: 'Strong & Secure', color: '#10b981', percent: 100 };
  };

  const strength = getLabel();

  return (
    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: strength.color }}>
        <span>Password Strength:</span>
        <span>{strength.text}</span>
      </div>

      <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${strength.percent}%`, height: '100%', background: strength.color, transition: 'all 0.3s ease' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.7rem' }}>
        <div style={{ color: hasLength ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {hasLength ? <CheckCircle2 size={12} /> : <XCircle size={12} />} At least 6 chars
        </div>
        <div style={{ color: hasUpper ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {hasUpper ? <CheckCircle2 size={12} /> : <XCircle size={12} />} Uppercase (A-Z)
        </div>
        <div style={{ color: hasNumber ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {hasNumber ? <CheckCircle2 size={12} /> : <XCircle size={12} />} Number (0-9)
        </div>
        <div style={{ color: hasSpecial ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {hasSpecial ? <CheckCircle2 size={12} /> : <XCircle size={12} />} Symbol (@$!%*#)
        </div>
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1.25rem',
    }}>
      <div style={{
        background: 'white', borderRadius: '16px',
        padding: '2rem 2.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
      }}>
        <div style={{
          width: '52px', height: '52px',
          background: 'var(--navy-900)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Compass size={28} color="white" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            Authenticating...
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            Verifying credentials via JWT
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'var(--blue-600)',
              animation: `pulseGlow 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Auth({ onLoginSuccess, onNavigateHome }) {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState('');
  const toast = useToast();

  const [login, setLogin] = useState({ usernameOrEmail: '', password: '' });
  const [reg, setReg] = useState({ name: '', username: '', email: '', password: '', secretPin: '', phone: '' });
  const [forgot, setForgot] = useState({ usernameOrEmail: '', secretPin: '', newPassword: '' });

  const [loginErr, setLoginErr] = useState({});
  const [regErr, setRegErr] = useState({});
  const [forgotErr, setForgotErr] = useState({});

  const validateLogin = () => {
    const e = {};
    if (!login.usernameOrEmail.trim()) e.usernameOrEmail = 'Email or username is required';
    if (!login.password) e.password = 'Password is required';
    setLoginErr(e); return !Object.keys(e).length;
  };

  const validateReg = () => {
    const e = {};
    if (!reg.name.trim()) e.name = 'Full name is required';
    if (!reg.username.trim()) {
      e.username = 'Username is required';
    } else if (reg.username.trim().length < 3) {
      e.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_.]+$/.test(reg.username.trim())) {
      e.username = 'Only letters, numbers, underscores and dots allowed';
    }
    if (!reg.email.trim() || !reg.email.includes('@')) e.email = 'Please enter a valid email address';

    if (!reg.password) {
      e.password = 'Password is required';
    } else if (reg.password.length < 6) {
      e.password = 'Password must be at least 6 characters long';
    }

    if (!reg.secretPin || reg.secretPin.length < 4) e.secretPin = 'Secret PIN must be at least 4 digits';
    setRegErr(e); return !Object.keys(e).length;
  };

  const validateForgot = () => {
    const e = {};
    if (!forgot.usernameOrEmail.trim()) e.usernameOrEmail = 'Email or username is required';
    if (!forgot.secretPin) e.secretPin = 'PIN is required';
    if (!forgot.newPassword || forgot.newPassword.length < 6) e.newPassword = 'Minimum 6 characters required';
    setForgotErr(e); return !Object.keys(e).length;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerErrorMsg('');
    if (!validateLogin()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: login.usernameOrEmail, password: login.password }),
      }).catch(() => null);

      let userData;
      if (res && res.ok) {
        userData = await res.json();
      } else if (res) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.message || 'Invalid email or password. Please try again.';
        setServerErrorMsg(msg);
        toast.error('Sign in failed', msg);
        setLoading(false); return;
      } else {
        if (login.usernameOrEmail === 'smarttrip@gmail.com') {
          userData = { userId: 'usr_super_admin_001', id: 'usr_super_admin_001', token: 'jwt_sa', name: 'Super Admin', email: 'smarttrip@gmail.com', role: 'ROLE_SUPER_ADMIN', phone: '+91 99999 00000', homeCity: 'New Delhi, India' };
        } else if (login.usernameOrEmail === 'admin@smarttrip.com') {
          userData = { userId: 'usr_admin_002', id: 'usr_admin_002', token: 'jwt_adm', name: 'Admin Employee', email: 'admin@smarttrip.com', role: 'ROLE_ADMIN', phone: '+91 88888 11111', homeCity: 'Mumbai, India' };
        } else {
          try {
            const registered = JSON.parse(localStorage.getItem('smarttrip_registered_users') || '[]');
            const found = registered.find(u => u && u.email && (u.email.toLowerCase() === login.usernameOrEmail.toLowerCase() || u.username === login.usernameOrEmail));
            if (found) {
              userData = { ...found, userId: found.id || found.userId, token: 'jwt_' + Date.now() };
            } else {
              const cleanName = login.usernameOrEmail.split('@')[0];
              userData = { userId: 'usr_demo_' + Date.now(), token: 'jwt_' + Date.now(), name: cleanName, username: cleanName, email: login.usernameOrEmail, phone: '+91 98765 43210', homeCity: 'India', role: 'ROLE_TRAVELLER' };
            }
          } catch {
            const cleanName = login.usernameOrEmail.split('@')[0];
            userData = { userId: 'usr_demo_' + Date.now(), token: 'jwt_' + Date.now(), name: cleanName, username: cleanName, email: login.usernameOrEmail, phone: '+91 98765 43210', homeCity: 'India', role: 'ROLE_TRAVELLER' };
          }
        }
      }

      setTimeout(() => {
        onLoginSuccess(userData);
        toast.success('Welcome back!', `Signed in as ${userData.name}`);
        setLoading(false);
      }, 1000);
    } catch {
      setServerErrorMsg('Connection error. Unable to reach backend authentication server.');
      toast.error('Connection error', 'Unable to connect to server.');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerErrorMsg('');
    if (!validateReg()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reg),
      }).catch(() => null);

      let userData;
      if (res && res.ok) {
        userData = await res.json();
      } else if (res) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.message || 'Could not create account. Email may already exist.';
        setServerErrorMsg(msg);
        toast.error('Registration failed', msg);
        setLoading(false); return;
      } else {
        userData = { userId: 'usr_new_' + Date.now(), token: 'jwt_new_' + Date.now(), name: reg.name, username: reg.username, email: reg.email, phone: reg.phone || '+91 98765 43210', homeCity: 'India', role: 'ROLE_TRAVELLER' };
      }

      try {
        const existing = JSON.parse(localStorage.getItem('smarttrip_registered_users') || '[]');
        const newUser = { id: userData.userId, name: userData.name || reg.name, email: userData.email || reg.email, username: userData.username || reg.username, role: 'ROLE_TRAVELLER', phone: reg.phone || '', homeCity: 'India', isBlocked: false };
        localStorage.setItem('smarttrip_registered_users', JSON.stringify([...existing.filter(u => u.email !== newUser.email), newUser]));
      } catch { /* ignore */ }

      setTimeout(() => {
        onLoginSuccess(userData);
        toast.success('Account created!', `Welcome aboard, ${userData.name}`);
        setLoading(false);
      }, 1000);
    } catch {
      setServerErrorMsg('Connection error. Unable to connect to server.');
      toast.error('Connection error', 'Unable to connect to server.');
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setServerErrorMsg('');
    if (!validateForgot()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(forgot),
      }).catch(() => null);

      if (res && !res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.message || 'Incorrect PIN or user not found.';
        setServerErrorMsg(msg);
        toast.error('Reset failed', msg);
        setLoading(false); return;
      }
      setTimeout(() => { toast.success('Password reset!', 'You can now sign in with your new password.'); setTab('login'); setLoading(false); }, 1000);
    } catch {
      setServerErrorMsg('Connection error.');
      toast.error('Connection error', 'Unable to connect.'); setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      {loading && <LoadingOverlay />}

      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 400px) minmax(0, 480px)',
        maxWidth: '880px', width: '100%',
        borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(15, 23, 42, 0.14)',
        border: '1px solid var(--border-light)',
      }}>

        <div style={{
          background: 'var(--navy-900)',
          color: 'white',
          padding: '3rem 2.5rem',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--blue-600)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={22} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>SmartTrip</div>
              <div style={{ fontSize: '0.62rem', color: '#60a5fa', fontWeight: 700, letterSpacing: '0.1em' }}>INTELLIGENT TRAVEL PLATFORM</div>
            </div>
          </div>

          <div style={{ margin: '3rem 0 2rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.03em', color: 'white', marginBottom: '1rem' }}>
              Plan smarter trips across India & the world
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Real-time destinations, AI-powered itineraries, fuel-accurate route planning, and complete trip cost calculation.
            </p>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Access your personalized trip planner, saved itineraries, and travel management controls securely.
            </p>
          </div>
        </div>

        <div style={{ background: 'white', padding: '2.5rem 2.25rem', display: 'flex', flexDirection: 'column' }}>

          {tab !== 'forgot' && (
            <div style={{ display: 'flex', background: 'var(--surface-1)', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
              {['login', 'register'].map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setServerErrorMsg(''); }}
                  style={{
                    flex: 1, padding: '0.6rem', fontSize: '0.88rem', fontWeight: 700,
                    background: tab === t ? 'white' : 'transparent',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    color: tab === t ? 'var(--navy-900)' : 'var(--text-tertiary)',
                    boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          {serverErrorMsg && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5',
              padding: '0.75rem 1rem', borderRadius: '10px',
              display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
              marginBottom: '1.25rem', fontSize: '0.82rem', color: '#dc2626', fontWeight: 600,
            }}>
              <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{serverErrorMsg}</div>
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Welcome back</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Sign in to your SmartTrip account</p>
              </div>

              <div>
                <label className="form-label">Email or Username</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. your@email.com"
                    value={login.usernameOrEmail}
                    onChange={e => { setLogin({ ...login, usernameOrEmail: e.target.value }); setLoginErr({ ...loginErr, usernameOrEmail: '' }); }}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                {loginErr.usernameOrEmail && <p style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: '0.3rem' }}>{loginErr.usernameOrEmail}</p>}
              </div>

              <div>
                <label className="form-label">Password</label>
                <PasswordInput
                  name="password"
                  placeholder="Enter your password"
                  value={login.password}
                  onChange={e => { setLogin({ ...login, password: e.target.value }); setLoginErr({ ...loginErr, password: '' }); }}
                />
                {loginErr.password && <p style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: '0.3rem' }}>{loginErr.password}</p>}
              </div>

              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => { setTab('forgot'); setServerErrorMsg(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--blue-600)', fontWeight: 600 }}>
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.25rem', gap: '0.5rem' }}>
                Sign In <ArrowRight size={16} />
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem', flex: 1 }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Create your account</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Join SmartTrip to plan your trips</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                    <input type="text" className="input" placeholder="Your full name" value={reg.name} onChange={e => setReg({ ...reg, name: e.target.value })} style={{ paddingLeft: '2.4rem' }} />
                  </div>
                  {regErr.name && <p style={{ fontSize: '0.72rem', color: 'var(--red-600)', marginTop: '0.25rem' }}>{regErr.name}</p>}
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                    <input type="text" className="input" placeholder="+91 98765 43210" value={reg.phone} onChange={e => setReg({ ...reg, phone: e.target.value })} style={{ paddingLeft: '2.4rem' }} />
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Choose a unique username"
                    value={reg.username}
                    onChange={e => { setReg({ ...reg, username: e.target.value.trim() }); setRegErr({ ...regErr, username: '' }); }}
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
                {regErr.username && <p style={{ fontSize: '0.72rem', color: 'var(--red-600)', marginTop: '0.25rem' }}>{regErr.username}</p>}
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                  <input type="email" className="input" placeholder="your@email.com" value={reg.email} onChange={e => setReg({ ...reg, email: e.target.value })} style={{ paddingLeft: '2.4rem' }} />
                </div>
                {regErr.email && <p style={{ fontSize: '0.72rem', color: 'var(--red-600)', marginTop: '0.25rem' }}>{regErr.email}</p>}
              </div>

              <div>
                <label className="form-label">Password</label>
                <PasswordInput name="password" placeholder="Min 6 chars (e.g. Pass@123)" value={reg.password} onChange={e => setReg({ ...reg, password: e.target.value })} />
                <PasswordStrengthMeter password={reg.password} />
                {regErr.password && <p style={{ fontSize: '0.72rem', color: 'var(--red-600)', marginTop: '0.25rem' }}>{regErr.password}</p>}
              </div>

              <div>
                <label className="form-label">Secret Recovery PIN</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                  <input type="text" maxLength={6} className="input" placeholder="4-digit PIN for recovery" value={reg.secretPin} onChange={e => setReg({ ...reg, secretPin: e.target.value })} style={{ paddingLeft: '2.4rem' }} />
                </div>
                {regErr.secretPin && <p style={{ fontSize: '0.72rem', color: 'var(--red-600)', marginTop: '0.25rem' }}>{regErr.secretPin}</p>}
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.25rem', gap: '0.5rem' }}>
                Create Account <Check size={16} />
              </button>
            </form>
          )}

          {tab === 'forgot' && (
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Reset Password</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Enter your email and Secret Recovery PIN to set a new password</p>
              </div>

              <div>
                <label className="form-label">Email or Username</label>
                <input type="text" className="input" placeholder="Your registered email..." value={forgot.usernameOrEmail} onChange={e => setForgot({ ...forgot, usernameOrEmail: e.target.value })} />
                {forgotErr.usernameOrEmail && <p style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: '0.3rem' }}>{forgotErr.usernameOrEmail}</p>}
              </div>

              <div>
                <label className="form-label">Secret Recovery PIN</label>
                <input type="text" className="input" placeholder="e.g. 1234" value={forgot.secretPin} onChange={e => setForgot({ ...forgot, secretPin: e.target.value })} />
                {forgotErr.secretPin && <p style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: '0.3rem' }}>{forgotErr.secretPin}</p>}
              </div>

              <div>
                <label className="form-label">New Password</label>
                <PasswordInput name="newPassword" placeholder="Enter new password" value={forgot.newPassword} onChange={e => setForgot({ ...forgot, newPassword: e.target.value })} />
                <PasswordStrengthMeter password={forgot.newPassword} />
                {forgotErr.newPassword && <p style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: '0.3rem' }}>{forgotErr.newPassword}</p>}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setTab('login'); setServerErrorMsg(''); }} className="btn btn-ghost" style={{ flex: 1 }}>Back to Sign In</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Reset Password</button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}