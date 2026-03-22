// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

function SkeletonRow() {
  return (
    <tr className="border-b border-[#1A1A1A]">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-[#2A2A2A] rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteState, setDeleteState] = useState({}); // { [id]: 'idle' | 'confirm' | 'deleting' | 'error' }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }

  const getDeleteState = (id) => deleteState[id] ?? 'idle';
  const setDeleteStateFor = (id, state) =>
    setDeleteState((prev) => ({ ...prev, [id]: state }));

  const handleDeleteClick = (id) => {
    if (getDeleteState(id) === 'idle') setDeleteStateFor(id, 'confirm');
  };

  const handleDeleteCancel = (id) => setDeleteStateFor(id, 'idle');

  const handleDeleteConfirm = async (id) => {
    setDeleteStateFor(id, 'deleting');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setDeleteStateFor(id, 'error');
      setTimeout(() => setDeleteStateFor(id, 'idle'), 3000);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteStateFor(id, 'idle');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1
          style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" }}
          className="text-4xl"
        >
          PRODUCTS
        </h1>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#FF4500] hover:bg-[#CC3700] text-white px-5 py-2.5 rounded text-sm font-medium transition-colors"
        >
          <span className="text-lg leading-none">+</span> Add Product
        </Link>
      </div>

      <div className="border border-[#2A2A2A] rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] text-[#5A5651] text-xs uppercase tracking-widest font-mono">
              <th className="text-left py-3 px-4 w-14">Img</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-left py-3 px-4">Price</th>
              <th className="text-left py-3 px-4">Stock</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#5A5651]">
                  No products yet.{' '}
                  <Link to="/admin/products/new" className="text-[#FF4500] hover:underline">
                    Add the first one.
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const dState = getDeleteState(product.id);
                const price = product.sale_price
                  ? `$${product.sale_price} (was $${product.price})`
                  : `$${product.price}`;
                return (
                  <tr
                    key={product.id}
                    className="border-b border-[#1A1A1A] hover:bg-[#1A1A1A] transition-colors"
                  >
                    <td className="py-3 px-4">
                      {product.image_primary ? (
                        <img
                          src={product.image_primary}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#2A2A2A] rounded flex items-center justify-center text-[#5A5651] text-xs">
                          —
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{product.name}</td>
                    <td className="py-3 px-4 text-[#5A5651]">{product.category}</td>
                    <td className="py-3 px-4 text-[#5A5651] font-mono text-xs">{price}</td>
                    <td className="py-3 px-4 text-[#5A5651]">{product.stock}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {dState === 'error' && (
                          <span className="text-red-400 text-xs">Delete failed</span>
                        )}
                        {dState === 'confirm' && (
                          <>
                            <button
                              onClick={() => handleDeleteConfirm(product.id)}
                              className="text-red-400 hover:text-red-300 text-xs transition-colors"
                            >
                              Confirm?
                            </button>
                            <button
                              onClick={() => handleDeleteCancel(product.id)}
                              className="text-[#5A5651] hover:text-white text-xs transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {dState === 'deleting' && (
                          <div className="w-4 h-4 border border-[#5A5651] border-t-transparent rounded-full animate-spin" />
                        )}
                        {(dState === 'idle' || dState === 'error') && (
                          <>
                            <Link
                              to={`/admin/products/${product.id}`}
                              className="text-[#5A5651] hover:text-white text-xs border border-[#3A3A3A] px-3 py-1 rounded hover:bg-[#2A2A2A] transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(product.id)}
                              className="text-red-400 hover:text-red-300 text-xs transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
