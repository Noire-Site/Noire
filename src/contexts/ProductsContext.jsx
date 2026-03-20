import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProductsContext = createContext({ products: [], loading: true, error: null });

/** Normalize a Supabase row to the shape the app expects */
function normalize(row) {
  const wrapImage = (val) => {
    if (!val) return '';
    // Real image URL → wrap as CSS background shorthand
    if (val.startsWith('http')) return `url(${val}) center/cover no-repeat`;
    return val; // CSS gradient or other value — use as-is
  };

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: row.price,
    salePrice: row.sale_price ?? null,
    tags: row.tags ?? [],
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    images: {
      primary: wrapImage(row.image_primary),
      hover: wrapImage(row.image_hover),
    },
    stock: row.stock ?? 0,
    description: row.description ?? '',
  };
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id');

      if (error) {
        setError(error.message);
      } else {
        setProducts((data ?? []).map(normalize));
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
