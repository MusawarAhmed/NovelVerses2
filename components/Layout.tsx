
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, User, Sun, Moon, LogOut, ShieldCheck, Coins, Search as SearchIcon, Trophy, Compass, PenTool } from 'lucide-react';
import { AppContext } from '../App';
import { MockBackendService } from '../services/mockBackend';
import { Novel } from '../types';

export const Layout: React.FC = () => {
  const { user, logout, theme, setTheme } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isReader = location.pathname.includes('/read/');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Novel[]>([]);
  
  // Dropdown States
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions
  useEffect(() => {
    if (searchQuery.length > 0) {
      const allNovels = MockBackendService.getNovels();
      const filtered = allNovels.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5)); // Limit to 5
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className={`sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 mr-6">
                <div className="bg-primary w-8 h-8 rounded flex items-center justify-center text-white font-bold">
                  N
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white hidden sm:block">NovelVerse</span>
              </Link>
              <div className="hidden md:flex md:space-x-6">
                <Link to="/browse/all" className="flex items-center text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  <Compass size={16} className="mr-1.5"/> Browse
                </Link>
                <Link to="/browse/rankings" className="flex items-center text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  <Trophy size={16} className="mr-1.5"/> Rankings
                </Link>
                {user?.role === 'admin' && (
                   <Link to="/admin" className="flex items-center text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                    <PenTool size={16} className="mr-1.5"/> Create
                  </Link>
                )}
              </div>
            </div>

            {/* Search Bar with Dropdown */}
            <div className="flex-1 max-w-md mx-4 hidden sm:flex items-center relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon size={16} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-full leading-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                />
              </form>

              {/* Autocomplete Dropdown */}
              {showSearchDropdown && searchQuery && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                  {suggestions.length > 0 ? (
                    <ul>
                      {suggestions.map((novel) => (
                        <li key={novel.id}>
                          <Link 
                            to={`/novel/${novel.id}`} 
                            onClick={() => setShowSearchDropdown(false)}
                            className="flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <img src={novel.coverUrl} alt={novel.title} className="w-8 h-12 object-cover rounded-sm mr-3" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{novel.title}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{novel.author}</div>
                            </div>
                          </Link>
                        </li>
                      ))}
                      <li className="border-t border-slate-100 dark:border-slate-700">
                        <button 
                          onClick={(e) => handleSearchSubmit(e as any)}
                          className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-slate-50 dark:hover:bg-slate-700 font-medium flex items-center justify-center"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </li>
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      No novels found.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search Button */}
              <button 
                className="sm:hidden p-2 text-slate-500" 
                onClick={() => {
                  const q = prompt("Search novels:");
                  if(q) navigate(`/search?q=${encodeURIComponent(q)}`);
                }}
              >
                <SearchIcon size={20} />
              </button>

              <Link to="/profile" className="hidden sm:flex text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white">
                 <div className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <BookOpen size={20} />
                 </div>
              </Link>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-white transition-colors focus:outline-none"
                  >
                     <div className="w-8 h-8 bg-indigo-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-primary dark:text-slate-200 ring-2 ring-transparent hover:ring-primary/50 transition-all">
                      {user.username[0].toUpperCase()}
                    </div>
                  </button>
                  
                  {/* Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 transform origin-top-right z-50">
                      <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 border-b dark:border-slate-700">
                        Signed in as <br/> <span className="font-bold text-slate-900 dark:text-white">{user.username}</span>
                        <div className="flex items-center mt-1 text-yellow-600 dark:text-yellow-400 font-bold"><Coins size={12} className="mr-1"/> {user.coins}</div>
                      </div>
                      {user.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <div className="flex items-center"><ShieldCheck size={16} className="mr-2"/> Admin Panel</div>
                        </Link>
                      )}
                      <Link 
                        to="/profile" 
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                         <div className="flex items-center"><User size={16} className="mr-2"/> Profile</div>
                      </Link>
                      <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <div className="flex items-center"><LogOut size={16} className="mr-2"/> Sign out</div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-primary hover:bg-indigo-700 shadow-sm transition-colors">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Outlet />
      </main>

      {!isReader && (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-12 pb-8">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
                 <div className="bg-primary w-8 h-8 rounded flex items-center justify-center text-white font-bold">
                  N
                </div>
                <span className="font-bold text-xl text-slate-900 dark:text-white">NovelVerse</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
                <Link to="/" className="hover:text-primary">About</Link>
                <Link to="/" className="hover:text-primary">Contact</Link>
                <Link to="/" className="hover:text-primary">Terms of Service</Link>
                <Link to="/" className="hover:text-primary">Privacy Policy</Link>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 dark:text-slate-600 text-xs mt-8">
            <p>&copy; {new Date().getFullYear()} NovelVerse. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
};
