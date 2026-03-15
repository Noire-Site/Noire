/* TEAM 4 — Size Guide Page: Standalone size chart page */
import { sizeData } from '../components/SizeGuideModal';
import { useInView } from '../hooks/useInView';

function FadeIn({ children, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>
      {children}
    </div>
  );
}

export default function SizeGuide() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <FadeIn>
        <span className="font-mono text-xs uppercase tracking-widest text-brand-orange">Fit Reference</span>
        <h1 className="font-heading text-5xl sm:text-6xl mt-2 mb-4">SIZE GUIDE</h1>
        <p className="text-brand-gray mb-8">All measurements are in inches. For the best fit, measure yourself and compare to the chart below.</p>
      </FadeIn>

      <FadeIn>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-brand-gray-light dark:border-[#2A2A2A] bg-brand-gray-lighter dark:bg-[#2A2A2A]">
                  <th className="text-left py-4 px-6 font-mono font-bold text-xs uppercase tracking-wider">Size</th>
                  <th className="text-left py-4 px-6 font-mono font-bold text-xs uppercase tracking-wider">Chest</th>
                  <th className="text-left py-4 px-6 font-mono font-bold text-xs uppercase tracking-wider">Waist</th>
                  <th className="text-left py-4 px-6 font-mono font-bold text-xs uppercase tracking-wider">Hip</th>
                </tr>
              </thead>
              <tbody>
                {sizeData.map((row, i) => (
                  <tr key={row.size} className={`${i < sizeData.length - 1 ? 'border-b border-brand-gray-light/50 dark:border-[#2A2A2A]/50' : ''}`}>
                    <td className="py-4 px-6 font-mono font-bold">{row.size}</td>
                    <td className="py-4 px-6 text-brand-gray">{row.chest}</td>
                    <td className="py-4 px-6 text-brand-gray">{row.waist}</td>
                    <td className="py-4 px-6 text-brand-gray">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="mt-8 bg-brand-orange/10 dark:bg-brand-orange/5 rounded-card p-6">
          <h3 className="font-heading text-xl mb-2">HOW TO MEASURE</h3>
          <ul className="space-y-2 text-sm text-brand-gray">
            <li><strong className="text-brand-black dark:text-brand-offwhite">Chest:</strong> Measure around the fullest part of your chest, keeping the tape level.</li>
            <li><strong className="text-brand-black dark:text-brand-offwhite">Waist:</strong> Measure around your natural waistline, keeping the tape comfortably loose.</li>
            <li><strong className="text-brand-black dark:text-brand-offwhite">Hip:</strong> Measure around the fullest part of your hips.</li>
          </ul>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="mt-8 p-4 bg-brand-gray-lighter dark:bg-[#2A2A2A] rounded-card">
          <p className="text-xs text-brand-gray"><strong className="text-brand-black dark:text-brand-offwhite">Pro tip:</strong> If you're between sizes, we recommend sizing up for an oversized fit or sizing down for a snugger look. Most of our pieces are designed with a relaxed fit in mind.</p>
        </div>
      </FadeIn>
    </main>
  );
}
