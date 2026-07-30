import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Route, DollarSign, CloudSun, Save, Check, Search, AlertCircle, Calendar, Navigation, CheckSquare } from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';
import RouteOptimizer from '../components/RouteOptimizer';
import RoutePlanner from '../components/RoutePlanner';
import BudgetCalculator from '../components/BudgetCalculator';
import WeatherWidget from '../components/WeatherWidget';
import PackingChecklist from '../components/PackingChecklist';
import EmergencyContacts from '../components/EmergencyContacts';
import DayScheduleManager from '../components/DayScheduleManager';
import SelectedPlacesView from '../components/SelectedPlacesView';
import PlaceDetails from './PlaceDetails';
import { fetchRealPlaces } from '../services/mapService';
import { useToast } from '../components/Toast';

export default function Planner({ destination, user, onSaveSuccess, onOpenAuth }) {
  const [currentDestination, setCurrentDestination] = useState(destination || 'Jaipur');
  const [searchInputVal, setSearchInputVal] = useState(destination || 'Jaipur');
  const [plannerTab, setPlannerTab] = useState('places');
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlaces, setSelectedPlaces] = useState(() => {
    // Restore persistent selected places from localStorage on initial render
    try {
      const stored = localStorage.getItem(`smarttrip_selected_places_${destination || 'Jaipur'}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [durationDays, setDurationDays] = useState(3);
  const [travelersCount, setTravelersCount] = useState(2);
  const [estimatedCostInr, setEstimatedCostInr] = useState(21200);
  const [aiScheduleText, setAiScheduleText] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedPlaceDetail, setSelectedPlaceDetail] = useState(null);

  const toast = useToast();

  useEffect(() => {
    if (destination) {
      setCurrentDestination(destination);
      setSearchInputVal(destination);

      // Restore selected places for destination
      try {
        const stored = localStorage.getItem(`smarttrip_selected_places_${destination}`);
        if (stored) setSelectedPlaces(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, [destination]);

  // Real-time Automatic MongoDB Database Sync / Auto-Save Effect
  useEffect(() => {
    // 1. LocalStorage backup
    try {
      localStorage.setItem(`smarttrip_selected_places_${currentDestination}`, JSON.stringify(selectedPlaces));
    } catch { /* ignore */ }

    // 2. MongoDB Real-time Auto-Save
    const activeUserId = user ? (user.userId || user.id || 'usr_1') : 'usr_1';
    const timer = setTimeout(async () => {
      const tripPayload = {
        id: `trip_${currentDestination.toLowerCase().replace(/\s+/g, '_')}_${activeUserId}`,
        userId: activeUserId,
        destination: currentDestination,
        title: `${currentDestination} Itinerary`,
        durationDays,
        numberOfTravelers: travelersCount,
        totalBudget: Math.round(estimatedCostInr * 1.15),
        estimatedCost: estimatedCostInr,
        currency: 'INR',
        travelStyle: 'Standard',
        selectedPlaces,
        status: 'PLANNED',
      };

      try {
        await fetch('http://localhost:8080/api/v1/trips/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('smarttrip_jwt') || ''}`,
          },
          body: JSON.stringify(tripPayload),
        });
      } catch (err) {
        console.warn('Real-time database auto-save notice:', err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [selectedPlaces, currentDestination, durationDays, travelersCount, estimatedCostInr, user]);

  const loadPlacesForDestination = useCallback(async (destination) => {
    if (!destination || !destination.trim()) return;

    setPlacesLoading(true);
    try {
      const data = await fetchRealPlaces(destination, selectedCategory);
      setPlaces(data);
    } catch {
      setPlaces([]);
    } finally {
      setPlacesLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadPlacesForDestination(currentDestination);
  }, [currentDestination, loadPlacesForDestination]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const nextDestination = searchInputVal.trim();
    if (!nextDestination) return;

    setCurrentDestination(nextDestination);
    setSearchInputVal(nextDestination);
  };

  const handleTogglePlace = useCallback((place) => {
    setSelectedPlaces((prev) => {
      const isSelected = prev.some((item) => item.id === place.id);
      if (isSelected) {
        return prev.filter((item) => item.id !== place.id);
      }
      return [...prev, place];
    });
  }, []);

  const handleSaveTrip = async () => {
    setSaving(true);
    const activeUserId = user ? (user.userId || user.id || 'usr_1') : 'usr_1';
    const tripPayload = {
      id: `trip_${currentDestination.toLowerCase().replace(/\s+/g, '_')}_${activeUserId}`,
      userId: activeUserId,
      destination: currentDestination,
      title: `${currentDestination} Explorer Itinerary`,
      durationDays,
      numberOfTravelers: travelersCount,
      totalBudget: Math.round(estimatedCostInr * 1.15),
      estimatedCost: estimatedCostInr,
      currency: 'INR',
      travelStyle: 'Standard',
      selectedPlaces,
      status: 'PLANNED',
    };

    try {
      const res = await fetch('http://localhost:8080/api/v1/trips/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('smarttrip_jwt') || ''}`,
        },
        body: JSON.stringify(tripPayload),
      });

      if (res && res.ok) {
        setSavedSuccess(true);
        if (toast) toast.success('Trip Saved!', `Your trip to ${currentDestination} has been persisted to MongoDB database.`);
        if (onSaveSuccess) onSaveSuccess(tripPayload);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        if (toast) toast.error('Save Error', 'Backend server returned an error during save.');
      }
    } catch {
      if (toast) toast.error('Save Error', 'Unable to reach backend server on http://localhost:8080.');
    } finally {
      setSaving(false);
    }
  };

  /* Render Full Page Place Details view if selected */
  if (selectedPlaceDetail) {
    return (
      <PlaceDetails
        place={selectedPlaceDetail}
        destination={currentDestination}
        onBack={() => setSelectedPlaceDetail(null)}
        onTogglePlace={handleTogglePlace}
        isSelected={selectedPlaces.some((p) => p.id === selectedPlaceDetail.id)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>

      {/* Header Bar */}
      <div className="card-elevated" style={{ padding: '1.4rem 1.6rem', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.15rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px', height: '42px',
              background: 'var(--navy-900)',
              borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', flexShrink: 0,
            }}>
              <MapPin size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--navy-900)' }}>
                {currentDestination} Trip Planner
              </h1>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-tertiary)', fontWeight: 500, marginTop: '2px' }}>
                <span
                  onClick={() => setPlannerTab('selected')}
                  className="badge badge-blue"
                  style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                  title="Click to view dedicated Selected Places tab"
                >
                  {selectedPlaces.length} Places Selected (Auto-Saved to DB ✓)
                </span>
                Est. Cost: <strong style={{ color: 'var(--blue-600)' }}>₹{estimatedCostInr.toLocaleString('en-IN')} INR</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <form onSubmit={handleSearchSubmit} className="input-group" style={{ width: '250px' }}>
              <Search size={16} className="input-icon" />
              <input
                type="text"
                className="input"
                placeholder="Change destination city..."
                value={searchInputVal}
                onChange={(e) => setSearchInputVal(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </form>

            <button
              onClick={handleSaveTrip}
              className={`btn ${savedSuccess ? 'btn-success' : 'btn-primary'}`}
              disabled={saving}
            >
              {savedSuccess ? <Check size={16} /> : <Save size={16} />}
              {savedSuccess ? 'Saved to DB!' : 'Save Trip'}
            </button>
          </div>
        </div>
      </div>

      {/* Planner Tabs */}
      <div className="tab-group">
        {[
          { id: 'places',      label: `Nearby Places (${places.length})`, icon: <MapPin size={15} /> },
          { id: 'selected',    label: `Selected Places (${selectedPlaces.length})`, icon: <CheckSquare size={15} /> },
          { id: 'routesearch', label: 'From -> To Route Search', icon: <Navigation size={15} /> },
          { id: 'schedule',    label: 'Day Schedule', icon: <Calendar size={15} /> },
          { id: 'route',       label: 'Route & Transport (Bus/Train/Flight)', icon: <Route size={15} /> },
          { id: 'budget',      label: 'Budget Calculator (₹)', icon: <DollarSign size={15} /> },
          { id: 'weather',     label: 'Weather & Safety', icon: <CloudSun size={15} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setPlannerTab(t.id)}
            className={`tab-item${plannerTab === t.id ? ' active-blue' : ''}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Places Tab */}
      {plannerTab === 'places' && (
        <InteractiveMap
          destination={currentDestination}
          places={places}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedPlaces={selectedPlaces}
          onTogglePlace={handleTogglePlace}
          onSelectPlaceDetail={(place) => setSelectedPlaceDetail(place)}
          loading={placesLoading}
        />
      )}

      {/* Selected Places Dedicated Tab */}
      {plannerTab === 'selected' && (
        <SelectedPlacesView
          selectedPlaces={selectedPlaces}
          onRemovePlace={handleTogglePlace}
          onSelectPlaceDetail={(place) => setSelectedPlaceDetail(place)}
          onOpenPlacesTab={() => setPlannerTab('places')}
        />
      )}

      {/* From -> To Route Search Tab */}
      {plannerTab === 'routesearch' && (
        <RoutePlanner
          defaultOrigin="Vijayawada"
          defaultDestination={currentDestination}
        />
      )}

      {/* Schedule Tab */}
      {plannerTab === 'schedule' && (
        <DayScheduleManager
          destination={currentDestination}
          durationDays={durationDays}
          selectedPlaces={selectedPlaces}
          aiGeneratedText={aiScheduleText}
        />
      )}

      {/* Route & Transport Tab */}
      {plannerTab === 'route' && (
        <RouteOptimizer
          destination={currentDestination}
          selectedPlaces={selectedPlaces}
        />
      )}

      {/* Budget Calculator Tab */}
      {plannerTab === 'budget' && (
        <BudgetCalculator
          destination={currentDestination}
          durationDays={durationDays}
          setDurationDays={setDurationDays}
          travelersCount={travelersCount}
          setTravelersCount={setTravelersCount}
          selectedPlaces={selectedPlaces}
          onCostChange={(newCost) => setEstimatedCostInr(newCost)}
        />
      )}

      {/* Weather & Safety Tab */}
      {plannerTab === 'weather' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <WeatherWidget destination={currentDestination} />
          <EmergencyContacts destination={currentDestination} />
          <PackingChecklist destination={currentDestination} durationDays={durationDays} />
        </div>
      )}

    </div>
  );
}
