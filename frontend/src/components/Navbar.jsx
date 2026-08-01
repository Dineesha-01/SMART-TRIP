import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Compass, MapPin, BookmarkCheck, User, LogOut, LogIn, ShieldCheck } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const isAdminUser = user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'ROLE_ADMIN' || user?.email === 'smarttrip@gmail.com';

  const navItems = [
    { path: '/',         label: 'Home',           icon: <Compass size={15} /> },
    { path: '/planner',  label: 'Trip Planner',   icon: <MapPin size={15} /> },
    { path: '/trips',    label: 'My Saved Trips', icon: <BookmarkCheck size={15} /> },
  ];

  if (isAdminUser) {
    navItems.push({ path: '/admin', label: 'Admin Dashboard', icon: <ShieldCheck size={15} /> });
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: '#ffffff',
      borderBottom: '1px solid var(--border-light)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px',
      }}>
        {/* Brand */}
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}
        >
          <div style={{
            width: '34px', height: '34px',
            background: 'var(--navy-900)',
            borderRadius: 'var(--r-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
          }}>
            <Compass size={18} />
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1 }}>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem', fontWeight: 800,
              color: 'var(--navy-900)',
              letterSpacing: '-0.02em',
            }}>
              SmartTrip
            </span>
            <span style={{
              display: 'block', fontSize: '0.58rem', fontWeight: 700,
              color: 'var(--blue-600)', letterSpacing: '0.08em', marginTop: '2px',
            }}>
              EASY TRAVEL PLANNER
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav style={{ display: 'flex', gap: '4px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--r-sm)',
                fontWeight: 600, fontSize: '0.85rem',
                textDecoration: 'none',
                transition: 'var(--ease-fast)',
                background: isActive ? 'var(--blue-50)' : 'transparent',
                color: isActive ? 'var(--blue-600)' : 'var(--text-secondary)',
              })}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Account Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {user ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.35rem 0.85rem',
                  background: 'var(--surface-1)', border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--r-full)', cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <div style={{
                  width: '24px', height: '24px',
                  background: 'var(--blue-600)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 700, color: 'white',
                }}>
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {user.name}
                </span>
                <User size={13} color="var(--text-tertiary)" />
              </button>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="btn btn-danger btn-sm"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <LogIn size={15} /> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
