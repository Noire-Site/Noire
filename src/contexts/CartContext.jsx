/* TEAM 4 — Cart Context: Full cart state management */
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => load('cart_items', []));
  const [isOpen, setIsOpen] = useState(false);
  const [promoCode, setPromoCode] = useState(() => load('cart_promo_code', ''));
  const [promoData, setPromoData] = useState(() => load('cart_promo_data', null));

  useEffect(() => { localStorage.setItem('cart_items', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('cart_promo_code', JSON.stringify(promoCode)); }, [promoCode]);
  useEffect(() => { localStorage.setItem('cart_promo_data', JSON.stringify(promoData)); }, [promoData]);

  const addItem = useCallback((product, size, color) => {
    setItems(prev => {
      const key = `${product.id}-${size}-${color}`;
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        key,
        id: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        originalPrice: product.price,
        size,
        color,
        image: product.images.primary,
        quantity: 1,
      }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((key) => {
    setItems(prev => prev.filter(i => i.key !== key));
  }, []);

  const updateQuantity = useCallback((key, delta) => {
    setItems(prev => prev.map(i => {
      if (i.key !== key) return i;
      const newQty = i.quantity + delta;
      return newQty > 0 ? { ...i, quantity: newQty } : i;
    }).filter(i => i.quantity > 0));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode('');
    setPromoData(null);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const applyPromo = useCallback(async (code) => {
    const trimmed = code?.trim().toUpperCase();
    if (!trimmed) return { success: false, message: 'Enter a promo code.' };

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', trimmed)
      .single();

    if (error || !data) return { success: false, message: 'Invalid code.' };
    if (!data.is_active) return { success: false, message: 'This code is no longer active.' };
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { success: false, message: 'Code expired.' };
    }
    if (data.max_uses !== null && data.uses_count >= data.max_uses) {
      return { success: false, message: 'Code has reached its usage limit.' };
    }
    if (data.min_order_value && subtotal < data.min_order_value) {
      return { success: false, message: `Minimum order ₹${data.min_order_value} required.` };
    }

    setPromoCode(data.code);
    setPromoData(data);

    const label = data.discount_type === 'percentage'
      ? `${data.discount_value}% off`
      : `₹${data.discount_value} off`;
    return { success: true, message: `${data.code} applied — ${label}!` };
  }, [subtotal]);

  const removePromo = useCallback(() => {
    setPromoCode('');
    setPromoData(null);
  }, []);

  // Called after a successful order is placed to atomically increment the counter
  const incrementPromoUses = useCallback(async () => {
    if (!promoData?.id) return;
    await supabase.rpc('increment_promo_uses', { promo_id: promoData.id });
  }, [promoData]);

  const discount = useMemo(() => {
    if (!promoData) return 0;
    if (promoData.discount_type === 'percentage') {
      return subtotal * (promoData.discount_value / 100);
    }
    // fixed — never exceed subtotal
    return Math.min(promoData.discount_value, subtotal);
  }, [promoData, subtotal]);

  const total = subtotal - discount;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen,
      addItem, removeItem, updateQuantity, clearCart,
      promoCode, promoData, applyPromo, removePromo, incrementPromoUses,
      subtotal, discount, total, itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
