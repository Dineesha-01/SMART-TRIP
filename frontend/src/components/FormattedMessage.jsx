import React, { useState, useEffect } from 'react';

/**
 * Parses raw Markdown text (headers, bold **, lists *, -, 1.) into clean structured React elements
 * without showing raw markdown characters like asterisks *.
 */
export function renderFormattedMarkdown(text = '') {
  if (!text) return null;

  // Split text into paragraphs/lines
  const lines = text.split('\n');
  const elements = [];

  let inList = false;
  let listItems = [];

  const flushList = (keyPrefix) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} style={{ margin: '0.4rem 0', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {listItems.map((item, idx) => (
            <li key={idx} style={{ lineHeight: 1.5 }}>
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(`line-${index}`);
      return;
    }

    // Header 1, 2, 3
    if (trimmed.startsWith('#')) {
      flushList(`line-${index}`);
      const headerText = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <h4 key={`h-${index}`} style={{
          fontSize: '0.95rem',
          fontWeight: 800,
          color: 'inherit',
          marginTop: index > 0 ? '0.75rem' : '0.2rem',
          marginBottom: '0.35rem',
          borderBottom: trimmed.startsWith('# ') || trimmed.startsWith('## ') ? '1px solid rgba(0,0,0,0.1)' : 'none',
          paddingBottom: '0.2rem',
        }}>
          {parseInlineMarkdown(headerText)}
        </h4>
      );
      return;
    }

    // Bullet point (starts with * or - or •)
    if (/^[\*\-\•]\s+/.test(trimmed)) {
      inList = true;
      const itemContent = trimmed.replace(/^[\*\-\•]\s+/, '');
      listItems.push(itemContent);
      return;
    }

    // Numbered list (starts with 1. 2. etc)
    if (/^\d+[\.\)]\s+/.test(trimmed)) {
      inList = true;
      const itemContent = trimmed.replace(/^\d+[\.\)]\s+/, '');
      listItems.push(itemContent);
      return;
    }

    // Regular line / paragraph
    flushList(`line-${index}`);
    elements.push(
      <p key={`p-${index}`} style={{ marginBottom: '0.4rem', lineHeight: 1.55 }}>
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });

  flushList('final');

  return elements;
}

/**
 * Converts inline **bold** and *italic* into <strong> and <em> tags cleanly.
 */
function parseInlineMarkdown(str = '') {
  // Replace **bold** with <strong>
  const parts = [];
  let remaining = str;
  let keyIdx = 0;

  // Regex matches **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;

  while ((match = boldRegex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={`b-${keyIdx++}`} style={{ fontWeight: 700 }}>
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts.length > 0 ? parts : str;
}

/**
 * Message component with typewriter effect for new assistant messages.
 */
export default function FormattedMessage({ content, isTyping = false, onTypingComplete }) {
  const [displayedText, setDisplayedText] = useState(isTyping ? '' : content);
  const [isDone, setIsDone] = useState(!isTyping);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(content);
      setIsDone(true);
      return;
    }

    let i = 0;
    setDisplayedText('');
    setIsDone(false);

    // Typing speed
    const interval = setInterval(() => {
      i += 3; // 3 chars per tick for smooth natural speed
      if (i >= content.length) {
        setDisplayedText(content);
        setIsDone(true);
        clearInterval(interval);
        if (onTypingComplete) onTypingComplete();
      } else {
        setDisplayedText(content.substring(0, i));
      }
    }, 15);

    return () => clearInterval(interval);
  }, [content, isTyping, onTypingComplete]);

  return (
    <div style={{ wordBreak: 'break-word' }}>
      {renderFormattedMarkdown(displayedText)}
      {!isDone && (
        <span style={{
          display: 'inline-block',
          width: '6px',
          height: '14px',
          background: 'var(--blue-600)',
          marginLeft: '4px',
          verticalAlign: 'middle',
          animation: 'blink 0.7s infinite',
        }} />
      )}
      <style>{`
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
