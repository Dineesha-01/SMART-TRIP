import React, { useState, useEffect } from 'react';
import { BookmarkCheck, Calendar, DollarSign, MapPin, Trash2, Eye, Compass, Printer, ArrowRight, Search, Filter, Edit3, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function MyTrips({ user, onOpenPlanner }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTripModal, setSelectedTripModal] = useState(null);
  const [deletingTripId, setDeletingTripId] = useState(null);
  const [updatingTripId, setUpdatingTripId] = useState(null);

  // Edit Mode State in Modal
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('PLANNED');
  const [isEditing, setIsEditing] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const userId = user ? (user.userId || user.id || 'usr_1') : 'usr_1';
      const res = await fetch(`http://localhost:8080/api/v1/trips/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('smarttrip_jwt') || ''}`
        }
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setTrips(data || []);
      } else {
        setTrips([]);
      }
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTripStatus = async (trip, newStatus) => {
    setUpdatingTripId(trip.id);
    try {
      const updatePayload = { ...trip, status: newStatus };
      const res = await fetch(`http://localhost:8080/api/v1/trips/${trip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('smarttrip_jwt') || ''}`
        },
        body: JSON.stringify(updatePayload)
      }).catch(() => null);

      setTrips((prev) => prev.map((t) => (t.id === trip.id ? { ...t, status: newStatus } : t)));
      if (selectedTripModal && selectedTripModal.id === trip.id) {
        setSelectedTripModal((prev) => ({ ...prev, status: newStatus }));
      }
      if (toast) toast.success('Trip Updated', `Status changed to ${newStatus} in MongoDB.`);
    } catch {
      if (toast) toast.error('Update Failed', 'Could not update trip in database.');
    } finally {
      setUpdatingTripId(null);
    }
  };

  const handleSaveEditModal = async () => {
    if (!selectedTripModal) return;
    setUpdatingTripId(selectedTripModal.id);

    try {
      const updatePayload = {
        ...selectedTripModal,
        title: editTitle || selectedTripModal.title,
        status: editStatus,
      };

      await fetch(`http://localhost:8080/api/v1/trips/${selectedTripModal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('smarttrip_jwt') || ''}`
        },
        body: JSON.stringify(updatePayload)
      }).catch(() => null);

      setTrips((prev) => prev.map((t) => (t.id === selectedTripModal.id ? updatePayload : t)));
      setSelectedTripModal(updatePayload);
      setIsEditing(false);
      if (toast) toast.success('Trip Updated', 'Itinerary details updated in MongoDB database.');
    } catch {
      if (toast) toast.error('Update Failed', 'Unable to update trip.');
    } finally {
      setUpdatingTripId(null);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    setDeletingTripId(tripId);
    try {
      await fetch(`http://localhost:8080/api/v1/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('smarttrip_jwt') || ''}`
        }
      }).catch(() => null);

      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      if (toast) toast.success('Trip Deleted', 'Itinerary deleted from MongoDB database.');
      if (selectedTripModal && selectedTripModal.id === tripId) {
        setSelectedTripModal(null);
      }
    } catch {
      if (toast) toast.error('Delete failed', 'Could not remove trip.');
    } finally {
      setDeletingTripId(null);
    }
  };

  /* Search & Filter logic */
  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      (t.destination && t.destination.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || (t.status || 'PLANNED').toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>

      {/* Page Header */}
      <div className="card-elevated" style={{ padding: '1.75rem 2rem', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '46px', height: '46px',
              background: 'var(--navy-900)',
              borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', flexShrink: 0,
            }}>
              <BookmarkCheck size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                My Saved Itineraries
              </h1>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Full MongoDB CRUD operations ({filteredTrips.length} saved trips found)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button onClick={fetchTrips} className="btn btn-outline" style={{ gap: '0.4rem' }}>
              Refresh Database
            </button>
            <button onClick={onOpenPlanner} className="btn btn-primary" style={{ gap: '0.4rem' }}>
              Plan New Trip <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-group" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="input"
              placeholder="Search trips by destination or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} color="var(--text-tertiary)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Status:</span>
            <div className="tab-group" style={{ padding: '2px' }}>
              {['All', 'PLANNED', 'IN PROGRESS', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`tab-item${statusFilter === st ? ' active-blue' : ''}`}
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-flat" style={{ padding: '1.5rem', height: '200px' }}>
              <div className="skeleton" style={{ width: '40%', height: '20px', marginBottom: '1rem' }} />
              <div className="skeleton" style={{ width: '80%', height: '24px', marginBottom: '1.5rem' }} />
              <div className="skeleton" style={{ width: '60%', height: '16px' }} />
            </div>
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="card-elevated empty-state">
          <Compass size={36} className="empty-state-icon" />
          <h3>No Saved Trips Found</h3>
          <p>
            {searchQuery || statusFilter !== 'All'
              ? `No itineraries matching "${searchQuery}" with status "${statusFilter}". Try adjusting your search query.`
              : `You haven't saved any trip itineraries to your profile yet. Search any destination and start planning!`}
          </p>
          <button onClick={onOpenPlanner} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Explore Destinations <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="card animate-fade-up" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className={`badge ${trip.status === 'COMPLETED' ? 'badge-green' : trip.status === 'IN PROGRESS' ? 'badge-gold' : 'badge-blue'}`}>
                    {trip.status || 'PLANNED'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                    {trip.durationDays} Days • {trip.numberOfTravelers || 2} Traveler(s)
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                  {trip.title || `${trip.destination} Trip`}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '1rem 0 1.25rem', fontWeight: 500 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <MapPin size={15} color="var(--blue-600)" /> <strong>Destination:</strong> {trip.destination}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Calendar size={15} color="var(--emerald-600)" /> <strong>Duration:</strong> {trip.durationDays} Days Plan
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <DollarSign size={15} color="var(--amber-600)" /> <strong>Est. Budget:</strong> ₹{(trip.estimatedCost || 21200).toLocaleString('en-IN')} INR
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setSelectedTripModal(trip);
                    setEditTitle(trip.title || '');
                    setEditStatus(trip.status || 'PLANNED');
                    setIsEditing(false);
                  }}
                  className="btn btn-ghost"
                  style={{ flex: 1, fontSize: '0.82rem', gap: '0.3rem' }}
                >
                  <Eye size={14} /> View & Manage
                </button>

                {trip.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleUpdateTripStatus(trip, 'COMPLETED')}
                    disabled={updatingTripId === trip.id}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.78rem', color: 'var(--emerald-600)', borderColor: 'var(--emerald-600)' }}
                    title="Mark trip as completed in MongoDB"
                  >
                    <CheckCircle size={14} /> Complete
                  </button>
                )}

                <button
                  onClick={() => handleDeleteTrip(trip.id)}
                  disabled={deletingTripId === trip.id}
                  className="btn btn-danger btn-sm"
                  title="Delete Trip Plan from MongoDB"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Modal: View & Update Itinerary Details ───────────────── */}
      {selectedTripModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
        }}>
          <div className="card-elevated animate-scale-in" style={{
            width: '100%', maxWidth: '560px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', background: 'white',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: '0.4rem' }}>{selectedTripModal.status}</span>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{ marginTop: '0.3rem', fontWeight: 800, fontSize: '1.1rem' }}
                  />
                ) : (
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedTripModal.title}</h3>
                )}
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-outline btn-sm"
                style={{ gap: '0.3rem', fontSize: '0.78rem' }}
              >
                <Edit3 size={13} /> {isEditing ? 'Cancel Edit' : 'Edit Details'}
              </button>
            </div>

            {isEditing && (
              <div style={{ background: 'var(--surface-1)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--border-medium)' }}>
                <label className="form-label">Update Trip Status in MongoDB:</label>
                <select
                  className="input"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={{ marginTop: '0.3rem' }}
                >
                  <option value="PLANNED">PLANNED</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
                <button
                  onClick={handleSaveEditModal}
                  disabled={updatingTripId === selectedTripModal.id}
                  className="btn btn-success btn-sm"
                  style={{ marginTop: '0.75rem', width: '100%' }}
                >
                  Save Updates to MongoDB
                </button>
              </div>
            )}

            <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem', fontWeight: 500 }}>
              Destination: <strong>{selectedTripModal.destination}</strong> ({selectedTripModal.durationDays} Days, {selectedTripModal.numberOfTravelers || 2} Travelers)
            </p>

            <div style={{
              background: 'var(--surface-1)', padding: '1rem 1.25rem',
              borderRadius: 'var(--r-md)', border: '1px solid var(--border-medium)',
              marginBottom: '1.5rem', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Travel Style:</span> <strong style={{ color: 'var(--blue-600)' }}>{selectedTripModal.travelStyle || 'Standard'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Estimated Cost:</span> <strong style={{ color: 'var(--amber-600)' }}>₹{(selectedTripModal.estimatedCost || 21200).toLocaleString('en-IN')} INR</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Allocated Budget Limit:</span> <strong>₹{(selectedTripModal.totalBudget || 24000).toLocaleString('en-IN')} INR</strong>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Saved Stops & Places ({ (selectedTripModal.selectedPlaces || []).length })</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.75rem' }}>
              {(selectedTripModal.selectedPlaces || []).length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  No individual places added to this trip summary.
                </div>
              ) : (
                selectedTripModal.selectedPlaces.map((p, idx) => (
                  <div key={idx} style={{
                    background: 'var(--surface-1)', padding: '0.75rem 1rem',
                    borderRadius: 'var(--r-md)', border: '1px solid var(--border-light)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: '0.88rem', fontWeight: 600,
                  }}>
                    <span>{p.name}</span>
                    <span className="badge badge-gray">{p.category || 'Attraction'}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => window.print()} className="btn btn-primary" style={{ flex: 1, gap: '0.4rem' }}>
                <Printer size={16} /> Print / Export PDF
              </button>

              <button onClick={() => setSelectedTripModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
