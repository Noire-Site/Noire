// src/components/admin/TagInput.jsx
import { useState, useRef } from 'react';

export default function TagInput({ value = [], onChange }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) { setInput(''); return; }
    onChange([...value, tag]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div
      className="flex flex-wrap gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded px-3 py-2 min-h-[44px] cursor-text focus-within:border-[#FF4500] transition-colors"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 bg-[#2A2A2A] text-white text-xs px-2.5 py-1 rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
            className="text-[#5A5651] hover:text-white leading-none"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={value.length === 0 ? 'Add tags — Enter or comma to add' : ''}
        className="flex-1 min-w-[140px] bg-transparent text-white text-sm placeholder-[#5A5651] outline-none"
      />
    </div>
  );
}
