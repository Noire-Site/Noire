/* TEAM 2 — 404 Page: On-brand error page */
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <h1 className="font-heading text-[8rem] sm:text-[12rem] leading-none text-brand-orange opacity-20">404</h1>
        <h2 className="font-heading text-3xl sm:text-4xl -mt-8 mb-4">NØIRÉ // THIS DROP? NEVER HEARD OF IT.</h2>
        <p className="text-brand-gray mb-8">
          The page you're looking for has either been moved, deleted, or never dropped in the first place.
        </p>
        <Link
          to="/"
          className="inline-block bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-3.5 rounded-pill font-medium transition-all duration-300 hover:-translate-y-0.5"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
