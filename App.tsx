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
  login: (u: User, remember?: boolean) => void;
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
    
    // Check LocalStorage (Persistent) first
    let storedUserStr = localStorage.getItem('nv_user');
    let isPersistent = true;
    
    // If not in Local, check SessionStorage (Temporary/Tab only)
    if (!storedUserStr) {
      storedUserStr = sessionStorage.getItem('nv_user');
      isPersistent = false;
    }

    if (storedUserStr) {
      try {
        const sessionUser = JSON.parse(storedUserStr);
        // CRITICAL FIX: Fetch the LATEST user data from the 'database' using the ID.
        // The stored session string might be stale (missing recent purchases/history).
        const freshUser = MockBackendService.getUser(sessionUser.id);
        
        if (freshUser) {
          setUser(freshUser);
          // Update the session storage with the fresh data to keep them in sync
          if (isPersistent) {
            localStorage.setItem('nv_user', JSON.stringify(freshUser));
          } else {
            sessionStorage.setItem('nv_user', JSON.stringify(freshUser));
          }
        } else {
          // User ID found in session but not in DB (deleted user?) -> Logout
          setUser(null);
          localStorage.removeItem('nv_user');
          sessionStorage.removeItem('nv_user');
        }
      } catch (e) {
        console.error("Failed to parse session user", e);
        localStorage.removeItem('nv_user');
        sessionStorage.removeItem('nv_user');
      }
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

  const login = (u: User, remember: boolean = false) => {
    setUser(u);
    if (remember) {
      localStorage.setItem('nv_user', JSON.stringify(u));
      sessionStorage.removeItem('nv_user'); // Clear session to avoid duplicates
    } else {
      sessionStorage.setItem('nv_user', JSON.stringify(u));
      localStorage.removeItem('nv_user'); // Clear local to ensure privacy
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nv_user');
    sessionStorage.removeItem('nv_user');
  };

  const refreshUser = () => {
    if (!user) return;
    const updated = MockBackendService.getUser(user.id);
    if (updated) {
      setUser(updated);
      // Update the specific storage being used based on where it currently exists
      if (localStorage.getItem('nv_user')) {
        localStorage.setItem('nv_user', JSON.stringify(updated));
      } else {
        sessionStorage.setItem('nv_user', JSON.stringify(updated));
      }
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