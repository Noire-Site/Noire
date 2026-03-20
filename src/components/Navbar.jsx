/* TEAM 2 — Navbar: Sticky nav with logo, search, wishlist, cart, dark mode toggle */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Show, SignInButton, SignUpButton } from '@clerk/react';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const { itemCount, setIsOpen } = useCart();
  const { wishlist } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/shop', label: 'Shop' },
    { to: '/shop?category=Men', label: 'Men' },
    { to: '/shop?category=Women', label: 'Women' },
    { to: '/shop?category=Unisex', label: 'Unisex' },
    { to: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-brand-offwhite/90 dark:bg-brand-black/90 backdrop-blur-md border-b border-brand-gray-light dark:border-[#2A2A2A] transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-0 shrink-0 overflow-visible leading-[1.2]" aria-label="Nøiré home">
          <span style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', 'Arial Unicode MS', sans-serif" }} className="text-2xl sm:text-3xl tracking-wide">
            <span className="text-brand-orange">NØ</span>
            <span className="text-brand-black dark:text-brand-offwhite">IRÉ</span>
          </span>
        </Link>

        {/* Desktop Nav Links — centered absolutely */}
        <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-brand-gray hover:text-brand-black dark:hover:text-brand-offwhite transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Auth */}
          <Show fallback={
            <>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-brand-gray hover:text-brand-orange transition-colors px-2 py-1">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-medium bg-brand-orange hover:bg-brand-orange-hover text-white px-3 py-1.5 rounded-pill transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          }>
            <Link
              to="/account"
              className="p-2 rounded-full hover:bg-brand-gray-light dark:hover:bg-[#2A2A2A] transition-colors duration-300"
              aria-label="My Account"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </Show>

          {/* Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-full hover:bg-brand-gray-light dark:hover:bg-[#2A2A2A] transition-colors duration-300"
            aria-label="Search products"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-full hover:bg-brand-gray-light dark:hover:bg-[#2A2A2A] transition-colors duration-300"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Wishlist */}
          <button
            onClick={() => navigate('/wishlist')}
            className="p-2 rounded-full hover:bg-brand-gray-light dark:hover:bg-[#2A2A2A] transition-colors duration-300 relative"
            aria-label={`Wishlist (${wishlist.length} items)`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-full hover:bg-brand-gray-light dark:hover:bg-[#2A2A2A] transition-colors duration-300 relative"
            aria-label={`Cart (${itemCount} items)`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full hover:bg-brand-gray-light dark:hover:bg-[#2A2A2A] transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Search Bar */}
      {searchOpen && (
        <div className="border-t border-brand-gray-light dark:border-[#2A2A2A] px-4 sm:px-6 lg:px-8 py-3 bg-brand-offwhite dark:bg-brand-black">
          <SearchBar onClose={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-gray-light dark:border-[#2A2A2A] bg-brand-offwhite dark:bg-brand-black px-4 py-4 space-y-3">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-brand-gray hover:text-brand-black dark:hover:text-brand-offwhite transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-brand-gray hover:text-brand-black dark:hover:text-brand-offwhite transition-colors"
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
