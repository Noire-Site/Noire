/* TEAM 5 — About Page: Brand story, values, editorial layout */
import { useInView } from '../hooks/useInView';

function FadeIn({ children, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>
      {children}
    </div>
  );
}

export default function About() {
  return (
    <main>
      {/* Hero */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-transparent dark:from-brand-orange/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="font-mono text-xs uppercase tracking-widest text-brand-orange">Our Story</span>
            <h1 className="font-heading text-5xl sm:text-7xl mt-3 mb-6">WE DON'T DO BORING.</h1>
            <p className="text-lg text-brand-gray max-w-2xl mx-auto leading-relaxed">
              Nøiré started in a dorm room with a screen printer and a refusal to wear anything generic. 
              We make clothes for people who'd rather be underdressed than overdone.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Pull Quote */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeIn>
          <blockquote className="border-l-4 border-brand-orange pl-6 sm:pl-8">
            <p className="font-heading text-3xl sm:text-5xl leading-tight">
              "FASHION SHOULD FEEL LIKE YOU — NOT LIKE YOU'RE TRYING."
            </p>
            <cite className="block mt-4 text-brand-gray text-sm font-mono not-italic">— Nøiré Founders</cite>
          </blockquote>
        </FadeIn>
      </section>

      {/* Story Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <FadeIn>
            <div className="aspect-[4/5] rounded-card overflow-hidden" style={{ background: 'linear-gradient(135deg, #FF4500 0%, #0D0D0D 100%)' }} />
          </FadeIn>
          <FadeIn className="flex flex-col justify-center">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-orange mb-3">The Beginning</span>
            <h2 className="font-heading text-3xl sm:text-4xl mb-4">STARTED FROM THE DROP</h2>
            <p className="text-brand-gray leading-relaxed mb-4">
              What started as a side hustle selling hand-printed tees at pop-ups turned into something bigger. 
              We realized people were tired of the same recycled trends and wanted something that actually had personality.
            </p>
            <p className="text-brand-gray leading-relaxed">
              Every piece we make goes through the same test: would we actually wear this? If the answer isn't an 
              immediate yes, it doesn't get made. Simple as that.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Values */}
      <section className="bg-brand-black dark:bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <FadeIn>
            <span className="font-mono text-xs uppercase tracking-widest text-brand-orange">What We Stand For</span>
            <h2 className="font-heading text-4xl sm:text-5xl text-brand-offwhite mt-2 mb-12">OUR VALUES</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'QUALITY OVER QUANTITY', desc: 'Limited runs, premium materials. We\'d rather make 100 perfect pieces than 10,000 mediocre ones.' },
              { title: 'WEAR IT YOUR WAY', desc: 'No rules, no dress codes. Our clothes are a canvas — how you style them is entirely up to you.' },
              { title: 'BUILT TO LAST', desc: 'We use heavyweight fabrics and reinforced stitching. These aren\'t clothes you wear once and forget.' },
            ].map((v, i) => (
              <FadeIn key={i}>
                <div className="border border-[#2A2A2A] rounded-card p-6">
                  <div className="font-heading text-5xl text-brand-orange mb-4">0{i + 1}</div>
                  <h3 className="font-heading text-xl text-brand-offwhite mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <FadeIn>
          <h2 className="font-heading text-4xl sm:text-5xl mb-8">BEHIND THE SCENES</h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            'linear-gradient(135deg, #2D2D2D 0%, #A0522D 100%)',
            'linear-gradient(135deg, #191970 0%, #DE9E9E 100%)',
            'linear-gradient(135deg, #556B2F 0%, #FFFDD0 100%)',
            'linear-gradient(135deg, #FF4500 0%, #383838 100%)',
            'linear-gradient(135deg, #9E9E9E 0%, #0D0D0D 100%)',
            'linear-gradient(135deg, #0D0D0D 0%, #CC5500 100%)',
          ].map((bg, i) => (
            <FadeIn key={i}>
              <div className="aspect-square rounded-card overflow-hidden" style={{ background: bg }} />
            </FadeIn>
          ))}
        </div>
      </section>
    </main>
  );
}
