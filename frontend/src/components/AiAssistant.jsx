import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2, User, Utensils, Gem, ScrollText, Car, Calendar, ShieldCheck } from 'lucide-react';
import { queryGroqAi, generateAiDayPlan } from '../services/groqAi';
import FormattedMessage from './FormattedMessage';
import { useToast } from './Toast';

const QUICK_PROMPTS = [
  { label: 'Local Food Guide', icon: <Utensils size={13} />, prompt: 'What are the top must-try local dishes and street food spots here?' },
  { label: 'Hidden Gems', icon: <Gem size={13} />, prompt: 'What are lesser-known hidden gems and off-beat places to visit?' },
  { label: 'Local Customs & Tips', icon: <ScrollText size={13} />, prompt: 'What are essential cultural etiquette and safety tips for travelers?' },
  { label: 'Transport Guide', icon: <Car size={13} />, prompt: 'How to commute around the city affordably and safely?' },
];

export default function AiAssistant({ destination, durationDays, selectedPlaces, onApplySchedule }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **SmartTrip AI Travel Assistant**. How can I help you plan your itinerary for **${destination}**?`,
      isNew: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingSchedule, setGeneratingSchedule] = useState(false);
  const chatEndRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input.trim();
    if (!text || loading) return;

    const userMsg = { id: `u_${Date.now()}`, role: 'user', content: text, isNew: false };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const history = updatedMessages.map((m) => ({ role: m.role, content: m.content }));
      const aiReply = await queryGroqAi(history, destination);
      setMessages((prev) => [
        ...prev,
        { id: `a_${Date.now()}`, role: 'assistant', content: aiReply, isNew: true },
      ]);
    } catch (err) {
      toast?.error('AI Error', err.message || 'Could not connect to AI Assistant service.');
      setMessages((prev) => [
        ...prev,
        { id: `err_${Date.now()}`, role: 'assistant', content: `Notice: ${err.message}. Showing offline intelligent recommendations.`, isNew: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    setGeneratingSchedule(true);
    if (toast) toast.info('AI Working', `Generating ${durationDays}-day schedule for ${destination}...`);

    try {
      const scheduleText = await generateAiDayPlan(destination, durationDays, selectedPlaces);
      setMessages((prev) => [
        ...prev,
        {
          id: `sched_${Date.now()}`,
          role: 'assistant',
          content: `### Smart ${durationDays}-Day Itinerary for ${destination}\n\n${scheduleText}`,
          isNew: true,
        },
      ]);
      if (onApplySchedule) {
        onApplySchedule(scheduleText);
      }
      if (toast) toast.success('Schedule Ready!', 'Your AI itinerary has been generated.');
    } catch (err) {
      if (toast) toast.error('Generation Failed', err.message);
    } finally {
      setGeneratingSchedule(false);
    }
  };

  return (
    <div className="card-elevated" style={{
      display: 'flex', flexDirection: 'column',
      height: '600px', background: 'white',
      borderRadius: 'var(--r-lg)', overflow: 'hidden',
    }}>
      {/* Formal Solid Header */}
      <div style={{
        padding: '1.1rem 1.25rem',
        background: 'var(--navy-900)',
        color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'var(--navy-800)',
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#60a5fa',
            border: '1px solid var(--slate-700)',
          }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>SmartTrip AI Assistant</h3>
              <span className="badge badge-blue" style={{ fontSize: '0.65rem', gap: '0.2rem' }}>
                <ShieldCheck size={10} /> Smart AI
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Destination: <strong>{destination}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateSchedule}
          disabled={generatingSchedule}
          className="btn btn-primary btn-sm"
          style={{ gap: '0.4rem' }}
        >
          {generatingSchedule ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {generatingSchedule ? 'Planning...' : 'Generate Day Plan'}
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, padding: '1.15rem', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '0.85rem',
        background: 'var(--surface-1)',
      }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              gap: '0.65rem',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
            }}
          >
            {m.role === 'assistant' && (
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'var(--navy-900)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', flexShrink: 0, marginTop: '2px',
              }}>
                <Bot size={15} />
              </div>
            )}

            <div style={{
              background: m.role === 'user' ? 'var(--blue-600)' : 'white',
              color: m.role === 'user' ? 'white' : 'var(--text-primary)',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--r-md)',
              border: m.role === 'assistant' ? '1px solid var(--border-light)' : 'none',
              fontSize: '0.88rem', lineHeight: 1.55,
            }}>
              {m.role === 'user' ? (
                <div>{m.content}</div>
              ) : (
                <FormattedMessage content={m.content} isTyping={m.isNew} />
              )}
            </div>

            {m.role === 'user' && (
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'var(--navy-800)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', flexShrink: 0, marginTop: '2px',
              }}>
                <User size={15} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.65rem', alignSelf: 'flex-start' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'var(--navy-900)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', flexShrink: 0,
            }}>
              <Bot size={15} />
            </div>
            <div className="card-flat" style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.83rem', color: 'var(--text-tertiary)' }}>
              <Loader2 size={15} className="animate-spin" color="var(--blue-600)" />
              <span>AI thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts with SVG Icons */}
      <div style={{ padding: '0.5rem 1.15rem', background: 'white', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.label}
            onClick={() => handleSendMessage(qp.prompt)}
            className="chip"
            style={{ fontSize: '0.73rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            {qp.icon} {qp.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        style={{ padding: '0.75rem 1.15rem', background: 'white', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem' }}
      >
        <input
          type="text"
          className="input"
          placeholder={`Ask AI Assistant about ${destination}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
