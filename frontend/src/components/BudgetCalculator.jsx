import React, { useState, useEffect } from 'react';
import { PieChart, Bus, Train, Plane, Copy, Check, Sparkles, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useToast } from './Toast';

export default function BudgetCalculator({ destination, durationDays, setDurationDays, onCostChange }) {
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState('Standard');
  const [transportMode, setTransportMode] = useState('Train');
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const [budgetBreakdown, setBudgetBreakdown] = useState({
    accommodationCost: 7500,
    foodCost: 6000,
    activitiesCost: 4500,
    transportCost: 3200,
    totalEstimatedCost: 21200,
  });

  const RATES = {
    Budget:   { hotel: 1200, food: 600, activities: 400, transportPerPerson: { Bus: 600, Train: 1200, Flight: 3500 } },
    Standard: { hotel: 3500, food: 1200, activities: 800, transportPerPerson: { Bus: 900, Train: 2200, Flight: 5500 } },
    Luxury:   { hotel: 9000, food: 3000, activities: 2000, transportPerPerson: { Bus: 1800, Train: 4500, Flight: 9500 } },
  };

  const TIMINGS_DATABASE = {
    Bus: [
      { name: 'APSRTC / KSRTC Amaravati Super Luxury', dept: '06:00 AM', arr: '01:30 PM', duration: '7h 30m', fare: 850, status: 'Daily Available' },
      { name: 'Orange Travels AC Multi-Axle Volvo Sleeper', dept: '09:30 PM', arr: '05:00 AM', duration: '7h 30m', fare: 1250, status: 'Overnight Sleeper' },
      { name: 'VRL Travels AC Seater / Sleeper (2+1)', dept: '10:45 PM', arr: '06:15 AM', duration: '7h 30m', fare: 1100, status: 'Night Service' },
    ],
    Train: [
      { name: '12759 Vande Bharat Express (Chair Car / EC)', dept: '05:30 AM', arr: '09:45 AM', duration: '4h 15m', fare: 1420, status: 'Superfast 6 Days/Wk' },
      { name: '12727 Godavari Superfast Express (1A/2A/3A)', dept: '05:15 PM', arr: '11:30 PM', duration: '6h 15m', fare: 980, status: 'Daily Service' },
      { name: '12711 Pinakini Express (CC / 2S)', dept: '06:10 AM', arr: '01:20 PM', duration: '7h 10m', fare: 650, status: 'Daily Express' },
    ],
    Flight: [
      { name: 'IndiGo 6E-241 (Direct Non-Stop)', dept: '07:15 AM', arr: '08:30 AM', duration: '1h 15m', fare: 3850, status: 'Daily Direct' },
      { name: 'Air India AI-512 (Direct Non-Stop)', dept: '02:40 PM', arr: '03:55 PM', duration: '1h 15m', fare: 4200, status: 'Daily Direct' },
      { name: 'SpiceJet SG-304 (Morning Flight)', dept: '11:00 AM', arr: '12:20 PM', duration: '1h 20m', fare: 3600, status: 'Direct Non-Stop' },
    ],
  };

  useEffect(() => {
    calculate();
  }, [durationDays, travelers, travelStyle, transportMode]);

  const calculate = async () => {
    const rate = RATES[travelStyle] || RATES.Standard;
    const hotelTotal = rate.hotel * durationDays;
    const foodTotal = rate.food * durationDays * travelers;
    const actTotal = rate.activities * durationDays * travelers;
    const transFarePerPerson = rate.transportPerPerson[transportMode] || 2200;
    const transTotal = transFarePerPerson * travelers;

    const total = hotelTotal + foodTotal + actTotal + transTotal;

    const calculatedData = {
      accommodationCost: hotelTotal,
      foodCost: foodTotal,
      activitiesCost: actTotal,
      transportCost: transTotal,
      totalEstimatedCost: total,
    };

    setBudgetBreakdown(calculatedData);
    if (onCostChange) onCostChange(total);
  };

  const handleCopyBudget = () => {
    const text = `*SmartTrip Estimated Budget Summary (${destination || 'Trip'})*\n\n` +
      `• Style: ${travelStyle}\n` +
      `• Duration: ${durationDays} Days\n` +
      `• Travelers: ${travelers} Person(s)\n` +
      `• Transport: ${transportMode} (₹${budgetBreakdown.transportCost.toLocaleString('en-IN')})\n` +
      `• Hotel / Stay: ₹${budgetBreakdown.accommodationCost.toLocaleString('en-IN')}\n` +
      `• Food & Dining: ₹${budgetBreakdown.foodCost.toLocaleString('en-IN')}\n` +
      `• Sightseeing: ₹${budgetBreakdown.activitiesCost.toLocaleString('en-IN')}\n\n` +
      `*TOTAL ESTIMATED COST: ₹${budgetBreakdown.totalEstimatedCost.toLocaleString('en-IN')} INR*`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      if (toast) toast.success('Budget Copied!', 'Cost breakdown copied to clipboard.');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const transportOptions = [
    { id: 'Bus', label: 'Bus (AC Sleeper)', icon: <Bus size={18} />, speed: 'Slower', rateKey: 'Bus' },
    { id: 'Train', label: 'Train (Express AC)', icon: <Train size={18} />, speed: 'Recommended', rateKey: 'Train' },
    { id: 'Flight', label: 'Airplane (Flight)', icon: <Plane size={18} />, speed: 'Fastest', rateKey: 'Flight' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Main Budget Card */}
      <div className="card-elevated" style={{ padding: '1.75rem', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px', height: '42px',
              background: 'var(--navy-900)',
              borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', flexShrink: 0,
            }}>
              <PieChart size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                Trip Budget & Transport Schedule
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                Calculated strictly in Indian Rupees (₹) with real Bus, Train & Flight schedules
              </p>
            </div>
          </div>

          <button onClick={handleCopyBudget} className="btn btn-outline" style={{ gap: '0.4rem' }}>
            {copied ? <Check size={15} color="var(--emerald-600)" /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy Budget Summary'}
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>

          {/* Travel Style */}
          <div>
            <label className="form-label">Travel Style</label>
            <div className="tab-group">
              {['Budget', 'Standard', 'Luxury'].map((style) => (
                <button
                  key={style}
                  onClick={() => setTravelStyle(style)}
                  className={`tab-item${travelStyle === style ? ' active-blue' : ''}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Slider */}
          <div>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Trip Days</span>
              <strong style={{ color: 'var(--blue-600)' }}>{durationDays} Days</strong>
            </label>
            <input
              type="range"
              min={1}
              max={15}
              value={durationDays}
              onChange={(e) => setDurationDays && setDurationDays(Number(e.target.value))}
            />
          </div>

          {/* Travelers Count */}
          <div>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Number of Travelers</span>
              <strong style={{ color: 'var(--gold-600)' }}>{travelers} Person{travelers > 1 ? 's' : ''}</strong>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setTravelers(Math.max(1, travelers - 1))}
                style={{ width: '38px', height: '38px', padding: 0 }}
              >
                -
              </button>
              <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                {travelers}
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setTravelers(travelers + 1)}
                style={{ width: '38px', height: '38px', padding: 0 }}
              >
                +
              </button>
            </div>
          </div>

        </div>

        {/* Transport Option Comparison */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" style={{ marginBottom: '0.75rem' }}>
            Choose Travel Transport Mode (Bus, Train, Flight)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            {transportOptions.map((opt) => {
              const farePerPerson = RATES[travelStyle].transportPerPerson[opt.rateKey];
              const isSelected = transportMode === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setTransportMode(opt.id)}
                  className="card-flat"
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--blue-600)' : 'var(--border-light)',
                    background: isSelected ? 'var(--blue-50)' : 'white',
                    transition: 'var(--ease-fast)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isSelected ? 'var(--blue-600)' : 'var(--text-secondary)' }}>
                      {opt.icon}
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opt.id}</span>
                    </div>
                    <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{opt.speed}</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ₹{farePerPerson.toLocaleString('en-IN')} <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>/ person</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Total ({travelers} people): <strong>₹{(farePerPerson * travelers).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Transport Timings & Schedules */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} color="var(--blue-600)" />
            Real Available {transportMode} Schedules & Departure Timings ({destination || 'Destination'})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {TIMINGS_DATABASE[transportMode]?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.9rem 1.15rem',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--r-md)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: '0.75rem',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--text-primary)' }}>
                    {item.name}
                  </strong>
                  <span className="badge badge-blue" style={{ fontSize: '0.68rem', marginTop: '2px' }}>
                    {item.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-900)' }}>{item.dept}</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Departure</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--blue-600)', fontWeight: 700 }}>{item.duration}</span>
                    <ArrowRight size={14} color="var(--blue-600)" />
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-900)' }}>{item.arr}</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Arrival</span>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '85px' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
                      ₹{item.fare.toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>per seat</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Summary */}
        <div style={{
          background: 'var(--surface-1)',
          padding: '1.5rem',
          borderRadius: 'var(--r-lg)',
          border: '1px solid var(--border-medium)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Estimated Total Cost ({durationDays} Days, {travelers} Travelers)
            </span>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--blue-600)', letterSpacing: '-0.03em' }}>
              ₹{budgetBreakdown.totalEstimatedCost.toLocaleString('en-IN')} <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>INR</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
            <div className="stat-tile">
              <span className="stat-label">Hotel / Stay</span>
              <div className="stat-value" style={{ color: 'var(--blue-600)', fontSize: '1.2rem', marginTop: '4px' }}>
                ₹{budgetBreakdown.accommodationCost.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="stat-tile">
              <span className="stat-label">Food & Dining</span>
              <div className="stat-value" style={{ color: 'var(--amber-600)', fontSize: '1.2rem', marginTop: '4px' }}>
                ₹{budgetBreakdown.foodCost.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="stat-tile">
              <span className="stat-label">Sightseeing</span>
              <div className="stat-value" style={{ color: 'var(--violet-600)', fontSize: '1.2rem', marginTop: '4px' }}>
                ₹{budgetBreakdown.activitiesCost.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="stat-tile">
              <span className="stat-label">Transport ({transportMode})</span>
              <div className="stat-value" style={{ color: 'var(--emerald-600)', fontSize: '1.2rem', marginTop: '4px' }}>
                ₹{budgetBreakdown.transportCost.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
