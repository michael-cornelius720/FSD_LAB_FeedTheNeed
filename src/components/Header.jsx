import React, { useState } from 'react';

export default function Header({ currentView, setCurrentView, currentUser, onLogout, onLoginClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view, sectionId) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    if (sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header id="header" className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <span onClick={() => handleNavClick('home')} className="flex items-center gap-3 cursor-pointer">
          <img
            src="src/assets/Logo.png"
            alt="FeedTheNeed Logo"
            className="w-17 h-16 object-contain drop-shadow-md"
          />
          <div>
            <p className="text-lg font-black text-slate-900 leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>FeedTheNeed</p>
            <p className="text-green-600 text-xs font-semibold tracking-wide">Rescue Food. Feed Lives.</p>
          </div>
        </span>

        <nav className="hidden md:flex items-center gap-6">
          <span onClick={() => handleNavClick('home', 'home')} className="text-slate-600 font-medium text-sm hover:text-green-600 cursor-pointer">Home</span>
          
          {(!currentUser || currentUser.role === 'donor') && (
            <>
              <span onClick={() => handleNavClick('home', 'problem')} className="text-slate-600 font-medium text-sm hover:text-green-600 cursor-pointer">Problem</span>
              <span onClick={() => handleNavClick('home', 'solution')} className="text-slate-600 font-medium text-sm hover:text-green-600 cursor-pointer">Solution</span>
              <span onClick={() => handleNavClick('home', 'features')} className="text-slate-600 font-medium text-sm hover:text-green-600 cursor-pointer">Features</span>
            </>
          )}

          {currentUser?.role === 'ngo' && (
            <span onClick={() => handleNavClick('ngo')} className={`font-medium text-sm cursor-pointer ${currentView === 'ngo' ? 'text-green-600 font-bold' : 'text-slate-600 hover:text-green-600'}`}>NGO Dashboard</span>
          )}

          {(!currentUser || currentUser.role === 'volunteer') && (
            <span onClick={() => handleNavClick('volunteer')} className={`font-medium text-sm cursor-pointer ${currentView === 'volunteer' ? 'text-green-600 font-bold' : 'text-slate-600 hover:text-green-600'}`}>Volunteer Portal</span>
          )}

          {(!currentUser || currentUser.role === 'donor') && (
            <span onClick={() => handleNavClick('donor')} className="text-white font-semibold px-5 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity cursor-pointer" style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>Donate Food</span>
          )}

          {currentUser ? (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{currentUser.role}</p>
              </div>
              <button 
                onClick={onLogout}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="px-4 py-2 border border-green-600 text-green-600 font-semibold rounded-lg text-sm hover:bg-green-50 transition-colors"
            >
              Sign In
            </button>
          )}
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600"
        >
          {!mobileMenuOpen ? (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div id="mob-menu" className="md:hidden bg-white border-t border-slate-100 animate-fadeDown">
          <nav className="flex flex-col px-6 py-4 gap-4 text-slate-700 text-sm font-medium">
            <span onClick={() => handleNavClick('home', 'home')} className="cursor-pointer">Home</span>
            
            {currentUser?.role === 'ngo' && (
              <span onClick={() => handleNavClick('ngo')} className="cursor-pointer">NGO Dashboard</span>
            )}
            
            {(!currentUser || currentUser.role === 'volunteer') && (
              <span onClick={() => handleNavClick('volunteer')} className="cursor-pointer">Volunteer Portal</span>
            )}

            {(!currentUser || currentUser.role === 'donor') && (
              <span onClick={() => handleNavClick('donor')} className="bg-green-600 text-white text-center py-2.5 rounded-lg font-semibold cursor-pointer">Donate Food</span>
            )}

            {currentUser ? (
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                <p className="text-xs font-bold text-slate-800">{currentUser.name} ({currentUser.role})</p>
                <button 
                  onClick={onLogout}
                  className="w-full text-center py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="w-full text-center py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg font-semibold text-sm transition"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
