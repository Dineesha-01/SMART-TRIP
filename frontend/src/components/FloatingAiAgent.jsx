import React, { useState } from 'react';
import { Bot, Sparkles, X, ChevronDown } from 'lucide-react';
import AiAssistant from './AiAssistant';

export default function FloatingAiAgent({ destination = 'Jaipur' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000 }}>

      {/* Floating Chat Window Drawer */}
      {isOpen && (
        <div style={{
          position: 'absolute', bottom: '70px', right: 0,
          width: 'clamp(320px, 90vw, 420px)', height: '580px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease-out forwards',
        }}>
          <div style={{ position: 'relative', height: '100%' }}>
            {/* Close Button Header Overlay */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute', top: '12px', right: '14px', zIndex: 20,
                background: 'rgba(255, 255, 255, 0.15)', border: 'none',
                color: 'white', borderRadius: '50%', width: '28px', height: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Close AI Assistant"
            >
              <X size={16} />
            </button>

            <AiAssistant
              destination={destination}
              durationDays={3}
              selectedPlaces={[]}
            />
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.75rem 1.25rem',
          background: 'var(--navy-900)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 'var(--r-full)',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.3)',
          cursor: 'pointer',
          fontWeight: 700, fontSize: '0.9rem',
          transition: 'all 0.2s ease-in-out',
        }}
        title="Toggle AI Travel Assistant"
      >
        <div style={{
          width: '26px', height: '26px', borderRadius: '50%',
          background: 'var(--blue-600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
        }}>
          <Bot size={16} />
        </div>
        <span>AI Assistant</span>
        <Sparkles size={14} color="#60a5fa" />
        {isOpen ? <ChevronDown size={16} /> : null}
      </button>

    </div>
  );
}
