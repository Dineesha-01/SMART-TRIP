import React, { useState } from 'react';
import { CheckSquare, Square, Luggage, Plus, Trash2 } from 'lucide-react';

export default function PackingChecklist({ destination }) {
  const [items, setItems] = useState([
    { id: 1, text: 'Passport & Travel Visa Documents', category: 'Documents', packed: true },
    { id: 2, text: 'Comfortable Walking Shoes', category: 'Clothing', packed: false },
    { id: 3, text: 'Universal Power Adapter & Power Bank', category: 'Electronics', packed: true },
    { id: 4, text: 'Weather Appropriate Jacket & Umbrella', category: 'Clothing', packed: false },
    { id: 5, text: 'First Aid Kit & Prescription Medicines', category: 'Medical', packed: false },
    { id: 6, text: 'Credit Cards & Local Currency (Cash)', category: 'Finance', packed: true },
  ]);
  const [newItemText, setNewItemText] = useState('');

  const togglePacked = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, packed: !item.packed } : item));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = {
      id: Date.now(),
      text: newItemText.trim(),
      category: 'General',
      packed: false
    };
    setItems([...items, newItem]);
    setNewItemText('');
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const packedCount = items.filter(i => i.packed).length;
  const progressPercent = items.length > 0 ? Math.round((packedCount / items.length) * 100) : 0;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'var(--blue-gradient)', padding: '0.5rem', borderRadius: '10px', boxShadow: '0 4px 12px var(--blue-glow)' }}>
            <Luggage size={22} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Smart Packing Assistant ({destination})</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {packedCount} of {items.length} Items Packed ({progressPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: '#f1f5f9', height: '8px', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '1.25rem' }}>
        <div style={{ background: 'var(--yellow-blue-gradient)', height: '100%', width: `${progressPercent}%`, transition: 'width 0.4s ease' }} />
      </div>

      {/* Add New Item Input */}
      <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <input 
          type="text" 
          className="input-field" 
          style={{ flex: 1, padding: '0.55rem 0.9rem' }} 
          placeholder="Add custom item to checklist..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1rem' }}>
          <Plus size={16} /> Add Item
        </button>
      </form>

      {/* Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item) => (
          <div 
            key={item.id} 
            onClick={() => togglePacked(item.id)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: item.packed ? '#f0fdf4' : '#f8fafc',
              border: item.packed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #e2e8f0',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {item.packed ? <CheckSquare size={18} color="#047857" /> : <Square size={18} color="var(--text-dim)" />}
              <span style={{ 
                fontSize: '0.9rem', 
                fontWeight: 600,
                textDecoration: item.packed ? 'line-through' : 'none',
                color: item.packed ? '#047857' : 'var(--text-main)'
              }}>
                {item.text}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-attraction" style={{ fontSize: '0.65rem' }}>
                {item.category}
              </span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                style={{ background: 'transparent', color: 'var(--text-dim)', padding: '0.2rem' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
