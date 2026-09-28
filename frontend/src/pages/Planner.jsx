import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
import SearchAutocomplete from '../components/SearchAutocomplete';
import { fetchRealPlaces } from '../services/mapService';
import { useToast } from '../components/Toast';

export default function Planner({ destination, user, onSaveSuccess, onOpenAuth }) {
  const { t } = useTranslation();
  const [currentDestination, setCurrentDestination] = useState(destination || 'Jaipur');
  const [searchInputVal, setSearchInputVal] = useState(destination || 'Jaipur');
  const [plannerTab, setPlannerTab] = useState('places');
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlaces, setSelectedPlaces] = useState(() => {
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
      try {
        const stored = localStorage.getItem(`smarttrip_selected_places_${destination}`);
        if (stored) setSelectedPlaces(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, [destination]);

  useEffect(() => {
    try {
      localStorage.setItem(`smarttrip_selected_places_${currentDestination}`, JSON.stringify(selectedPlaces));
    } catch { /* ignore */ }

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

  useEffect(() => {
    let base = 8000 + (durationDays * 2200) + (travelersCount * 1500);
    selectedPlaces.forEach((p) => {
      if (p.category === 'Hotel') {
        base += 3800 * durationDays;
      } else if (p.category === 'Restaurant') {
        base += 750 * travelersCount;
      } else if (p.category === 'Attraction') {
        base += 350 * travelersCount;
      } else {
        base += 500;
      }
    });
    setEstimatedCostInr(base);
  }, [selectedPlaces, durationDays, travelersCount]);

  const loadRealPlaces = useCallback(async (destName) => {
    const target = destName || currentDestination;
    if (!target) return;
    setPlacesLoading(true);
    setPlaces([]);
    try {
      const realPlaces = await fetchRealPlaces(target, 'All');
      setPlaces(realPlaces && realPlaces.length > 0 ? realPlaces : []);
    } catch (err) {
      console.warn('Place fetch notice:', err);
      setPlaces([]);
    } finally {
      setPlacesLoading(false);
    }
  }, [currentDestination]);

  useEffect(() => {
    loadRealPlaces(currentDestination);
  }, [currentDestination, loadRealPlaces]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInputVal || !searchInputVal.trim()) return;
    setCurrentDestination(searchInputVal.trim());
  };

  const handleTogglePlace = (place) => {
    setSelectedPlaces((prev) => {
      const exists = prev.some((p) => p.id === place.id);
      const nextList = exists ? prev.filter((p) => p.id !== place.id) : [...prev, place];
      try {
        localStorage.setItem(`smarttrip_selected_places_${currentDestination}`, JSON.stringify(nextList));
      } catch { /* ignore */ }
      return nextList;
    });
  };

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
        if (toast) toast.success(t('planner.toastSavedTitle'), t('planner.toastSavedMsg', { destination: currentDestination }));
        if (onSaveSuccess) onSaveSuccess(tripPayload);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        if (toast) toast.error(t('planner.toastSaveErrorTitle'), t('planner.toastSaveErrorServer'));
      }
    } catch {
      if (toast) toast.error(t('planner.toastSaveErrorTitle'), t('planner.toastSaveErrorNetwork'));
    } finally {
      setSaving(false);
    }
  };

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

      <div className="card-elevated" style={{ padding: '1.4rem 1.6rem', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.15rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px', height: '42px', background: 'var(--navy-900)', borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0,
            }}>
              <MapPin size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--navy-900)' }}>
                {t('planner.title', { destination: currentDestination })}
              </h1>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-tertiary)', fontWeight: 500, marginTop: '2px' }}>
                <span
                  onClick={() => setPlannerTab('selected')}
                  className="badge badge-blue"
                  style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                  title={t('planner.viewSelectedTip')}
                >
                  {t('planner.placesSelectedBadge', { count: selectedPlaces.length })}
                </span>
                {t('planner.estCost')} <strong style={{ color: 'var(--blue-600)' }}>₹{estimatedCostInr.toLocaleString('en-IN')} INR</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '270px' }}>
              <SearchAutocomplete
                value={searchInputVal}
                onChange={setSearchInputVal}
                onSelect={(selectedCity) => {
                  setSearchInputVal(selectedCity);
                  setCurrentDestination(selectedCity);
                  loadRealPlaces(selectedCity);
                }}
                placeholder={t('planner.searchPlaceholder')}
              />
            </div>

            <button
              onClick={handleSaveTrip}
              className={`btn ${savedSuccess ? 'btn-success' : 'btn-primary'}`}
              disabled={saving}
            >
              {savedSuccess ? <Check size={16} /> : <Save size={16} />}
              {savedSuccess ? t('planner.savedToDb') : t('planner.saveTrip')}
            </button>
          </div>
        </div>
      </div>

      <div className="tab-group">
        {[
          { id: 'places',      label: t('planner.tabs.places', { count: places.length }), icon: <MapPin size={15} /> },
          { id: 'selected',    label: t('planner.tabs.selected', { count: selectedPlaces.length }), icon: <CheckSquare size={15} /> },
          { id: 'routesearch', label: t('planner.tabs.routeSearch'), icon: <Navigation size={15} /> },
          { id: 'schedule',    label: t('planner.tabs.schedule'), icon: <Calendar size={15} /> },
          { id: 'route',       label: t('planner.tabs.route'), icon: <Route size={15} /> },
          { id: 'budget',      label: t('planner.tabs.budget'), icon: <DollarSign size={15} /> },
          { id: 'weather',     label: t('planner.tabs.weather'), icon: <CloudSun size={15} /> },
        ].map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setPlannerTab(tabItem.id)}
            className={`tab-item${plannerTab === tabItem.id ? ' active-blue' : ''}`}
          >
            {tabItem.icon} {tabItem.label}
          </button>
        ))}
      </div>

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

      {plannerTab === 'selected' && (
        <SelectedPlacesView
          selectedPlaces={selectedPlaces}
          onRemovePlace={handleTogglePlace}
          onSelectPlaceDetail={(place) => setSelectedPlaceDetail(place)}
          onOpenPlacesTab={() => setPlannerTab('places')}
        />
      )}

      {plannerTab === 'routesearch' && (
        <RoutePlanner defaultOrigin="Vijayawada" defaultDestination={currentDestination} />
      )}

      {plannerTab === 'schedule' && (
        <DayScheduleManager
          destination={currentDestination}
          durationDays={durationDays}
          selectedPlaces={selectedPlaces}
          aiGeneratedText={aiScheduleText}
        />
      )}

      {plannerTab === 'route' && (
        <RouteOptimizer destination={currentDestination} selectedPlaces={selectedPlaces} />
      )}

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