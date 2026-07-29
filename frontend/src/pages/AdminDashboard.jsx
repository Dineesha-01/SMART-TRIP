import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Activity, Crown, UserCheck, Lock, Unlock, UserPlus, X, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({ totalUsers: 3, totalTrips: 1, superAdminCount: 1, adminCount: 1, travellerCount: 1 });
  const [usersList, setUsersList] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  // New Admin Form State
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  const toast = useToast();

  const isSuperAdmin = user?.role === 'ROLE_SUPER_ADMIN' || user?.email === 'smarttrip@gmail.com';

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch system stats
      const statsRes = await fetch('http://localhost:8080/api/v1/admin/stats').catch(() => null);
      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch users
      const usersRes = await fetch('http://localhost:8080/api/v1/admin/users').catch(() => null);
      if (usersRes && usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData);
      } else {
        // Fallback default mock list
        setUsersList([
          { id: 'usr_super_admin_001', name: 'Super Admin', email: 'smarttrip@gmail.com', role: 'ROLE_SUPER_ADMIN', homeCity: 'New Delhi, India', phone: '+91 99999 00000', isBlocked: false },
          { id: 'usr_admin_002', name: 'Admin Employee', email: 'admin@smarttrip.com', role: 'ROLE_ADMIN', homeCity: 'Mumbai, India', phone: '+91 88888 11111', isBlocked: false },
          { id: 'usr_demo_123', name: 'Alex Johnson', email: 'alex@example.com', role: 'ROLE_TRAVELLER', homeCity: 'San Francisco', phone: '+1 (555) 234-5678', isBlocked: false },
        ]);
      }

      // Fetch trips
      const tripsRes = await fetch('http://localhost:8080/api/v1/admin/trips').catch(() => null);
      if (tripsRes && tripsRes.ok) {
        const tripsData = await tripsRes.json();
        setTripsList(tripsData);
      } else {
        setTripsList([
          { id: 't1', title: '3-Day Paris Cultural Expedition', destination: 'Paris', userId: 'usr_demo_123', durationDays: 3, estimatedCost: 21200, status: 'PLANNED' },
          { id: 't2', title: 'Manali Snow & Adventure Tour', destination: 'Manali', userId: 'usr_demo_123', durationDays: 4, estimatedCost: 28500, status: 'CONFIRMED' },
        ]);
      }
    } catch (err) {
      console.warn('Admin fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminPassword.trim() || !newAdminName.trim()) return;

    setAddingAdmin(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
          phone: newAdminPhone || '+91 99999 88888',
        }),
      }).catch(() => null);

      if (res && res.ok) {
        if (toast) toast.success('Admin Created!', `Employee Admin "${newAdminName}" created successfully.`);
        setShowAddAdminModal(false);
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPassword('');
        setNewAdminPhone('');
        fetchAdminData();
      } else {
        // Local state fallback if backend offline
        const newAdminObj = {
          id: `usr_admin_${Date.now()}`,
          name: newAdminName,
          email: newAdminEmail,
          role: 'ROLE_ADMIN',
          homeCity: 'SmartTrip HQ',
          phone: newAdminPhone || '+91 99999 88888',
          isBlocked: false,
        };
        setUsersList((prev) => [...prev, newAdminObj]);
        if (toast) toast.success('Admin Created!', `Employee Admin "${newAdminName}" created.`);
        setShowAddAdminModal(false);
      }
    } catch (err) {
      if (toast) toast.error('Error', err.message);
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleToggleBlock = async (targetUser) => {
    if (targetUser.role === 'ROLE_SUPER_ADMIN') {
      if (toast) toast.error('Action Restricted', 'Super Admin account cannot be blocked.');
      return;
    }

    try {
      await fetch(`http://localhost:8080/api/v1/admin/users/${targetUser.id}/toggle-block`, {
        method: 'PUT',
      }).catch(() => null);

      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isBlocked: !u.isBlocked } : u))
      );

      const nextState = !targetUser.isBlocked;
      if (toast) {
        if (nextState) {
          toast.error('User Blocked', `Account "${targetUser.name}" has been suspended.`);
        } else {
          toast.success('User Unblocked', `Account "${targetUser.name}" access has been restored.`);
        }
      }
    } catch {
      // Local toggle fallback
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isBlocked: !u.isBlocked } : u))
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>

      {/* Header Banner */}
      <div className="card-elevated" style={{ padding: '1.6rem 1.8rem', background: 'var(--navy-900)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '46px', height: '46px',
              background: 'var(--blue-600)',
              borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', flexShrink: 0,
            }}>
              {isSuperAdmin ? <Crown size={24} color="#f59e0b" /> : <ShieldCheck size={24} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
                  {isSuperAdmin ? 'Super Admin System Control Panel' : 'Employee Admin Dashboard'}
                </h1>
                <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                  {user?.role || (isSuperAdmin ? 'ROLE_SUPER_ADMIN' : 'ROLE_ADMIN')}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                Logged in as: <strong>{user?.email || 'smarttrip@gmail.com'}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {isSuperAdmin && (
              <button
                onClick={() => setShowAddAdminModal(true)}
                className="btn btn-gold"
                style={{ gap: '0.4rem' }}
              >
                <UserPlus size={16} /> + Add New Admin Employee
              </button>
            )}
            <button onClick={fetchAdminData} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Stat Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="card-elevated" style={{ padding: '1.25rem', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Total Registered Users</span>
            <Users size={18} color="var(--blue-600)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.3rem' }}>
            {usersList.length}
          </div>
        </div>

        <div className="card-elevated" style={{ padding: '1.25rem', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Total Trips & Activities</span>
            <Activity size={18} color="var(--emerald-600)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: '0.3rem' }}>
            {tripsList.length}
          </div>
        </div>

        <div className="card-elevated" style={{ padding: '1.25rem', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Super Admins</span>
            <Crown size={18} color="var(--amber-600)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amber-600)', marginTop: '0.3rem' }}>
            {usersList.filter(u => u.role === 'ROLE_SUPER_ADMIN').length || 1}
          </div>
        </div>

        <div className="card-elevated" style={{ padding: '1.25rem', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Employees / Admins</span>
            <UserCheck size={18} color="var(--violet-600)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--violet-600)', marginTop: '0.3rem' }}>
            {usersList.filter(u => u.role === 'ROLE_ADMIN').length}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-group">
        <button
          onClick={() => setActiveTab('users')}
          className={`tab-item${activeTab === 'users' ? ' active-blue' : ''}`}
        >
          <Users size={15} /> All Users & Access Controls ({usersList.length})
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('trips')}
            className={`tab-item${activeTab === 'trips' ? ' active-blue' : ''}`}
          >
            <Activity size={15} /> All User Travel Activities ({tripsList.length})
          </button>
        )}
      </div>

      {/* All Users View with Block / Unblock Management */}
      {activeTab === 'users' && (
        <div className="card-elevated" style={{ padding: '1.5rem', background: 'white' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
            User Management & Access Control
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-1)', borderBottom: '2px solid var(--border-medium)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email Address</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Access Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id || u.email} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{u.name}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--blue-600)', fontWeight: 600 }}>{u.email}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${u.role === 'ROLE_SUPER_ADMIN' ? 'badge-gold' : u.role === 'ROLE_ADMIN' ? 'badge-blue' : 'badge-gray'}`}>
                        {u.role || 'ROLE_TRAVELLER'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {u.isBlocked ? (
                        <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Lock size={12} /> Suspended / Blocked
                        </span>
                      ) : (
                        <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Unlock size={12} /> Active Access
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      {u.role !== 'ROLE_SUPER_ADMIN' && isSuperAdmin && (
                        <button
                          onClick={() => handleToggleBlock(u)}
                          className={`btn ${u.isBlocked ? 'btn-success' : 'btn-danger'} btn-sm`}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem' }}
                        >
                          {u.isBlocked ? <Unlock size={13} /> : <Lock size={13} />}
                          {u.isBlocked ? 'Unblock Access' : 'Block Access'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Trips Activity View (Super Admin Only) */}
      {activeTab === 'trips' && isSuperAdmin && (
        <div className="card-elevated" style={{ padding: '1.5rem', background: 'white' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
            System-Wide Travel Activities & Booked Trips
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-1)', borderBottom: '2px solid var(--border-medium)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Trip Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Destination</th>
                  <th style={{ padding: '0.75rem 1rem' }}>User ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Est. Cost (₹)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tripsList.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{t.title}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--blue-600)', fontWeight: 600 }}>{t.destination}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-tertiary)' }}>{t.userId}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{t.durationDays} Days</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
                      ₹{t.estimatedCost?.toLocaleString('en-IN') || '21,200'} INR
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge-blue">{t.status || 'PLANNED'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Admin Employee Modal */}
      {showAddAdminModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div className="card-elevated" style={{ width: '100%', maxWidth: '440px', background: 'white', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserPlus size={20} color="var(--blue-600)" /> Add New Employee Admin
              </h3>
              <button onClick={() => setShowAddAdminModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="var(--text-tertiary)" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Employee Full Name:</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Rahul Sharma"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Employee Work Email:</label>
                <input
                  type="email"
                  className="input"
                  placeholder="e.g. rahul@smarttrip.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Password:</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Set initial password..."
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Phone Number:</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. +91 98765 11111"
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddAdminModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={addingAdmin} className="btn btn-primary" style={{ flex: 1 }}>
                  {addingAdmin ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
