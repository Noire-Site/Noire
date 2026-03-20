/* ===================================================
   TEAM 2 — App Shell: Routing, Layout, Context Providers
   =================================================== */
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ProductsProvider } from './contexts/ProductsContext';
import ScrollToTop from './utils/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CookieConsent from './components/CookieConsent';
import AuthPromptModal from './components/AuthPromptModal';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import Returns from './pages/Returns';
import SizeGuide from './pages/SizeGuide';
import Wishlist from './pages/Wishlist';
import NotFound from './pages/NotFound';
import Account from './pages/Account';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    let pageName = 'Home';

    if (pathname === '/shop') pageName = 'Shop';
    else if (pathname.startsWith('/product/')) pageName = 'Product';
    else if (pathname === '/checkout') pageName = 'Checkout';
    else if (pathname === '/about') pageName = 'About';
    else if (pathname === '/contact') pageName = 'Contact';
    else if (pathname === '/returns') pageName = 'Returns';
    else if (pathname === '/size-guide') pageName = 'Size Guide';
    else if (pathname === '/wishlist') pageName = 'Wishlist';
    else if (pathname === '/account') pageName = 'Account';
    else if (pathname === '/privacy') pageName = 'Privacy Policy';
    else if (pathname === '/terms') pageName = 'Terms & Conditions';
    else if (pathname === '/cookies') pageName = 'Cookie Policy';
    else if (pathname !== '/') pageName = '404';

    document.title = `Nøiré — ${pageName}`;
  }, [location]);

  return (
    <ThemeProvider>
      <ProductsProvider>
      <CartProvider>
        <WishlistProvider>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <CartDrawer />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/size-guide" element={<SizeGuide />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/account" element={<Account />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
            <CookieConsent />
            <AuthPromptModal />
          </div>
        </WishlistProvider>
      </CartProvider>
      </ProductsProvider>
    </ThemeProvider>
  );
}
