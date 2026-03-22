// src/components/admin/ColorPicker.jsx
import { useState, useRef } from 'react';

function isValidHex(str) {
  return /^#[0-9A-Fa-f]{6}$/.test(str);
}

export default function ColorPicker({ value = [], onChange }) {
  const [hex, setHex] = useState('#FF4500');
  const [error, setError] = useState('');
  const nativeRef = useRef(null);

  const addColor = () => {
    const normalized = hex.trim().toUpperCase();
    if (!isValidHex(normalized)) { setError('Enter a valid 6-digit hex e.g. #FF4500'); return; }
    if (value.some((c) => c.hex.toUpperCase() === normalized)) { setError('Color already added'); return; }
    if (value.length >= 10) { setError('Maximum 10 colors'); return; }
    onChange([...value, { hex: normalized }]);
    setError('');
  };

  const removeColor = (hexToRemove) => onChange(value.filter((c) => c.hex !== hexToRemove));

  const handleNativePick = (e) => {
    setHex(e.target.value.toUpperCase());
    setError('');
  };

  return (
    <div className="space-y-3">
      {/* Existing swatches */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((c) => (
            <div key={c.hex} className="relative group">
              <div
                className="w-9 h-9 rounded-full border-2 border-[#2A2A2A]"
                style={{ backgroundColor: c.hex }}
                title={c.hex}
              />
              <button
                type="button"
                onClick={() => removeColor(c.hex)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full text-[#5A5651] hover:text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${c.hex}`}
              >
                ×
              </button>
              <span className="block text-[9px] text-[#5A5651] font-mono text-center mt-0.5">{c.hex}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add row */}
      {value.length < 10 && (
        <div className="flex items-center gap-2">
          {/* Native color picker */}
          <div
            className="relative w-10 h-10 rounded overflow-hidden border border-[#2A2A2A] cursor-pointer shrink-0"
            style={{ backgroundColor: hex }}
            onClick={() => nativeRef.current?.click()}
          >
            <input
              ref={nativeRef}
              type="color"
              value={hex}
              onChange={handleNativePick}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>
          {/* Hex text input */}
          <input
            type="text"
            value={hex}
            onChange={(e) => { setHex(e.target.value); setError(''); }}
            placeholder="#FF4500"
            maxLength={7}
            className="w-28 bg-[#1A1A1A] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm font-mono placeholder-[#5A5651] focus:outline-none focus:border-[#FF4500] transition-colors"
          />
          <button
            type="button"
            onClick={addColor}
            className="px-4 py-2 text-sm border border-[#3A3A3A] text-white rounded hover:bg-[#2A2A2A] transition-colors"
          >
            Add
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
