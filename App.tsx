import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Browse } from './pages/Browse';
import { NovelDetail } from './pages/NovelDetail';
import { Reader } from './pages/Reader';
import { Stories } from './pages/Stories';
import { Auth } from './pages/Auth';
import { Admin } from './pages/Admin';
import { UserProfile } from './pages/UserProfile';
import { About, Contact, Terms, Privacy } from './pages/StaticPages';
import { NovelService } from './services/novelService';
import { User } from './types';
import { LoadingOverlay } from './components/LoadingOverlay';

// Context for global state
export const AppContext = React.createContext<{
  user: User | null;
  login: (u: User, remember?: boolean) => void;
  logout: () => void;
  refreshUser: () => void;
  theme: 'light' | 'dark' | 'sepia';
  setTheme: (t: 'light' | 'dark' | 'sepia') => void;
  siteSettings: any;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  refreshUser: () => {},
  theme: 'light',
  setTheme: () => {},
  siteSettings: {},
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
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const user = await NovelService.loadUser();
                setUser(user);
            } catch (err) {
                console.error("Auth failed", err);
                localStorage.removeItem('token');
            }
        }
        
        try {
            const settings = await NovelService.getSiteSettings();
            setSiteSettings(settings);
            if (settings.theme === 'unique') {
                document.documentElement.classList.add('theme-unique');
                setTheme('dark');
            } else {
                document.documentElement.classList.remove('theme-unique');
            }
        } catch (e) {
            console.error("Failed to load settings", e);
        }

        setLoading(false);
    };
    initAuth();

    const storedTheme = localStorage.getItem('nv_theme') as 'light' | 'dark' | 'sepia';
    if (storedTheme) setTheme(storedTheme);
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
    // Token is already handled by NovelService.login/signup
  };

  const logout = () => {
    NovelService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
        const updated = await NovelService.loadUser();
        setUser(updated);
    } catch (e) {
        console.error("Failed to refresh user", e);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <AppContext.Provider value={{ user, login, logout, refreshUser, theme, setTheme, siteSettings }}>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="browse/:type" element={<Browse />} />
            <Route path="stories/:category" element={<Stories />} />
            <Route path="novel/:id" element={<NovelDetail />} />
            <Route path="read/:novelId/:chapterId" element={<Reader />} />
            <Route path="auth" element={<Auth />} />
            <Route path="profile" element={user ? <UserProfile /> : <Navigate to="/auth" />} />
            <Route path="admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
}