// src/contexts/AdminThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

export const DARK = {
  pageBg:      '#0D0D0D',
  surface:     '#111111',
  surface2:    '#1A1A1A',
  surface3:    '#0D0D0D',
  border:      '#1E1E1E',
  border2:     '#2A2A2A',
  border3:     '#151515',
  text:        '#F5F2EE',
  textSub:     '#8A8681',
  textMuted:   '#5A5651',
  textFaint:   '#3A3A3A',
  hover:       '#161616',
  shimmer:     '#1E1E1E',
  inputBg:     '#0D0D0D',
  inputBorder: '#2A2A2A',
  // Sidebar-specific
  sidebarBg:   '#0D0D0D',
  navLabel:    '#3A3A3A',
  navItem:     '#6A6661',
  navHover:    '#D0CDC8',
  bottomAction:'#4A4641',
  bottomHover: '#8A8681',
};

export const LIGHT = {
  pageBg:      '#F0F2F5',
  surface:     '#FFFFFF',
  surface2:    '#F5F5F5',
  surface3:    '#EAEAEA',
  border:      '#E5E5E5',
  border2:     '#CCCCCC',
  border3:     '#EBEBEB',
  text:        '#111111',
  textSub:     '#555555',
  textMuted:   '#777777',
  textFaint:   '#BBBBBB',
  hover:       '#F0F0F0',
  shimmer:     '#EEEEEE',
  inputBg:     '#F5F5F5',
  inputBorder: '#CCCCCC',
  // Sidebar-specific
  sidebarBg:   '#FFFFFF',
  navLabel:    '#AAAAAA',
  navItem:     '#666666',
  navHover:    '#111111',
  bottomAction:'#888888',
  bottomHover: '#444444',
};

const AdminThemeContext = createContext({ theme: 'dark', t: DARK, toggleTheme: () => {} });

export function AdminThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('adminTheme') ?? 'dark'
  );

  useEffect(() => {
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const t = theme === 'dark' ? DARK : LIGHT;

  return (
    <AdminThemeContext.Provider value={{ theme, t, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export const useAdminTheme = () => useContext(AdminThemeContext);
