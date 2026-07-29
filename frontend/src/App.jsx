import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Planner from './pages/Planner';
import MyTrips from './pages/MyTrips';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import FloatingAiAgent from './components/FloatingAiAgent';
import { ToastProvider, ErrorBoundary } from './components/Toast';

export default function App() {
  const [destination, setDestination] = useState('Jaipur');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Restore JWT Session from localStorage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem('smarttrip_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        const demoUser = {
          userId: 'usr_demo_123',
          token: 'jwt_demo_token_xyz',
          name: 'Alex Johnson',
          username: 'alexjohnson',
          email: 'alex@example.com',
          phone: '+91 98765 43210',
          homeCity: 'New Delhi, India',
          role: 'ROLE_TRAVELLER'
        };
        setUser(demoUser);
        localStorage.setItem('smarttrip_user', JSON.stringify(demoUser));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectDestination = (destName) => {
    setDestination(destName);
    navigate('/planner');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('smarttrip_user', JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem('smarttrip_jwt', userData.token);
    }
    if (userData.role === 'ROLE_SUPER_ADMIN' || userData.role === 'ROLE_ADMIN' || userData.email === 'smarttrip@gmail.com') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('smarttrip_user');
    localStorage.removeItem('smarttrip_jwt');
    navigate('/');
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

          {/* Top Navbar */}
          <Navbar
            user={user}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem 0' }}>
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    onSelectDestination={handleSelectDestination}
                    onOpenPlanner={() => navigate('/planner')}
                  />
                }
              />

              <Route
                path="/planner"
                element={
                  <Planner
                    destination={destination}
                    user={user}
                    onSaveSuccess={() => {}}
                    onOpenAuth={() => navigate('/login')}
                  />
                }
              />

              <Route
                path="/trips"
                element={
                  <MyTrips
                    user={user}
                    onOpenPlanner={() => navigate('/planner')}
                  />
                }
              />

              <Route
                path="/profile"
                element={
                  <Profile
                    user={user}
                    onUpdateProfile={(updated) => {
                      setUser(updated);
                      localStorage.setItem('smarttrip_user', JSON.stringify(updated));
                    }}
                  />
                }
              />

              <Route
                path="/admin"
                element={
                  <AdminDashboard
                    user={user}
                  />
                }
              />

              <Route
                path="/login"
                element={
                  <Auth
                    onLoginSuccess={handleLoginSuccess}
                    onNavigateHome={() => navigate('/')}
                  />
                }
              />

              <Route
                path="/auth"
                element={
                  <Auth
                    onLoginSuccess={handleLoginSuccess}
                    onNavigateHome={() => navigate('/')}
                  />
                }
              />
            </Routes>
          </main>

          {/* Global Floating AI Agent Toggle Widget */}
          <FloatingAiAgent destination={destination} />

          {/* Footer */}
          <footer style={{
            borderTop: '1px solid var(--border-light)',
            padding: '1.75rem 1.5rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-tertiary)',
            background: 'var(--surface-0)',
            marginTop: 'auto',
          }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                SmartTrip Platform
              </div>
              <div>
                © 2026 SmartTrip Intelligent Travel System. All rights reserved.
              </div>
            </div>
          </footer>

        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
