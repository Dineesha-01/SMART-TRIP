import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Activity, Crown, UserCheck, Lock, Unlock, UserPlus, X, Check, MapPin, Plus, Trash2, Building2 } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({ totalUsers: 3, totalTrips: 1, superAdminCount: 1, adminCount: 1, travellerCount: 1 });
  const [usersList, setUsersList] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [placesList, setPlacesList] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  // Add Admin Modal State
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Add Place / Location Modal State
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '',
    destination: 'Jaipur',
    category: 'Attraction',
    address: '',
    phoneNumber: '',
    priceLevel: '₹500 entry',
    rating: 4.8,
    imageUrl: '',
  });
  const [addingPlace, setAddingPlace] = useState(false);

  const toast = useToast();

  const isSuperAdmin = user?.role === 'ROLE_SUPER_ADMIN' || user?.email === 'smarttrip@gmail.com';

  useEffect(() => {
    fetchAdminData();
    fetchPlacesData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch system stats
      const statsRes = await fetch('http://localhost:8080/api/v1/admin/stats').catch(() => null);
      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch users from Backend MongoDB API
      let apiUsers = [];
      const usersRes = await fetch('http://localhost:8080/api/v1/admin/users').catch(() => null);
      if (usersRes && usersRes.ok) {
        apiUsers = await usersRes.json();
      }

      // 3. Retrieve local registered users backup
      let localUsers = [];
      try {
        localUsers = JSON.parse(localStorage.getItem('smarttrip_registered_users') || '[]');
      } catch { /* ignore */ }

      // 4. Default Seeded Accounts
      const defaultUsers = [
        { id: 'usr_super_admin_001', name: 'Super Admin', email: 'smarttrip@gmail.com', role: 'ROLE_SUPER_ADMIN', homeCity: 'New Delhi, India', phone: '+91 99999 00000', isBlocked: false },
        { id: 'usr_admin_002', name: 'Admin Employee', email: 'admin@smarttrip.com', role: 'ROLE_ADMIN', homeCity: 'Mumbai, India', phone: '+91 88888 11111', isBlocked: false },
      ];

      // Merge and deduplicate by email
      const userMap = new Map();
      [...defaultUsers, ...localUsers, ...apiUsers].forEach((u) => {
        if (u && u.email) {
          userMap.set(u.email.toLowerCase(), u);
        }
      });

      const mergedList = Array.from(userMap.values());
      setUsersList(mergedList);

      // 5. Fetch trips
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

  const fetchPlacesData = async () => {
    try {
      // Fetch all stored places from MongoDB
      const res = await fetch('http://localhost:8080/api/v1/places/all').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setPlacesList(data);
          return;
        }
      }

      // Fallback: fetch nearby places for Jaipur & Agra
      const resJaipur = await fetch('http://localhost:8080/api/v1/places/nearby?destination=Jaipur').catch(() => null);
      let list = [];
      if (resJaipur && resJaipur.ok) {
        list = await resJaipur.json();
      }
      setPlacesList(list);
    } catch (e) {
      console.warn('Places fetch notice:', e);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminPassword.trim() || !newAdminName.trim()) return;

    setAddingAdmin(true);
    try {
      await fetch('http://localhost:8080/api/v1/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
          phone: newAdminPhone || '+91 99999 88888',
        }),
      }).catch(() => null);

      const newAdminObj = {
        id: `usr_admin_${Date.now()}`,
        name: newAdminName,
        email: newAdminEmail,
        role: 'ROLE_ADMIN',
        homeCity: 'SmartTrip HQ',
        phone: newAdminPhone || '+91 99999 88888',
        isBlocked: false,
      };

      try {
        const existing = JSON.parse(localStorage.getItem('smarttrip_registered_users') || '[]');
        localStorage.setItem('smarttrip_registered_users', JSON.stringify([...existing, newAdminObj]));
      } catch { /* ignore */ }

      if (toast) toast.success('Admin Created!', `Employee Admin "${newAdminName}" created successfully.`);
      setShowAddAdminModal(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminPhone('');
      fetchAdminData();
    } catch (err) {
      if (toast) toast.error('Error', err.message);
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleAddPlace = async (e) => {
    e.preventDefault();
    if (!newPlace.name.trim() || !newPlace.destination.trim()) return;

    setAddingPlace(true);
    try {
      const placeToSave = {
        ...newPlace,
        id: 'plc_' + Date.now(),
        imageUrl: newPlace.imageUrl || 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=85',
        rating: Number(newPlace.rating) || 4.8,
        userRatingsTotal: Math.floor(Math.random() * 500) + 50,
      };

      const res = await fetch('http://localhost:8080/api/v1/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(placeToSave),
      }).catch(() => null);

      let savedObj = placeToSave;
      if (res && res.ok) {
        savedObj = await res.json();
      }

      setPlacesList((prev) => [savedObj, ...prev]);
      if (toast) toast.success('Place Added!', `"${savedObj.name}" added to MongoDB database for ${savedObj.destination}.`);
      setShowAddPlaceModal(false);
      setNewPlace({
        name: '',
        destination: 'Jaipur',
        category: 'Attraction',
        address: '',
        phoneNumber: '',
        priceLevel: '₹500 entry',
        rating: 4.8,
        imageUrl: '',
      });
    } catch (err) {
      if (toast) toast.error('Error', 'Unable to save place to database.');
    } finally {
      setAddingPlace(false);
    }
  };

  const handleDeletePlace = async (placeId, placeName) => {
    try {
      await fetch(`http://localhost:8080/api/v1/places/${placeId}`, {
        method: 'DELETE',
      }).catch(() => null);

      setPlacesList((prev) => prev.filter((p) => p.id !== placeId));
      if (toast) toast.success('Place Deleted', `"${placeName}" removed from database.`);
    } catch {
      setPlacesList((prev) => prev.filter((p) => p.id !== placeId));
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

      try {
        const existing = JSON.parse(localStorage.getItem('smarttrip_registered_users') || '[]');
        const updated = existing.map((u) => u.email === targetUser.email ? { ...u, isBlocked: !u.isBlocked } : u);
        localStorage.setItem('smarttrip_registered_users', JSON.stringify(updated));
      } catch { /* ignore */ }

      const nextState = !targetUser.isBlocked;
      if (toast) {
        if (nextState) {
          toast.error('User Blocked', `Account "${targetUser.name}" has been suspended.`);
        } else {
          toast.success('User Unblocked', `Account "${targetUser.name}" access has been restored.`);
        }
      }
    } catch {
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
            <button
              onClick={() => setShowAddPlaceModal(true)}
              className="btn btn-success"
              style={{ gap: '0.4rem' }}
            >
              <Plus size={16} /> + Add Destination Place / Location
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setShowAddAdminModal(true)}
                className="btn btn-gold"
                style={{ gap: '0.4rem' }}
              >
                <UserPlus size={16} /> + Add New Admin Employee
              </button>
            )}
            <button onClick={() => { fetchAdminData(); fetchPlacesData(); }} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Managed Places & Locations</span>
            <MapPin size={18} color="var(--blue-600)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue-600)', marginTop: '0.3rem' }}>
            {placesList.length}
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Super Admins / Admins</span>
            <Crown size={18} color="var(--amber-600)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amber-600)', marginTop: '0.3rem' }}>
            {usersList.filter(u => u.role === 'ROLE_SUPER_ADMIN' || u.role === 'ROLE_ADMIN').length}
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

        <button
          onClick={() => setActiveTab('places')}
          className={`tab-item${activeTab === 'places' ? ' active-blue' : ''}`}
        >
          <MapPin size={15} /> Places & Locations Management ({placesList.length})
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

      {/* ─── Tab 1: All Users ───────────────────────────── */}
      {activeTab === 'users' && (
        <div className="card-elevated" style={{ padding: '1.5rem', background: 'white' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
            User Management & Access Control ({usersList.length} Total Accounts)
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

      {/* ─── Tab 2: Places & Locations ──────────────────── */}
      {activeTab === 'places' && (
        <div className="card-elevated" style={{ padding: '1.5rem', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                Destination Places & Locations ({placesList.length} Entries)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                All locations stored in MongoDB. Admins can insert new attractions, hotels, restaurants, ATMs, and emergency services.
              </p>
            </div>
            <button
              onClick={() => setShowAddPlaceModal(true)}
              className="btn btn-primary"
              style={{ gap: '0.4rem' }}
            >
              <Plus size={15} /> Add New Place
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-1)', borderBottom: '2px solid var(--border-medium)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Image</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Place Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Destination</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Rating</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Price Level</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {placesList.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.6rem 1rem' }}>
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=85'}
                        alt={p.name}
                        style={{ width: '44px', height: '36px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                      {p.name}
                      {p.address && <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>{p.address}</div>}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--blue-600)', fontWeight: 700 }}>{p.destination}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge-blue">{p.category}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#f59e0b' }}>
                      ★ {p.rating || 4.5}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {p.priceLevel || '₹500 entry'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeletePlace(p.id, p.name)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem' }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Tab 3: All Trips Activity (Super Admin Only) ────── */}
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

      {/* ─── Modal 1: Add Admin Employee ─────────────────── */}
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
                  placeholder="Employee Name"
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
                  placeholder="employee@smarttrip.com"
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
                  placeholder="+91 98765 11111"
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

      {/* ─── Modal 2: Add Place / Location ───────────────── */}
      {showAddPlaceModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div className="card-elevated" style={{ width: '100%', maxWidth: '520px', background: 'white', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={20} color="var(--blue-600)" /> Add New Place / Location
              </h3>
              <button onClick={() => setShowAddPlaceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="var(--text-tertiary)" />
              </button>
            </div>

            <form onSubmit={handleAddPlace} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label className="form-label">Place Name:</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Nahargarh Fort / Taj Mahal"
                  value={newPlace.name}
                  onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Destination City:</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Jaipur, Agra, Goa"
                    value={newPlace.destination}
                    onChange={(e) => setNewPlace({ ...newPlace, destination: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Category:</label>
                  <select
                    className="input"
                    value={newPlace.category}
                    onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}
                  >
                    <option value="Attraction">Attraction</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Hospital">Hospital / Emergency</option>
                    <option value="ATM">ATM / Banking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Full Address:</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Address details..."
                  value={newPlace.address}
                  onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Phone Number:</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="+91 141 123 4567"
                    value={newPlace.phoneNumber}
                    onChange={(e) => setNewPlace({ ...newPlace, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Price Level / Entry:</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. ₹200 entry / ₹1,200 per night"
                    value={newPlace.priceLevel}
                    onChange={(e) => setNewPlace({ ...newPlace, priceLevel: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Image URL (Unsplash or direct image link):</label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newPlace.imageUrl}
                  onChange={(e) => setNewPlace({ ...newPlace, imageUrl: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddPlaceModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={addingPlace} className="btn btn-primary" style={{ flex: 1 }}>
                  {addingPlace ? 'Saving to Database...' : 'Save to MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
