/* TEAM 4 — SizeGuideModal: Size chart accessible from product pages and standalone */
import { useEffect } from 'react';

const sizeData = [
  { size: 'XS', chest: '34–36" / 86–91cm', shoulder: '16" / 41cm', length: '26" / 66cm', sleeve: '24" / 61cm' },
  { size: 'S',  chest: '36–38" / 91–97cm', shoulder: '17" / 43cm', length: '27" / 69cm', sleeve: '25" / 64cm' },
  { size: 'M',  chest: '38–40" / 97–102cm', shoulder: '18" / 46cm', length: '28" / 71cm', sleeve: '26" / 66cm' },
  { size: 'L',  chest: '40–42" / 102–107cm', shoulder: '19" / 48cm', length: '29" / 74cm', sleeve: '27" / 69cm' },
  { size: 'XL', chest: '42–44" / 107–112cm', shoulder: '20" / 51cm', length: '30" / 76cm', sleeve: '28" / 71cm' },
  { size: 'XXL', chest: '44–46" / 112–117cm', shoulder: '21" / 53cm', length: '31" / 79cm', sleeve: '29" / 74cm' },
];

export default function SizeGuideModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className="relative bg-white dark:bg-[#1A1A1A] rounded-card shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-label="Size guide"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl">SIZE GUIDE</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-gray-light dark:hover:bg-[#2A2A2A] rounded-full transition-colors"
            aria-label="Close size guide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-brand-gray mb-4">All measurements are of the actual garment in inches and centimetres. For the best fit, measure your body and compare to the chart below. Nøiré pieces are designed with an oversized streetwear fit.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-brand-gray-light dark:border-[#2A2A2A]">
                <th className="text-left py-3 pr-4 font-mono font-bold text-xs uppercase tracking-wider">Size</th>
                <th className="text-left py-3 pr-4 font-mono font-bold text-xs uppercase tracking-wider">Chest</th>
                <th className="text-left py-3 pr-4 font-mono font-bold text-xs uppercase tracking-wider">Shoulder</th>
                <th className="text-left py-3 pr-4 font-mono font-bold text-xs uppercase tracking-wider">Length</th>
                <th className="text-left py-3 font-mono font-bold text-xs uppercase tracking-wider">Sleeve</th>
              </tr>
            </thead>
            <tbody>
              {sizeData.map(row => (
                <tr key={row.size} className="border-b border-brand-gray-light/50 dark:border-[#2A2A2A]/50">
                  <td className="py-3 pr-4 font-mono font-bold">{row.size}</td>
                  <td className="py-3 pr-4 text-brand-gray">{row.chest}</td>
                  <td className="py-3 pr-4 text-brand-gray">{row.shoulder}</td>
                  <td className="py-3 pr-4 text-brand-gray">{row.length}</td>
                  <td className="py-3 text-brand-gray">{row.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-brand-orange/10 dark:bg-brand-orange/5 rounded-card p-4">
          <h3 className="font-heading text-base mb-2">HOW TO MEASURE</h3>
          <ul className="space-y-2 text-xs text-brand-gray">
            <li><strong className="text-brand-black dark:text-brand-offwhite">Chest:</strong> Measure around the fullest part of your chest, keeping the tape flat and level.</li>
            <li><strong className="text-brand-black dark:text-brand-offwhite">Shoulder:</strong> Measure from the edge of one shoulder seam to the other across the back.</li>
            <li><strong className="text-brand-black dark:text-brand-offwhite">Length:</strong> Measure from the highest point of the shoulder down to the bottom hem.</li>
            <li><strong className="text-brand-black dark:text-brand-offwhite">Sleeve:</strong> Measure from the shoulder seam down to the end of the cuff.</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-brand-gray-lighter dark:bg-[#2A2A2A] rounded-card">
          <p className="text-xs text-brand-gray"><strong className="text-brand-black dark:text-brand-offwhite">Pro tip:</strong> Nøiré fits are designed oversized. If you prefer a relaxed street fit, go true to size. For an extra dropped-shoulder look, size up one. Still unsure? DM us on Instagram — we'll help you pick.</p>
        </div>

        <p className="text-xs text-brand-gray mt-4 italic">Measurements may vary by ±1 inch depending on the garment style. Always refer to the product-specific size note on each product page where available.</p>
      </div>
    </div>
  );
}

export { sizeData };
