
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Browse } from './pages/Browse';
import { NovelDetail } from './pages/NovelDetail';
import { Reader } from './pages/Reader';
import { Auth } from './pages/Auth';
import { Admin } from './pages/Admin';
import { UserProfile } from './pages/UserProfile';
import { MockBackendService } from './services/mockBackend';
import { User } from './types';

// Context for global state
export const AppContext = React.createContext<{
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  refreshUser: () => void;
  theme: 'light' | 'dark' | 'sepia';
  setTheme: (t: 'light' | 'dark' | 'sepia') => void;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  refreshUser: () => {},
  theme: 'light',
  setTheme: () => {},
});

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize DB and check session
    MockBackendService.init();
    const storedUser = localStorage.getItem('nv_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const storedTheme = localStorage.getItem('nv_theme') as 'light' | 'dark' | 'sepia';
    if (storedTheme) setTheme(storedTheme);
    setLoading(false);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('nv_theme', theme);
  }, [theme]);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('nv_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nv_user');
  };

  const refreshUser = () => {
    if (!user) return;
    const updated = MockBackendService.getUser(user.id);
    if (updated) {
      setUser(updated);
      localStorage.setItem('nv_user', JSON.stringify(updated));
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <AppContext.Provider value={{ user, login, logout, refreshUser, theme, setTheme }}>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="browse/:type" element={<Browse />} />
            <Route path="novel/:id" element={<NovelDetail />} />
            <Route path="read/:novelId/:chapterId" element={<Reader />} />
            <Route path="auth" element={<Auth />} />
            <Route path="profile" element={user ? <UserProfile /> : <Navigate to="/auth" />} />
            <Route path="admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
}
