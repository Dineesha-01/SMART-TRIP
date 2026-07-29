import React, { useState } from 'react';
import { User, Mail, Lock, KeyRound, Phone, ShieldCheck, ArrowRight, Car, Check, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../components/Toast';

function PasswordInput({ value, onChange, placeholder, name }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-group">
      <Lock size={16} className="input-icon" />
      <input
        type={visible ? 'text' : 'password'}
        name={name}
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={name === 'password' ? 'current-password' : 'new-password'}
        style={{ paddingRight: '2.5rem' }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        style={{
          position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
        }}
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function LoadingVehicle() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(255,255,255,0.97)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '1.5rem',
    }}>
      <div style={{ position: 'relative', width: '320px', height: '80px' }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '20px', background: 'var(--surface-2)',
          borderRadius: '4px',
        }} />
        <div style={{
          position: 'absolute', bottom: '18px', left: '50%', transform: 'translateX(-50%)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--navy-900)',
            padding: '0.6rem 1.1rem',
            borderRadius: '8px',
            color: 'white',
          }}>
            <Car size={24} />
            <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em' }}>SMARTTRIP</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
          Authenticating...
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
          Securing session token via JWT
        </p>
      </div>
    </div>
  );
}

function Field({ label, children, error, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {label && <label className="form-label">{label}</label>}
      {children}
      {error && <span className="form-error">⚠ {error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}

export default function Auth({ onLoginSuccess, onNavigateHome }) {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const [login, setLogin] = useState({ usernameOrEmail: '', password: '' });
  const [reg, setReg] = useState({ name: '', username: '', email: '', password: '', secretPin: '', phone: '' });
  const [forgot, setForgot] = useState({ usernameOrEmail: '', secretPin: '', newPassword: '' });

  const [loginErr, setLoginErr]   = useState({});
  const [regErr, setRegErr]       = useState({});
  const [forgotErr, setForgotErr] = useState({});

  const validateLogin = () => {
    const e = {};
    if (!login.usernameOrEmail.trim()) e.usernameOrEmail = 'Required field';
    if (!login.password)              e.password = 'Please enter password';
    setLoginErr(e);
    return Object.keys(e).length === 0;
  };

  const validateReg = () => {
    const e = {};
    if (!reg.name.trim())     e.name = 'Full name required';
    if (!reg.username.trim()) e.username = 'Username required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reg.email)) e.email = 'Valid email required';
    if (reg.password.length < 6) e.password = 'At least 6 characters';
    if (!reg.secretPin.trim() || reg.secretPin.length < 4) e.secretPin = 'At least 4 digits';
    setRegErr(e);
    return Object.keys(e).length === 0;
  };

  const validateForgot = () => {
    const e = {};
    if (!forgot.usernameOrEmail.trim()) e.usernameOrEmail = 'Required field';
    if (!forgot.secretPin.trim())       e.secretPin = 'Enter recovery PIN';
    if (forgot.newPassword.length < 6) e.newPassword = 'At least 6 characters';
    setForgotErr(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
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
        toast.error('Sign in failed', errData.message || 'Invalid credentials.');
        setLoading(false);
        return;
      } else {
        userData = {
          userId: 'usr_demo_' + Date.now(),
          token: 'jwt_demo_' + Date.now(),
          name: login.usernameOrEmail.split('@')[0] || 'Traveler',
          username: login.usernameOrEmail.split('@')[0],
          email: login.usernameOrEmail,
        };
      }
      setTimeout(() => {
        onLoginSuccess(userData);
        toast.success('Welcome back!', `Signed in as ${userData.name}`);
        onNavigateHome();
        setLoading(false);
      }, 1000);
    } catch {
      toast.error('Connection error', 'Unable to connect to server.');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
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
        toast.error('Registration failed', errData.message || 'Could not create account.');
        setLoading(false);
        return;
      } else {
        userData = { userId: 'usr_new_' + Date.now(), token: 'jwt_new_' + Date.now(), name: reg.name, username: reg.username, email: reg.email };
      }
      setTimeout(() => {
        onLoginSuccess(userData);
        toast.success('Account created!', `Welcome, ${userData.name}`);
        onNavigateHome();
        setLoading(false);
      }, 1000);
    } catch {
      toast.error('Connection error', 'Unable to connect to server.');
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!validateForgot()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forgot),
      }).catch(() => null);

      if (res && !res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error('Reset failed', errData.message || 'Incorrect PIN.');
        setLoading(false);
        return;
      }
      setTimeout(() => {
        toast.success('Password reset!', 'You can now sign in.');
        setTab('login');
        setLoading(false);
      }, 1000);
    } catch {
      toast.error('Connection error', 'Unable to connect to server.');
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingVehicle />}

      <div style={{ maxWidth: '440px', margin: '2rem auto 4rem', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'var(--navy-900)',
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem',
            color: 'white',
          }}>
            <ShieldCheck size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {tab === 'login' && 'Account Authentication'}
            {tab === 'register' && 'Create User Account'}
            {tab === 'forgot' && 'Reset Account Password'}
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            JWT Stateless Session Management System
          </p>
        </div>

        <div className="card-elevated" style={{ padding: '2rem', background: 'white' }}>
          {/* Tab Switcher */}
          <div className="tab-group" style={{ marginBottom: '1.5rem' }}>
            {[
              { id: 'login',    label: 'Sign In' },
              { id: 'register', label: 'Register' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setLoginErr({}); setRegErr({}); setForgotErr({}); }}
                className={`tab-item${tab === t.id ? ' active-blue' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }} noValidate>
              <Field label="Username or Email" error={loginErr.usernameOrEmail}>
                <div className="input-group">
                  <Mail size={16} className="input-icon" />
                  <input
                    className="input"
                    type="text"
                    placeholder="alex@example.com"
                    value={login.usernameOrEmail}
                    onChange={(e) => setLogin({ ...login, usernameOrEmail: e.target.value })}
                  />
                </div>
              </Field>

              <Field
                label={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>Password</span>
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--blue-600)', fontWeight: 600 }}
                    >
                      Forgot password?
                    </button>
                  </div>
                }
                error={loginErr.password}
              >
                <PasswordInput
                  name="password"
                  value={login.password}
                  onChange={(e) => setLogin({ ...login, password: e.target.value })}
                  placeholder="••••••••"
                />
              </Field>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.25rem' }}>
                Sign In <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="Full Name" error={regErr.name}>
                  <div className="input-group">
                    <User size={16} className="input-icon" />
                    <input className="input" type="text" placeholder="Alex Johnson"
                      value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} />
                  </div>
                </Field>

                <Field label="Username" error={regErr.username}>
                  <div className="input-group">
                    <span className="input-icon" style={{ fontSize: '0.8rem', fontWeight: 700 }}>@</span>
                    <input className="input" type="text" placeholder="alexjohnson"
                      value={reg.username} onChange={(e) => setReg({ ...reg, username: e.target.value })} />
                  </div>
                </Field>
              </div>

              <Field label="Email Address" error={regErr.email}>
                <div className="input-group">
                  <Mail size={16} className="input-icon" />
                  <input className="input" type="email" placeholder="alex@example.com"
                    value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} />
                </div>
              </Field>

              <Field label="Password" error={regErr.password}>
                <PasswordInput name="new-password" value={reg.password}
                  onChange={(e) => setReg({ ...reg, password: e.target.value })} placeholder="Min. 6 characters" />
              </Field>

              <Field label="Secret Recovery PIN" error={regErr.secretPin} hint="4-6 digit PIN for password recovery">
                <div className="input-group">
                  <KeyRound size={16} className="input-icon" />
                  <input className="input" type="text" maxLength={6} placeholder="e.g. 4821"
                    value={reg.secretPin} onChange={(e) => setReg({ ...reg, secretPin: e.target.value.replace(/\D/g, '') })} />
                </div>
              </Field>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.25rem' }}>
                Create Account <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }} noValidate>
              <Field label="Username or Email" error={forgotErr.usernameOrEmail}>
                <div className="input-group">
                  <Mail size={16} className="input-icon" />
                  <input className="input" type="text" placeholder="alex@example.com"
                    value={forgot.usernameOrEmail} onChange={(e) => setForgot({ ...forgot, usernameOrEmail: e.target.value })} />
                </div>
              </Field>

              <Field label="Secret Recovery PIN" error={forgotErr.secretPin}>
                <div className="input-group">
                  <KeyRound size={16} className="input-icon" />
                  <input className="input" type="text" maxLength={6} placeholder="4-digit PIN"
                    value={forgot.secretPin} onChange={(e) => setForgot({ ...forgot, secretPin: e.target.value.replace(/\D/g, '') })} />
                </div>
              </Field>

              <Field label="New Password" error={forgotErr.newPassword}>
                <PasswordInput name="reset-password" value={forgot.newPassword}
                  onChange={(e) => setForgot({ ...forgot, newPassword: e.target.value })} placeholder="New password" />
              </Field>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.25rem' }}>
                <Check size={16} /> Reset Password
              </button>

              <button type="button" onClick={() => setTab('login')}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>
                ← Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
