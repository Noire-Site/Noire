/* Account Page: Profile, Shipping Addresses, Order History, Settings */
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../utils/supabase';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const EMPTY_ADDR_FORM = { label: '', name: '', phone: '', flat_number: '', apartment: '', landmark: '', street: '', city: '', state: '', pincode: '' };

const tabs = [
  { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'addresses', label: 'Addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const STATUS_STYLE = {
  pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  shipped:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  delivered:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const WHATSAPP_NUMBER = '918826359848';

export default function Account() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDR_FORM);

  // Fetch addresses & orders from Supabase
  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    async function fetchData() {
      setLoading(true);
      const email = user.primaryEmailAddress?.emailAddress;
    const [addrRes, orderRes] = await Promise.all([
        supabase.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }),
        email
          ? supabase.from('orders').select('*').eq('customer_email', email).order('created_at', { ascending: false })
          : Promise.resolve({ data: [] }),
      ]);
      if (addrRes.data) setAddresses(addrRes.data);
      if (orderRes.data) setOrders(orderRes.data);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  if (!isLoaded) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-4xl mb-4">SIGN IN REQUIRED</h1>
        <p className="text-brand-gray mb-6">Please sign in to access your account.</p>
        <Link to="/" className="inline-block bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-3 rounded-pill font-medium transition-colors">
          Go Home
        </Link>
      </main>
    );
  }

  const startEditAddress = (addr) => {
    setEditingAddress(addr?.id || 'new');
    setAddressForm(addr ? {
      label:       addr.label       || '',
      name:        addr.name        || '',
      phone:       addr.phone       || '',
      flat_number: addr.flat_number || '',
      apartment:   addr.apartment   || '',
      landmark:    addr.landmark    || '',
      street:      addr.street      || '',
      city:        addr.city        || '',
      state:       addr.state       || '',
      pincode:     addr.pincode     || '',
    } : EMPTY_ADDR_FORM);
  };

  const saveAddress = async () => {
    if (!addressForm.flat_number.trim() || !addressForm.street.trim() || !addressForm.city.trim()) return;
    const userId = user.id;

    if (editingAddress === 'new') {
      const isFirst = addresses.length === 0;
      const { data, error } = await supabase.from('addresses').insert({
        user_id: userId,
        ...addressForm,
        is_default: isFirst,
      }).select().single();
      if (!error && data) setAddresses(prev => [...prev, data]);
    } else {
      const { data, error } = await supabase.from('addresses').update(addressForm).eq('id', editingAddress).select().single();
      if (!error && data) setAddresses(prev => prev.map(a => a.id === editingAddress ? data : a));
    }
    setEditingAddress(null);
  };

  const deleteAddress = async (id) => {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (filtered.length > 0 && !filtered.some(a => a.is_default)) {
        filtered[0].is_default = true;
        supabase.from('addresses').update({ is_default: true }).eq('id', filtered[0].id);
      }
      return filtered;
    });
  };

  const setDefaultAddress = async (id) => {
    const userId = user.id;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl">MY ACCOUNT</h1>
          <p className="text-brand-gray mt-1">Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0]}</p>
        </div>
        <button
          onClick={() => signOut(() => navigate('/'))}
          className="text-sm text-brand-gray hover:text-red-500 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white dark:bg-[#1A1A1A] rounded-card p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-orange text-white'
                    : 'text-brand-gray hover:text-brand-black dark:hover:text-brand-offwhite hover:bg-brand-gray-light/50 dark:hover:bg-[#2A2A2A]/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-6 sm:p-8">
              <h2 className="font-heading text-2xl mb-6">PROFILE</h2>
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-brand-gray-light dark:border-[#2A2A2A]">
                <div className="w-16 h-16 rounded-full bg-brand-orange flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (user.firstName?.[0] || user.emailAddresses[0]?.emailAddress?.[0] || 'N').toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-medium text-lg text-brand-black dark:text-brand-offwhite">{user.fullName || 'Nøiré Member'}</p>
                  <p className="text-sm text-brand-gray">{user.emailAddresses[0]?.emailAddress}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">First Name</label>
                  <p className="px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] rounded-card text-brand-black dark:text-brand-offwhite">{user.firstName || '—'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Last Name</label>
                  <p className="px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] rounded-card text-brand-black dark:text-brand-offwhite">{user.lastName || '—'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Email</label>
                  <p className="px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] rounded-card text-brand-black dark:text-brand-offwhite">{user.emailAddresses[0]?.emailAddress}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Member Since</label>
                  <p className="px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] rounded-card text-brand-black dark:text-brand-offwhite">{new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <p className="text-xs text-brand-gray mt-6">Profile details are managed through Clerk. Click your avatar in the navbar to update.</p>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl">SHIPPING ADDRESSES</h2>
                <button
                  onClick={() => startEditAddress(null)}
                  className="text-sm font-medium text-brand-orange hover:text-brand-orange-hover transition-colors"
                >
                  + Add Address
                </button>
              </div>

              {editingAddress && (
                <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-6">
                  <h3 className="font-medium mb-4 text-brand-black dark:text-brand-offwhite">{editingAddress === 'new' ? 'New Address' : 'Edit Address'}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Label + Name */}
                    {[
                      { field: 'label', label: 'Label', placeholder: 'e.g. Home, Office' },
                      { field: 'name',  label: 'Full Name', placeholder: 'John Doe' },
                      { field: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
                    ].map(({ field, label, placeholder }) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-brand-gray mb-1">{label}</label>
                        <input
                          type="text"
                          value={addressForm[field]}
                          onChange={e => setAddressForm(prev => ({ ...prev, [field]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card text-brand-black dark:text-brand-offwhite placeholder:text-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                        />
                      </div>
                    ))}
                    {/* Flat + Apartment */}
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-1">Flat / House Number *</label>
                      <input
                        type="text"
                        value={addressForm.flat_number}
                        onChange={e => setAddressForm(prev => ({ ...prev, flat_number: e.target.value }))}
                        placeholder="B-204"
                        className="w-full px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card text-brand-black dark:text-brand-offwhite placeholder:text-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-1">Apartment / Building Name</label>
                      <input
                        type="text"
                        value={addressForm.apartment}
                        onChange={e => setAddressForm(prev => ({ ...prev, apartment: e.target.value }))}
                        placeholder="Sunshine Heights"
                        className="w-full px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card text-brand-black dark:text-brand-offwhite placeholder:text-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                      />
                    </div>
                    {/* Landmark */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-brand-gray mb-1">Landmark</label>
                      <input
                        type="text"
                        value={addressForm.landmark}
                        onChange={e => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))}
                        placeholder="Near City Mall"
                        className="w-full px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card text-brand-black dark:text-brand-offwhite placeholder:text-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                      />
                    </div>
                    {/* Street */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-brand-gray mb-1">Street / Area *</label>
                      <input
                        type="text"
                        value={addressForm.street}
                        onChange={e => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                        placeholder="MG Road, Koramangala"
                        className="w-full px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card text-brand-black dark:text-brand-offwhite placeholder:text-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                      />
                    </div>
                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-1">City *</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={e => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Bengaluru"
                        className="w-full px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card text-brand-black dark:text-brand-offwhite placeholder:text-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                      />
                    </div>
                    {/* State dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-1">State *</label>
                      <select
                        value={addressForm.state}
                        onChange={e => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card text-brand-black dark:text-brand-offwhite focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {/* Pincode */}
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-1">Pincode *</label>
                      <input
                        type="number"
                        value={addressForm.pincode}
                        onChange={e => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                        placeholder="560001"
                        className="w-full px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card text-brand-black dark:text-brand-offwhite placeholder:text-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={saveAddress} className="bg-brand-orange hover:bg-brand-orange-hover text-white px-6 py-2.5 rounded-pill text-sm font-medium transition-colors">Save</button>
                    <button onClick={() => setEditingAddress(null)} className="px-6 py-2.5 border border-brand-gray-light dark:border-[#2A2A2A] rounded-pill text-sm font-medium text-brand-gray hover:border-brand-orange transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              {addresses.length === 0 ? (
                <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-8 text-center">
                  <p className="text-brand-gray mb-4">No saved addresses yet.</p>
                  <button onClick={() => startEditAddress(null)} className="bg-brand-orange hover:bg-brand-orange-hover text-white px-6 py-2.5 rounded-pill text-sm font-medium transition-colors">
                    Add Your First Address
                  </button>
                </div>
              ) : (
                addresses.map(addr => (
                  <div key={addr.id} className="bg-white dark:bg-[#1A1A1A] rounded-card p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-brand-black dark:text-brand-offwhite">{addr.label || 'Address'}</span>
                        {addr.is_default && <span className="text-[10px] font-mono font-bold bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-pill">DEFAULT</span>}
                      </div>
                      {addr.name && <p className="text-sm text-brand-black dark:text-brand-offwhite">{addr.name}</p>}
                      {(addr.flat_number || addr.apartment) && (
                        <p className="text-sm text-brand-gray">{[addr.flat_number, addr.apartment].filter(Boolean).join(', ')}</p>
                      )}
                      {addr.landmark && <p className="text-sm text-brand-gray">Near {addr.landmark}</p>}
                      {addr.street && <p className="text-sm text-brand-gray">{addr.street}</p>}
                      <p className="text-sm text-brand-gray">
                        {[addr.city, addr.state].filter(Boolean).join(', ')}
                        {addr.pincode ? ` — ${addr.pincode}` : ''}
                      </p>
                      {addr.phone && <p className="text-sm text-brand-gray">{addr.phone}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!addr.is_default && (
                        <button onClick={() => setDefaultAddress(addr.id)} className="text-xs text-brand-gray hover:text-brand-orange transition-colors">Set Default</button>
                      )}
                      <button onClick={() => startEditAddress(addr)} className="text-xs text-brand-gray hover:text-brand-orange transition-colors">Edit</button>
                      <button onClick={() => deleteAddress(addr.id)} className="text-xs text-brand-gray hover:text-red-500 transition-colors">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="font-heading text-2xl">ORDER HISTORY</h2>
              {loading ? (
                <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-8 text-center">
                  <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-8 text-center">
                  <p className="text-brand-gray mb-4">No orders yet.</p>
                  <Link to="/shop" className="inline-block bg-brand-orange hover:bg-brand-orange-hover text-white px-6 py-2.5 rounded-pill text-sm font-medium transition-colors">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                orders.map(order => {
                  const orderId = order.order_id || order.order_number || '—';
                  const status = order.status || order.fulfillment_status || 'pending';
                  const itemCount = (order.items ?? []).length;
                  const total = order.total_amount ?? order.total ?? 0;
                  const waMessage = `Hi, my Order ID is ${orderId}`;
                  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
                  const needsConfirm = status === 'pending';

                  return (
                    <div key={order.id} className="bg-white dark:bg-[#1A1A1A] rounded-card p-6">
                      {/* Header row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono font-bold text-brand-black dark:text-brand-offwhite">{orderId}</span>
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-pill ${STATUS_STYLE[status] || 'bg-gray-100 text-gray-600'}`}>
                            {status.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-brand-gray">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>

                      {/* Items preview */}
                      {(order.items ?? []).length > 0 && (
                        <div className="space-y-1 mb-4">
                          {(order.items ?? []).map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-brand-gray">{item.name} <span className="text-xs">({item.size}/{item.color}) × {item.quantity}</span></span>
                              <span className="font-mono text-brand-black dark:text-brand-offwhite">₹{((item.price ?? 0) * (item.quantity ?? 1)).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Footer row */}
                      <div className="flex items-center justify-between pt-3 border-t border-brand-gray-light dark:border-[#2A2A2A]">
                        <span className="text-sm text-brand-gray">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                        <span className="font-mono font-bold text-brand-black dark:text-brand-offwhite">₹{Number(total).toFixed(2)}</span>
                      </div>

                      {/* WhatsApp tracking for pending orders */}
                      {needsConfirm && WHATSAPP_NUMBER && (
                        <div className="mt-4 pt-4 border-t border-brand-gray-light dark:border-[#2A2A2A]">
                          <p className="text-xs text-brand-gray mb-2">Send us your Order ID on WhatsApp to confirm this order:</p>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm px-4 py-2 rounded-pill font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.103 1.522 5.828L0 24l6.336-1.5A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.869 9.869 0 01-5.031-1.378l-.361-.214-3.741.885.939-3.619-.235-.373A9.865 9.865 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z"/>
                            </svg>
                            Confirm on WhatsApp
                          </a>
                        </div>
                      )}

                      {/* Status tracker for non-pending orders */}
                      {!needsConfirm && status !== 'cancelled' && (
                        <div className="mt-4 pt-4 border-t border-brand-gray-light dark:border-[#2A2A2A]">
                          <div className="flex items-center gap-1">
                            {['confirmed', 'processing', 'shipped', 'delivered'].map((s, i, arr) => {
                              const steps = ['confirmed', 'processing', 'shipped', 'delivered'];
                              const currentIdx = steps.indexOf(status);
                              const stepIdx = steps.indexOf(s);
                              const done = stepIdx <= currentIdx;
                              return (
                                <div key={s} className="flex items-center flex-1">
                                  <div className={`w-2 h-2 rounded-full shrink-0 ${done ? 'bg-brand-orange' : 'bg-brand-gray-light dark:bg-[#2A2A2A]'}`} />
                                  {i < arr.length - 1 && <div className={`flex-1 h-px mx-1 ${done && stepIdx < currentIdx ? 'bg-brand-orange' : 'bg-brand-gray-light dark:bg-[#2A2A2A]'}`} />}
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between mt-1">
                            {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map(s => (
                              <span key={s} className="text-[9px] text-brand-gray font-mono uppercase">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h2 className="font-heading text-2xl">SETTINGS</h2>

              {/* Appearance */}
              <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-6">
                <h3 className="font-medium mb-4 text-brand-black dark:text-brand-offwhite">Appearance</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-black dark:text-brand-offwhite">Dark Mode</p>
                    <p className="text-xs text-brand-gray">Switch between light and dark themes</p>
                  </div>
                  <button
                    onClick={toggle}
                    className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-brand-orange' : 'bg-brand-gray-light dark:bg-[#2A2A2A]'}`}
                    aria-label="Toggle dark mode"
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${dark ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-6">
                <h3 className="font-medium mb-4 text-brand-black dark:text-brand-offwhite">Notifications</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Order Updates', desc: 'Get notified about your order status' },
                    { label: 'New Drops', desc: 'Be first to know about new releases' },
                    { label: 'Sale Alerts', desc: 'Never miss a sale or promo code' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-brand-black dark:text-brand-offwhite">{item.label}</p>
                        <p className="text-xs text-brand-gray">{item.desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand-orange" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Currency / Region */}
              <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-6">
                <h3 className="font-medium mb-4 text-brand-black dark:text-brand-offwhite">Region</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-brand-gray mb-1">Currency</label>
                    <p className="px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] rounded-card text-brand-black dark:text-brand-offwhite">₹ INR (Indian Rupee)</p>
                  </div>
                  <div>
                    <label className="block text-sm text-brand-gray mb-1">Country</label>
                    <p className="px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] rounded-card text-brand-black dark:text-brand-offwhite">India</p>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-6 border border-red-200 dark:border-red-900/30">
                <h3 className="font-medium mb-2 text-red-600 dark:text-red-400">Danger Zone</h3>
                <p className="text-xs text-brand-gray mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium border border-red-200 dark:border-red-900/30 px-4 py-2 rounded-pill hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
