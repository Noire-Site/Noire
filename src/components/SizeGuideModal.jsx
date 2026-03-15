/* TEAM 4 — SizeGuideModal: Size chart accessible from product pages and standalone */
import { useEffect } from 'react';

const sizeData = [
  { size: 'XS', chest: '32-34"', waist: '26-28"', hip: '34-36"' },
  { size: 'S',  chest: '34-36"', waist: '28-30"', hip: '36-38"' },
  { size: 'M',  chest: '38-40"', waist: '32-34"', hip: '40-42"' },
  { size: 'L',  chest: '42-44"', waist: '36-38"', hip: '44-46"' },
  { size: 'XL', chest: '46-48"', waist: '40-42"', hip: '48-50"' },
  { size: 'XXL', chest: '50-52"', waist: '44-46"', hip: '52-54"' },
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

        <p className="text-sm text-brand-gray mb-4">All measurements are in inches. For the best fit, measure yourself and compare to the chart below.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-brand-gray-light dark:border-[#2A2A2A]">
                <th className="text-left py-3 pr-4 font-mono font-bold text-xs uppercase tracking-wider">Size</th>
                <th className="text-left py-3 pr-4 font-mono font-bold text-xs uppercase tracking-wider">Chest</th>
                <th className="text-left py-3 pr-4 font-mono font-bold text-xs uppercase tracking-wider">Waist</th>
                <th className="text-left py-3 font-mono font-bold text-xs uppercase tracking-wider">Hip</th>
              </tr>
            </thead>
            <tbody>
              {sizeData.map(row => (
                <tr key={row.size} className="border-b border-brand-gray-light/50 dark:border-[#2A2A2A]/50">
                  <td className="py-3 pr-4 font-mono font-bold">{row.size}</td>
                  <td className="py-3 pr-4 text-brand-gray">{row.chest}</td>
                  <td className="py-3 pr-4 text-brand-gray">{row.waist}</td>
                  <td className="py-3 text-brand-gray">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-brand-gray-lighter dark:bg-[#2A2A2A] rounded-card">
          <p className="text-xs text-brand-gray"><strong className="text-brand-black dark:text-brand-offwhite">Pro tip:</strong> If you're between sizes, we recommend sizing up for an oversized fit or sizing down for a snugger look.</p>
        </div>
      </div>
    </div>
  );
}

export { sizeData };
