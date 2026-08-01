import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sun, Sunrise, Sunset, Plus, Trash2, MapPin, Sparkles, Printer, Copy, Check, PlusCircle } from 'lucide-react';
import { renderFormattedMarkdown } from './FormattedMessage';
import { useToast } from './Toast';

export default function DayScheduleManager({ destination, durationDays, selectedPlaces, aiGeneratedText }) {
  const [activeDay, setActiveDay] = useState(1);
  const [schedule, setSchedule] = useState({});
  const [unassigned, setUnassigned] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [customSlot, setCustomSlot] = useState('Morning');
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const newSched = {};
    for (let d = 1; d <= durationDays; d++) {
      newSched[d] = { Morning: [], Afternoon: [], Evening: [] };
    }

    let placeIdx = 0;
    for (let d = 1; d <= durationDays; d++) {
      const times = ['Morning', 'Afternoon', 'Evening'];
      for (const time of times) {
        if (placeIdx < selectedPlaces.length) {
          newSched[d][time].push(selectedPlaces[placeIdx]);
          placeIdx++;
        }
      }
    }

    setSchedule(newSched);
    setUnassigned(selectedPlaces.slice(placeIdx));
  }, [durationDays, selectedPlaces]);

  const handleAddCustomActivity = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const newActivity = {
      id: `custom_${Date.now()}`,
      name: customInput.trim(),
      category: 'Custom Activity',
    };

    const updated = { ...schedule };
    if (!updated[activeDay]) {
      updated[activeDay] = { Morning: [], Afternoon: [], Evening: [] };
    }
    updated[activeDay][customSlot].push(newActivity);
    setSchedule(updated);
    setCustomInput('');
    if (toast) toast.success('Activity Added', `Added "${newActivity.name}" to Day ${activeDay} (${customSlot})`);
  };

  const handleAddFromUnassigned = (place, targetSlot) => {
    const updated = { ...schedule };
    updated[activeDay][targetSlot].push(place);
    setSchedule(updated);
    setUnassigned((prev) => prev.filter((p) => p.id !== place.id));
    if (toast) toast.success('Added to Schedule', `Added ${place.name} to Day ${activeDay} (${targetSlot})`);
  };

  const handleRemoveFromSchedule = (place, day, slot) => {
    const updated = { ...schedule };
    updated[day][slot] = updated[day][slot].filter((p) => p.id !== place.id);
    setSchedule(updated);
    if (place.category !== 'Custom Activity') {
      setUnassigned((prev) => [...prev, place]);
    }
    if (toast) toast.info('Removed', `Removed ${place.name} from Day ${day}`);
  };

  const handleCopySchedule = () => {
    let summaryText = `*SmartTrip Itinerary for ${destination} (${durationDays} Days)*\n\n`;

    for (let d = 1; d <= durationDays; d++) {
      summaryText += `*DAY ${d}:*\n`;
      const dayData = schedule[d] || { Morning: [], Afternoon: [], Evening: [] };
      
      summaryText += `• Morning: ${dayData.Morning.map(p => p.name).join(', ') || 'Free Time'}\n`;
      summaryText += `• Afternoon: ${dayData.Afternoon.map(p => p.name).join(', ') || 'Free Time'}\n`;
      summaryText += `• Evening: ${dayData.Evening.map(p => p.name).join(', ') || 'Free Time'}\n\n`;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      if (toast) toast.success('Copied to Clipboard!', 'Schedule copied for WhatsApp/Email sharing.');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const slots = [
    { id: 'Morning', label: 'Morning (9:00 AM - 12:00 PM)', icon: <Sunrise size={18} color="var(--amber-600)" />, border: 'var(--amber-600)' },
    { id: 'Afternoon', label: 'Afternoon (1:00 PM - 4:00 PM)', icon: <Sun size={18} color="var(--blue-600)" />, border: 'var(--blue-600)' },
    { id: 'Evening', label: 'Evening (5:00 PM - 9:00 PM)', icon: <Sunset size={18} color="#7c3aed" />, border: '#7c3aed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="card-elevated" style={{ padding: '1.5rem 1.75rem', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px', height: '42px',
              background: 'var(--navy-900)',
              borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', flexShrink: 0,
            }}>
              <Calendar size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Day-Wise Schedule Manager
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                Organize activities, add custom events, and export your itinerary for {destination}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleCopySchedule} className="btn btn-outline" style={{ gap: '0.4rem' }}>
              {copied ? <Check size={15} color="var(--emerald-600)" /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <Printer size={15} /> Print / Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Custom Activity Adder Bar */}
      <div className="card-elevated" style={{ padding: '1.15rem 1.4rem', background: 'white' }}>
        <form onSubmit={handleAddCustomActivity} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <PlusCircle size={16} color="var(--blue-600)" /> Add Custom Event to Day {activeDay}:
          </span>

          <input
            type="text"
            className="input"
            placeholder="e.g. Breakfast at Local Cafe, Airport Pick-up, Shopping..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            style={{ flex: 1, minWidth: '220px' }}
          />

          <select
            className="input"
            value={customSlot}
            onChange={(e) => setCustomSlot(e.target.value)}
            style={{ width: '130px', padding: '0.5rem' }}
          >
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm" disabled={!customInput.trim()}>
            + Add Activity
          </button>
        </form>
      </div>

      {/* Day selector tabs */}
      <div className="tab-group">
        {Array.from({ length: durationDays }, (_, i) => i + 1).map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`tab-item${activeDay === d ? ' active-blue' : ''}`}
          >
            Day {d}
          </button>
        ))}
      </div>

      {/* Day Schedule Slots */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.15rem' }}>
        {slots.map((slot) => {
          const currentPlaces = schedule[activeDay]?.[slot.id] || [];
          return (
            <div
              key={slot.id}
              className="card-flat"
              style={{
                padding: '1.15rem',
                background: 'white',
                borderTop: `3px solid ${slot.border}`,
                display: 'flex', flexDirection: 'column', gap: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                {slot.icon}
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{slot.label}</h3>
              </div>

              {currentPlaces.length === 0 ? (
                <div style={{
                  padding: '1.75rem 1rem', textAlign: 'center',
                  background: 'var(--surface-1)', borderRadius: 'var(--r-md)',
                  border: '1px dashed var(--border-medium)', fontSize: '0.82rem', color: 'var(--text-tertiary)',
                }}>
                  No activity scheduled for {slot.id.toLowerCase()}.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {currentPlaces.map((place) => (
                    <div
                      key={place.id}
                      style={{
                        padding: '0.75rem 0.9rem',
                        background: 'var(--surface-1)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--r-md)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.88rem', display: 'block', color: 'var(--text-primary)' }}>
                          {place.name}
                        </strong>
                        <span className="badge badge-gray" style={{ fontSize: '0.68rem', marginTop: '2px' }}>
                          {place.category}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveFromSchedule(place, activeDay, slot.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.3rem 0.5rem' }}
                        title="Remove from slot"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unassigned places queue */}
      {unassigned.length > 0 && (
        <div className="card-elevated" style={{ padding: '1.15rem 1.4rem', background: 'white' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.65rem', color: 'var(--text-secondary)' }}>
            Unassigned Selected Places ({unassigned.length})
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {unassigned.map((place) => (
              <div
                key={place.id}
                style={{
                  padding: '0.45rem 0.75rem',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--r-md)',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.82rem', fontWeight: 600,
                }}
              >
                <span>{place.name}</span>
                <button
                  onClick={() => handleAddFromUnassigned(place, 'Morning')}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                >
                  + Day {activeDay}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Generated Itinerary Reference */}
      {aiGeneratedText && (
        <div className="card-flat" style={{ padding: '1.25rem', background: 'var(--surface-0)', borderLeft: '4px solid var(--blue-600)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
            <Sparkles size={16} color="var(--blue-600)" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>AI Generated Itinerary Guide</h3>
          </div>
          <div style={{ fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            {renderFormattedMarkdown(aiGeneratedText)}
          </div>
        </div>
      )}

    </div>
  );
}
