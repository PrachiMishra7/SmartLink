import React, { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');

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
          <button className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log In</button>
          <button className="text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40">
            Sign Up
          </button>
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
              placeholder="Paste your long URL here..." 
              className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 h-full text-lg"
            />
          </div>
          <button className="w-full sm:w-auto h-14 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-2 px-8 rounded-xl transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 group whitespace-nowrap">
            Shorten Now
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
        
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
    </div>
  );
}

export default App;
