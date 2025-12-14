import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NovelService } from '../services/novelService';
import { AppContext } from '../App';
import { Info, Copy, Check, Loader2 } from 'lucide-react';
import { SpringCard, FadeIn, ScaleButton, BlurIn } from '../components/Anim';
import { SiteSettings } from '../types';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const s = await NovelService.getSiteSettings();
      setSettings(s);
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const from = location.state?.from || '/';

    try {
        if (isLogin) {
            const user = await NovelService.login(email, password);
            if (user) {
                login(user, rememberMe);
                navigate(from, { replace: true });
            }
        } else {
            if (password.length < 6) {
                setError("Password must be at least 6 characters long.");
                setIsLoading(false);
                return;
            }
            const newUser = await NovelService.signup(username, email, password);
            login(newUser, true);
            navigate(from, { replace: true });
        }
    } catch (err: any) {
        setError(err.response?.data?.msg || err.message || "Authentication failed");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <SpringCard className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
            <BlurIn className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </BlurIn>
            <FadeIn delay={0.2} className="text-slate-500 dark:text-slate-400">
                Enter the world of endless stories.
            </FadeIn>
        </div>

            <FadeIn delay={0.3} className="mb-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-start mb-2">
                    <Info size={18} className="text-indigo-600 dark:text-indigo-400 mr-2 mt-0.5" />
                    <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-200">Demo Testing Accounts</h3>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-indigo-100 dark:border-slate-700">
                    <div>
                        <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Admin Role</span>
                        <div className="font-mono text-slate-800 dark:text-slate-300 text-xs">admin@novelverse.com</div>
                    </div>
                    <button onClick={() => { setEmail('admin@novelverse.com'); setPassword('admin'); setIsLogin(true); }} className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded hover:bg-indigo-200 transition-colors font-medium">
                        Use Admin Account
                    </button>
                    </div>
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-indigo-100 dark:border-slate-700">
                    <div>
                        <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Reader Role</span>
                        <div className="font-mono text-slate-800 dark:text-slate-300 text-xs">reader@novelverse.com</div>
                    </div>
                    <button onClick={() => { setEmail('reader@novelverse.com'); setPassword('user'); setIsLogin(true); }} className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded hover:bg-indigo-200 transition-colors font-medium">
                        Use Reader Account
                    </button>
                    </div>
                </div>
            </FadeIn>

        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm animate-bounce">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
                <FadeIn delay={0.4}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                    <input 
                        type="text" required 
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        value={username} onChange={e => setUsername(e.target.value)}
                    />
                </FadeIn>
            )}
            <FadeIn delay={isLogin ? 0.4 : 0.5}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input 
                    type="email" required 
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    value={email} onChange={e => setEmail(e.target.value)}
                />
            </FadeIn>
            <FadeIn delay={isLogin ? 0.5 : 0.6}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input 
                    type="password" required 
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    value={password} onChange={e => setPassword(e.target.value)}
                />
            </FadeIn>
            
            {isLogin && (
                <FadeIn delay={0.55} className="flex items-center">
                    <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                        Remember me
                    </label>
                </FadeIn>
            )}

            <FadeIn delay={isLogin ? 0.6 : 0.7}>
                <ScaleButton type="submit" disabled={isLoading} className={`w-full bg-primary hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    {isLoading ? (
                        <><Loader2 size={20} className="mr-2 animate-spin" /> {isLogin ? 'Signing In...' : 'Creating Account...'}</>
                    ) : (
                        isLogin ? 'Sign In' : 'Sign Up'
                    )}
                </ScaleButton>
            </FadeIn>
        </form>

        <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-slate-500 hover:text-primary transition-colors">
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
        </div>
      </SpringCard>
    </div>
  );
};