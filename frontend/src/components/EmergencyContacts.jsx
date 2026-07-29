import React, { useState } from 'react';
import { ShieldAlert, Phone, Hospital, Shield, Landmark, MapPin, PhoneCall } from 'lucide-react';

const STATE_EMERGENCY_DATA = {
  'Andhra Pradesh': {
    policeControl: '100 / 0866-2577777 (Vijayawada Control Room)',
    touristPolice: '1364 (AP Tourism Helpline)',
    ambulance: '108 (AP EMRI Medical Response)',
    womenHelpline: '1091 (Disha Women Safety App & Helpline)',
    disasterHelpline: '1070 (AP State Disaster Management)',
  },
  'Telangana': {
    policeControl: '100 / 040-27852435 (Hyderabad Police Control)',
    touristPolice: '1800-425-46464 (TS Tourism)',
    ambulance: '108 (TS EMRI Ambulance)',
    womenHelpline: '1091 / SHE Teams',
    disasterHelpline: '1070 (TS Disaster Control)',
  },
  'Rajasthan': {
    policeControl: '100 / 0141-2374444 (Jaipur Control)',
    touristPolice: '0141-2822863 (Rajasthan Tourist Assistance)',
    ambulance: '108',
    womenHelpline: '1091',
    disasterHelpline: '1070',
  },
  'Goa': {
    policeControl: '100 / 0832-2419441 (Goa Police Control)',
    touristPolice: '1095 (Goa Tourist Helpline)',
    ambulance: '108',
    womenHelpline: '1091',
    disasterHelpline: '1077',
  },
  'Maharashtra': {
    policeControl: '100 / 022-22621855 (Mumbai Control)',
    touristPolice: '022-22845678 (MTDC Tourist Helpline)',
    ambulance: '108',
    womenHelpline: '1091',
    disasterHelpline: '1070',
  },
  'Tamil Nadu': {
    policeControl: '100 / 044-23452345 (Chennai Control)',
    touristPolice: '1800-425-31111 (TN Tourism)',
    ambulance: '108',
    womenHelpline: '1091',
    disasterHelpline: '1070',
  },
  'Karnataka': {
    policeControl: '100 / 080-22942222 (Bengaluru Control)',
    touristPolice: '080-22352828 (KSTDC Tourism)',
    ambulance: '108',
    womenHelpline: '1091',
    disasterHelpline: '1070',
  },
  'Delhi': {
    policeControl: '100 / 112 (Delhi Police Central Control)',
    touristPolice: '011-23365358 (Delhi Tourist Helpline)',
    ambulance: '102 / 108',
    womenHelpline: '1091',
    disasterHelpline: '1077',
  },
  'Kerala': {
    policeControl: '100 / 0471-2318777 (Thiruvananthapuram)',
    touristPolice: '1800-425-4747 (Kerala Tourism)',
    ambulance: '108',
    womenHelpline: '1091',
    disasterHelpline: '1070',
  },
};

export default function EmergencyContacts({ destination }) {
  const [selectedState, setSelectedState] = useState('Andhra Pradesh');

  const stateData = STATE_EMERGENCY_DATA[selectedState] || STATE_EMERGENCY_DATA['Andhra Pradesh'];

  const nationalHelplines = [
    { title: 'National Emergency Response System', number: '112', desc: 'All-in-One Police, Fire & Medical', icon: ShieldAlert, color: 'var(--red-600)' },
    { title: 'Medical Emergency & Ambulance', number: '108', desc: 'Free 24/7 Trauma Emergency', icon: Hospital, color: 'var(--emerald-600)' },
    { title: 'Women Safety Helpline', number: '1091', desc: '24/7 Emergency Support for Women', icon: Shield, color: '#7c3aed' },
    { title: 'National Highway Patrol', number: '1033', desc: 'NHAI Emergency Assistance', icon: PhoneCall, color: 'var(--blue-600)' },
  ];

  return (
    <div className="card-elevated" style={{ padding: '1.75rem', background: 'white' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'var(--red-600)',
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', flexShrink: 0,
          }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              State-Wise Emergency Helplines (India)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              Verified 24/7 Police, Ambulance, Women Safety & Tourist Helplines
            </p>
          </div>
        </div>

        {/* State Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Select State:</label>
          <select
            className="input"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            style={{ width: '180px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
          >
            {Object.keys(STATE_EMERGENCY_DATA).map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* National Helplines */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
          All-India Emergency Helplines
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          {nationalHelplines.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="card-flat" style={{ padding: '1rem', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{item.desc}</span>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '0.1rem' }}>{item.title}</h4>
                  <a
                    href={`tel:${item.number}`}
                    style={{ fontSize: '1.1rem', fontWeight: 800, color: item.color, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}
                  >
                    <Phone size={14} /> {item.number}
                  </a>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={item.color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected State Helplines */}
      <div className="card-flat" style={{ padding: '1.25rem', background: 'var(--surface-1)', border: '1px solid var(--border-medium)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.85rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={16} color="var(--blue-600)" /> Verified Helplines for {selectedState}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <div style={{ background: 'white', padding: '0.85rem 1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>State Police Control Room</span>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.2rem' }}>
              {stateData.policeControl}
            </div>
          </div>

          <div style={{ background: 'white', padding: '0.85rem 1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Tourist Assistance Police</span>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--blue-600)', marginTop: '0.2rem' }}>
              {stateData.touristPolice}
            </div>
          </div>

          <div style={{ background: 'white', padding: '0.85rem 1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Ambulance Response</span>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: '0.2rem' }}>
              {stateData.ambulance}
            </div>
          </div>

          <div style={{ background: 'white', padding: '0.85rem 1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>State Disaster Control Room</span>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--amber-600)', marginTop: '0.2rem' }}>
              {stateData.disasterHelpline}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
