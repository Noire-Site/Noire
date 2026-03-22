// src/pages/admin/ProductForm.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import TagInput from '../../components/admin/TagInput';
import ColorPicker from '../../components/admin/ColorPicker';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const CATEGORIES = ['Men', 'Women', 'Unisex'];

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const inputClass =
  'w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-4 py-3 text-white placeholder-[#5A5651] focus:outline-none focus:border-[#FF4500] transition-colors text-sm';

const labelClass = 'block text-xs uppercase tracking-widest text-[#5A5651] font-mono mb-1.5';

function Field({ label, children, error }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function ImageUpload({ label, currentUrl, onUpload, onError, optional = false }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError('');
    onError?.(false);
    setUploading(true);

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `products/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: false });

    if (error) {
      setUploadError('Upload failed — try again');
      onError?.(true);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    onUpload(urlData.publicUrl);
    onError?.(false);
    setUploading(false);
  };

  return (
    <div>
      <label className={labelClass}>
        {label}{optional ? ' (optional)' : ''}
      </label>
      <div className="space-y-2">
        {currentUrl ? (
          <div className="relative inline-block">
            <img
              src={currentUrl}
              alt="preview"
              className="h-24 w-auto rounded object-cover border border-[#2A2A2A]"
            />
            <button
              type="button"
              onClick={() => {
                onUpload('');
                onError?.(false);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full text-[#5A5651] hover:text-white text-xs flex items-center justify-center"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-sm border border-[#3A3A3A] text-white px-4 py-2 rounded hover:bg-[#2A2A2A] disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading…' : currentUrl ? 'Replace' : 'Choose File'}
          </button>
          {uploading && (
            <div className="w-4 h-4 border border-[#FF4500] border-t-transparent rounded-full animate-spin" />
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>
        {uploadError && <p className="text-red-400 text-xs">{uploadError}</p>}
      </div>
    </div>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [imagePrimaryError, setImagePrimaryError] = useState(false);

  const slugLocked = useRef(isEdit);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: 'Men',
    price: '',
    sale_price: '',
    tags: [],
    sizes: [],
    colors: [],
    image_primary: '',
    image_hover: '',
    stock: '',
    description: '',
  });

  // Fetch existing product in edit mode
  useEffect(() => {
    if (!isEdit) return;
    async function load() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) { navigate('/admin'); return; }
      setForm({
        name: data.name ?? '',
        slug: data.slug ?? '',
        category: data.category ?? 'Men',
        price: data.price ?? '',
        sale_price: data.sale_price ?? '',
        tags: data.tags ?? [],
        sizes: data.sizes ?? [],
        colors: data.colors ?? [],
        image_primary: data.image_primary ?? '',
        image_hover: data.image_hover ?? '',
        stock: data.stock ?? '',
        description: data.description ?? '',
      });
      setLoadingProduct(false);
    }
    load();
  }, [id, isEdit, navigate]);

  // Auto-generate slug from name (only when not locked)
  useEffect(() => {
    if (slugLocked.current) return;
    setForm((prev) => ({ ...prev, slug: slugify(prev.name) }));
  }, [form.name]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSize = (size) => {
    set(
      'sizes',
      form.sizes.includes(size)
        ? form.sizes.filter((s) => s !== size)
        : [...form.sizes, size]
    );
  };

  const handleSlugChange = (e) => {
    slugLocked.current = e.target.value !== '';
    set('slug', e.target.value);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.slug.trim()) errs.slug = 'Required';
    if (form.price === '' || isNaN(Number(form.price))) errs.price = 'Required — enter a number';
    if (form.stock === '' || isNaN(Number(form.stock))) errs.stock = 'Required — enter a number';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      category: form.category,
      price: Number(form.price),
      sale_price: form.sale_price !== '' ? Number(form.sale_price) : null,
      tags: form.tags,
      sizes: form.sizes,
      colors: form.colors,
      image_primary: form.image_primary.trim() || null,
      image_hover: form.image_hover.trim() || null,
      stock: Number(form.stock),
      description: form.description.trim() || null,
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from('products').update(payload).eq('id', id));
    } else {
      ({ error } = await supabase.from('products').insert([payload]));
    }

    setSaving(false);

    if (error) {
      if (error.message?.includes('slug')) {
        setFieldErrors({ slug: 'This slug is already taken — please choose another.' });
      } else {
        setFormError(error.message);
      }
      return;
    }

    navigate('/admin');
  };

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#FF4500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin" className="text-[#5A5651] hover:text-white transition-colors text-sm">
          ← Back
        </Link>
        <h1
          style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', sans-serif" }}
          className="text-4xl"
        >
          {isEdit ? 'EDIT PRODUCT' : 'ADD PRODUCT'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <Field label="Name *" error={fieldErrors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Shadow Hoodie"
            className={inputClass}
          />
        </Field>

        {/* Slug */}
        <Field label="Slug *" error={fieldErrors.slug}>
          <input
            type="text"
            value={form.slug}
            onChange={handleSlugChange}
            placeholder="e.g. shadow-hoodie"
            className={inputClass}
          />
          <p className="text-[#5A5651] text-xs mt-1">Auto-generated from name. Clear this field to reset.</p>
        </Field>

        {/* Category */}
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        {/* Price + Sale Price */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price *" error={fieldErrors.price}>
            <input
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </Field>
          <Field label="Sale Price (optional)">
            <input
              type="number"
              min="0"
              step="1"
              value={form.sale_price}
              onChange={(e) => set('sale_price', e.target.value)}
              placeholder="—"
              className={inputClass}
            />
          </Field>
        </div>

        {/* Tags */}
        <Field label="Tags">
          <TagInput value={form.tags} onChange={(v) => set('tags', v)} />
          <p className="text-[#5A5651] text-xs mt-1">e.g. Sale, New Drop, Nøiré Exclusive</p>
        </Field>

        {/* Sizes */}
        <Field label="Sizes Available">
          <div className="flex flex-wrap gap-2 mt-1">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  form.sizes.includes(size)
                    ? 'bg-[#FF4500] border-[#FF4500] text-white'
                    : 'border-[#2A2A2A] text-[#5A5651] hover:border-[#5A5651] hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </Field>

        {/* Colors */}
        <Field label="Colors">
          <ColorPicker value={form.colors} onChange={(v) => set('colors', v)} />
        </Field>

        {/* Image Primary */}
        <ImageUpload
          label="Image"
          currentUrl={form.image_primary}
          onUpload={(url) => set('image_primary', url)}
          onError={setImagePrimaryError}
        />

        {/* Image Hover */}
        <ImageUpload
          label="Hover Image"
          currentUrl={form.image_hover}
          onUpload={(url) => set('image_hover', url)}
          optional
        />

        {/* Stock */}
        <Field label="Stock *" error={fieldErrors.stock}>
          <input
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => set('stock', e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </Field>

        {/* Description */}
        <Field label="Description (optional)">
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Product description…"
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </Field>

        {/* Submit */}
        {formError && <p className="text-red-400 text-sm">{formError}</p>}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving || imagePrimaryError}
            className="bg-[#FF4500] hover:bg-[#CC3700] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded font-medium transition-colors text-sm"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
          </button>
          <Link
            to="/admin"
            className="text-sm text-[#5A5651] hover:text-white border border-[#3A3A3A] px-6 py-3 rounded hover:bg-[#2A2A2A] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
