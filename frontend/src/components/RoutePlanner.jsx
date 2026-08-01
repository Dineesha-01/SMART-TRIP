import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Car, Clock, Sparkles, Fuel, Share2, Check, Loader2, Receipt, ShieldAlert } from 'lucide-react';
import { loadLeaflet, geocodeDestination } from '../services/mapService';
import { useToast } from './Toast';

const CITY_COORDS = {
  vijayawada: { lat: 16.5062, lng: 80.6480 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  goa: { lat: 15.2993, lng: 74.1240 },
  manali: { lat: 32.2432, lng: 77.1892 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  agra: { lat: 27.1767, lng: 78.0081 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
};

function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.25);
}

export default function RoutePlanner({ defaultOrigin = '', defaultDestination = '' }) {
  const [origin, setOrigin] = useState(defaultOrigin || 'Vijayawada');
  const [destination, setDestination] = useState(defaultDestination || 'Hyderabad');
  const [routeInfo, setRouteInfo] = useState(null);
  
  // Fuel & Toll Estimator States
  const [vehicleType, setVehicleType] = useState('car'); // car, suv, bike, ev
  const [fuelPriceInr, setFuelPriceInr] = useState(105);
  const [fuelMileage, setFuelMileage] = useState(15);
  
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const mapRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (vehicleType === 'car') setFuelMileage(15);
    else if (vehicleType === 'suv') setFuelMileage(11);
    else if (vehicleType === 'bike') setFuelMileage(42);
    else if (vehicleType === 'ev') setFuelMileage(1); // EV unit
  }, [vehicleType]);

  const calculateRoute = async () => {
    if (!origin.trim() || !destination.trim()) return;

    setLoading(true);
    try {
      const L = await loadLeaflet();

      let startLoc = await geocodeDestination(origin);
      let endLoc = await geocodeDestination(destination);

      const originKey = origin.toLowerCase().trim();
      const destKey = destination.toLowerCase().trim();

      if (CITY_COORDS[originKey]) startLoc = { ...startLoc, ...CITY_COORDS[originKey] };
      if (CITY_COORDS[destKey]) endLoc = { ...endLoc, ...CITY_COORDS[destKey] };

      let distanceKm = 275;
      let durationText = '4 hr 30 mins';

      try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLoc.lng},${startLoc.lat};${endLoc.lng},${endLoc.lat}?overview=full&geometries=geojson`;
        const res = await fetch(osrmUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            distanceKm = Math.round(route.distance / 1000);
            const durationMins = Math.round(route.duration / 60);
            const hrs = Math.floor(durationMins / 60);
            const mins = durationMins % 60;
            durationText = hrs > 0 ? `${hrs} hr ${mins} mins` : `${mins} mins`;
          }
        }
      } catch {
        distanceKm = getHaversineDistanceKm(startLoc.lat, startLoc.lng, endLoc.lat, endLoc.lng);
        const hrs = Math.floor(distanceKm / 60);
        const mins = Math.round((distanceKm % 60) * 0.8);
        durationText = hrs > 0 ? `${hrs} hr ${mins} mins` : `${mins} mins`;
      }

      setRouteInfo({
        distance: `${distanceKm} km`,
        distanceKm,
        duration: durationText,
        startAddress: origin,
        endAddress: destination,
      });

      if (mapRef.current) {
        if (mapRef.current._leaflet_id) {
          mapRef.current._leaflet_id = null;
          mapRef.current.innerHTML = '';
        }

        const map = L.map(mapRef.current).setView([startLoc.lat, startLoc.lng], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        L.marker([startLoc.lat, startLoc.lng]).addTo(map).bindPopup(`<b>From:</b> ${origin}`).openPopup();
        L.marker([endLoc.lat, endLoc.lng]).addTo(map).bindPopup(`<b>To:</b> ${destination}`);

        const polyline = L.polyline(
          [
            [startLoc.lat, startLoc.lng],
            [endLoc.lat, endLoc.lng],
          ],
          { color: '#2563eb', weight: 5, opacity: 0.85, dashArray: '8, 8' }
        ).addTo(map);

        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }

      if (toast) toast.success('Route & Costs Calculated!', `Distance from ${origin} to ${destination}: ${distanceKm} km.`);
    } catch (err) {
      console.warn('Route calculation notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRoute();
  }, []);

  // Cost Calculations
  const calculateFuelCost = () => {
    if (!routeInfo || !routeInfo.distanceKm) return 0;
    if (vehicleType === 'ev') {
      const kwhNeeded = (routeInfo.distanceKm * 0.18); // ~0.18 kWh per km
      return Math.round(kwhNeeded * 10); // ~₹10 per kWh
    }
    const litersNeeded = routeInfo.distanceKm / fuelMileage;
    return Math.round(litersNeeded * fuelPriceInr);
  };

  const calculateTollCost = () => {
    if (!routeInfo || !routeInfo.distanceKm) return 0;
    if (vehicleType === 'bike') return Math.round(routeInfo.distanceKm * 0.2); // Bikes low toll
    // Highway FASTag Toll rate approx ₹2.15 per km
    return Math.round(routeInfo.distanceKm * 2.15);
  };

  const calculateTotalTravelCost = () => {
    return calculateFuelCost() + calculateTollCost();
  };

  const handleShareRoute = () => {
    if (navigator.clipboard) {
      const shareUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (toast) toast.success('Link Copied!', 'Driving route GPS link copied to clipboard.');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const buildGoogleMapsGpsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  };

  return (
    <div className="card-elevated" style={{ padding: '1.75rem', background: 'white' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'var(--blue-600)',
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', flexShrink: 0,
          }}>
            <Navigation size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Route & Fuel / Toll Cost Estimator
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              Calculate driving route distance, travel duration, highway FASTag toll & fuel costs (₹ INR)
            </p>
          </div>
        </div>

        <button onClick={handleShareRoute} className="btn btn-outline" style={{ gap: '0.4rem' }}>
          {copied ? <Check size={15} color="var(--emerald-600)" /> : <Share2 size={15} />}
          {copied ? 'Copied!' : 'Share Route Link'}
        </button>
      </div>

      {/* Origin / Destination Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
            From (Origin City):
          </label>
          <div style={{ position: 'relative' }}>
            <MapPin size={16} color="var(--emerald-600)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Vijayawada, Mumbai, Delhi..."
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
            To (Destination City):
          </label>
          <div style={{ position: 'relative' }}>
            <MapPin size={16} color="var(--red-600)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Hyderabad, Goa, Agra..."
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
        </div>
      </div>

      {/* Vehicle Type & Fuel Settings Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem', background: 'var(--surface-1)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-900)', display: 'block', marginBottom: '0.3rem' }}>Vehicle Type:</label>
          <select
            className="input"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            style={{ padding: '0.45rem', fontSize: '0.82rem' }}
          >
            <option value="car">Sedan / Hatchback (15 km/L)</option>
            <option value="suv">SUV / Luxury (11 km/L)</option>
            <option value="bike">Motorcycle / Bike (42 km/L)</option>
            <option value="ev">Electric Vehicle (EV)</option>
          </select>
        </div>

        {vehicleType !== 'ev' && (
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-900)', display: 'block', marginBottom: '0.3rem' }}>Fuel Price (₹/L):</label>
            <input
              type="number"
              className="input"
              value={fuelPriceInr}
              onChange={(e) => setFuelPriceInr(Number(e.target.value))}
              style={{ padding: '0.45rem', fontSize: '0.82rem' }}
            />
          </div>
        )}

        {vehicleType !== 'ev' && (
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-900)', display: 'block', marginBottom: '0.3rem' }}>Mileage (km/L):</label>
            <input
              type="number"
              className="input"
              value={fuelMileage}
              onChange={(e) => setFuelMileage(Number(e.target.value))}
              style={{ padding: '0.45rem', fontSize: '0.82rem' }}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={calculateRoute}
          disabled={loading}
          className="btn btn-primary"
          style={{ gap: '0.4rem' }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? 'Calculating Route...' : 'Calculate Route & Toll Costs'}
        </button>

        <a
          href={buildGoogleMapsGpsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
          style={{ gap: '0.4rem' }}
        >
          <Navigation size={16} /> Open Turn-by-Turn GPS Navigation
        </a>
      </div>

      {/* Fuel & Toll Cost Breakdown Cards */}
      {routeInfo && (
        <div className="card-flat" style={{ padding: '1.35rem', background: 'var(--surface-1)', marginBottom: '1.25rem', border: '1px solid var(--border-medium)', borderRadius: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Total Driving Distance</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--blue-600)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Car size={20} /> {routeInfo.distance}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Estimated Travel Time</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={20} /> {routeInfo.duration}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Est. Fuel Expense</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--amber-600)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Fuel size={20} /> ₹{calculateFuelCost().toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>({fuelMileage} km/L @ ₹{fuelPriceInr}/L)</span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Highway FASTag Tolls</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Receipt size={20} /> ₹{calculateTollCost().toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Expressway Toll plazas</span>
            </div>

            <div style={{ background: 'white', padding: '0.85rem 1.1rem', borderRadius: '12px', border: '2px solid var(--blue-600)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--blue-600)', fontWeight: 800, letterSpacing: '0.04em' }}>TOTAL ESTIMATED TRAVEL</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.1rem' }}>
                ₹{calculateTotalTravelCost().toLocaleString('en-IN')} INR
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Fuel + Tolls combined</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Map Box */}
      <div style={{ height: '420px', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>

    </div>
  );
}
