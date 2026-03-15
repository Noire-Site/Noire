/* Account Page: Profile, Shipping Addresses, Order History, Settings */
import { useState } from 'react';
import { useUser, useAuth } from '@clerk/react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const tabs = [
  { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'addresses', label: 'Addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const demoOrders = [
  { id: 'NR-7K2M4X', date: '2026-03-10', status: 'Delivered', items: 3, total: 18497 },
  { id: 'NR-9P3L1W', date: '2026-02-24', status: 'Delivered', items: 1, total: 7499 },
  { id: 'NR-5T8N6R', date: '2026-02-01', status: 'Delivered', items: 2, total: 12998 },
];

const statusColor = {
  'Delivered': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Shipped': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Processing': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function Account() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home', name: '', address: '123 Main Street', city: 'Mumbai', state: 'Maharashtra', postal: '400001', phone: '+91 98765 43210', isDefault: true },
  ]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ label: '', name: '', address: '', city: '', state: '', postal: '', phone: '' });

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
    setAddressForm(addr ? { label: addr.label, name: addr.name, address: addr.address, city: addr.city, state: addr.state, postal: addr.postal, phone: addr.phone } : { label: '', name: '', address: '', city: '', state: '', postal: '', phone: '' });
  };

  const saveAddress = () => {
    if (!addressForm.address.trim() || !addressForm.city.trim()) return;
    if (editingAddress === 'new') {
      setAddresses(prev => [...prev, { ...addressForm, id: Date.now(), isDefault: prev.length === 0 }]);
    } else {
      setAddresses(prev => prev.map(a => a.id === editingAddress ? { ...a, ...addressForm } : a));
    }
    setEditingAddress(null);
  };

  const deleteAddress = (id) => {
    setAddresses(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  };

  const setDefaultAddress = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
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
                    {['label', 'name', 'phone', 'address', 'city', 'state', 'postal'].map(field => (
                      <div key={field} className={field === 'address' ? 'sm:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-brand-gray mb-1 capitalize">{field === 'postal' ? 'PIN Code' : field}</label>
                        <input
                          type="text"
                          value={addressForm[field]}
                          onChange={e => setAddressForm(prev => ({ ...prev, [field]: e.target.value }))}
                          placeholder={field === 'label' ? 'e.g. Home, Office' : field === 'postal' ? '110001' : field === 'phone' ? '+91 98765 43210' : ''}
                          className="w-full px-4 py-3 bg-brand-offwhite dark:bg-[#0D0D0D] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card text-brand-black dark:text-brand-offwhite placeholder:text-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                        />
                      </div>
                    ))}
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
                        {addr.isDefault && <span className="text-[10px] font-mono font-bold bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-pill">DEFAULT</span>}
                      </div>
                      {addr.name && <p className="text-sm text-brand-black dark:text-brand-offwhite">{addr.name}</p>}
                      <p className="text-sm text-brand-gray">{addr.address}</p>
                      <p className="text-sm text-brand-gray">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postal}</p>
                      {addr.phone && <p className="text-sm text-brand-gray">{addr.phone}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!addr.isDefault && (
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
              {demoOrders.length === 0 ? (
                <div className="bg-white dark:bg-[#1A1A1A] rounded-card p-8 text-center">
                  <p className="text-brand-gray mb-4">No orders yet.</p>
                  <Link to="/shop" className="inline-block bg-brand-orange hover:bg-brand-orange-hover text-white px-6 py-2.5 rounded-pill text-sm font-medium transition-colors">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                demoOrders.map(order => (
                  <div key={order.id} className="bg-white dark:bg-[#1A1A1A] rounded-card p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-brand-black dark:text-brand-offwhite">{order.id}</span>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-pill ${statusColor[order.status]}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-brand-gray">{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-brand-gray-light dark:border-[#2A2A2A]">
                      <span className="text-sm text-brand-gray">{order.items} item{order.items > 1 ? 's' : ''}</span>
                      <span className="font-mono font-bold text-brand-black dark:text-brand-offwhite">₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
              <p className="text-xs text-brand-gray text-center mt-2">Showing demo orders. Real order tracking will be available when payments are integrated.</p>
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
