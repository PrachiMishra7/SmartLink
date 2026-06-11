import React, { useState, useEffect } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [useAi, setUseAi] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if(data.email) setCurrentUser(data);
      })
      .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', authEmail);
      formData.append('password', authPassword);
      
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      if(!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      
      const meRes = await fetch(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      const meData = await meRes.json();
      setCurrentUser(meData);
      setIsLoginModalOpen(false);
    } catch(err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword, name: authName })
      });
      if(!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Signup failed");
      }
      setIsSignUpModalOpen(false);
      setIsLoginModalOpen(true); // switch to login modal
    } catch(err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const handleShorten = async () => {
    if (!url) return;
    setIsLoading(true);
    setError(null);
    setShortUrl(null);

    try {
      const token = localStorage.getItem('token');
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/urls/shorten`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ original_url: url, use_ai: useAi }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to shorten URL');
      }

      const data = await response.json();
      setShortUrl(`${API_URL}/${data.short_code}`);
      setUrl(''); // clear input on success
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (shortUrl) {
      await navigator.clipboard.writeText(shortUrl);
      // Could add a toast notification here
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary-900/20 to-transparent -z-10 pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      
      {/* Navigation */}
      <header className="px-6 py-4 flex justify-between items-center max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-500/30">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Smart<span className="text-primary-500">Link</span></span>
        </div>
        <nav className="flex gap-4 items-center">
          {currentUser ? (
            <>
              <span className="text-sm font-medium text-gray-300">Welcome, {currentUser.name}</span>
              <button onClick={handleLogout} className="text-sm font-medium bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded-lg transition-all border border-red-500/30">
                Log Out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setIsLoginModalOpen(true); setAuthError(''); }} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log In</button>
              <button onClick={() => { setIsSignUpModalOpen(true); setAuthError(''); }} className="text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40">
                Sign Up
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto w-full pt-12 pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-medium mb-8 animate-float">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>
          AI-Powered URL Shortening is here
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Intelligent Links for a <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-300">Smarter Web</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
          More than just a URL shortener. Generate AI-powered semantic slugs, detect malicious links, and track deep analytics all in one platform.
        </p>

        {/* Shortener Box */}
        <div className="w-full max-w-3xl glass-panel p-2 rounded-2xl flex flex-col sm:flex-row gap-2 items-center transition-all focus-within:ring-2 focus-within:ring-primary-500/50">
          <div className="flex-1 flex items-center px-4 w-full h-14">
            <svg className="w-6 h-6 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            <input 
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
              placeholder="Paste your long URL here..." 
              className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 h-full text-lg"
              disabled={isLoading}
            />
          </div>
          <button 
            onClick={handleShorten}
            disabled={isLoading || !url}
            className="w-full sm:w-auto h-14 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-2 px-8 rounded-xl transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 group whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                Shorten Now
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </>
            )}
          </button>
        </div>
        
        {/* AI Toggle */}
        <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-sm">
          <input 
            type="checkbox" 
            id="useAi" 
            checked={useAi} 
            onChange={(e) => setUseAi(e.target.checked)}
            className="w-4 h-4 rounded border-gray-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-gray-900 bg-gray-800"
          />
          <label htmlFor="useAi" className="cursor-pointer select-none">
            ✨ Use AI to generate a readable link
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 w-full max-w-3xl flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Success Result */}
        {shortUrl && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-full max-w-3xl flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex flex-col items-start truncate">
              <span className="text-emerald-400 text-xs font-medium mb-1">Your shortened URL is ready!</span>
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-white font-medium text-lg truncate hover:underline hover:text-primary-400 transition-colors">
                {shortUrl}
              </a>
            </div>
            <button 
              onClick={handleCopy}
              className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors flex items-center gap-2 group"
              title="Copy to clipboard"
            >
              <svg className="w-5 h-5 group-active:scale-95 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <span className="hidden sm:block text-sm font-medium">Copy</span>
            </button>
          </div>
        )}
        
        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full">
          <div className="p-6 rounded-2xl glass-panel text-left flex flex-col gap-3 group hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-lg font-semibold text-white">AI Slugs</h3>
            <p className="text-gray-400 text-sm">Automatically generate readable, SEO-friendly short links using advanced AI.</p>
          </div>
          
          <div className="p-6 rounded-2xl glass-panel text-left flex flex-col gap-3 group hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Deep Analytics</h3>
            <p className="text-gray-400 text-sm">Track clicks, devices, browsers, and geographic locations in real-time.</p>
          </div>
          
          <div className="p-6 rounded-2xl glass-panel text-left flex flex-col gap-3 group hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Threat Detection</h3>
            <p className="text-gray-400 text-sm">Built-in VirusTotal integration blocks phishing and malicious URLs instantly.</p>
          </div>
        </div>
      </main>

      {/* Auth Modals */}
      {(isLoginModalOpen || isSignUpModalOpen) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => { setIsLoginModalOpen(false); setIsSignUpModalOpen(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">
              {isLoginModalOpen ? 'Log In to SmartLink' : 'Create an Account'}
            </h2>
            
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={isLoginModalOpen ? handleLogin : handleSignup} className="flex flex-col gap-4">
              {isSignUpModalOpen && (
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              )}
              <input
                type="email"
                placeholder="Email Address"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <button 
                type="submit"
                disabled={isAuthLoading}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-xl transition-all mt-2 disabled:opacity-50"
              >
                {isAuthLoading ? 'Please wait...' : (isLoginModalOpen ? 'Log In' : 'Sign Up')}
              </button>
            </form>
            
            <p className="mt-6 text-center text-sm text-gray-400">
              {isLoginModalOpen ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setIsLoginModalOpen(!isLoginModalOpen);
                  setIsSignUpModalOpen(!isSignUpModalOpen);
                  setAuthError('');
                }}
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                {isLoginModalOpen ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
