import React, { useState, useEffect, useRef } from 'react';

export default function LandingPage({ setCurrentView }) {
  const [emailText, setEmailText] = useState('');
  const [emailFeedback, setEmailFeedback] = useState('0 characters');
  const [emailFeedbackClass, setEmailFeedbackClass] = useState('text-slate-400');
  const [subscribed, setSubscribed] = useState(false);
  const [logoRotated, setLogoRotated] = useState(false);

  // Counter States
  const [mealsCount, setMealsCount] = useState(0);
  const [volunteersCount, setVolunteersCount] = useState(0);
  const [ngosCount, setNgosCount] = useState(0);

  // Refs for scroll reveal
  const revealsRef = useRef([]);

  useEffect(() => {
    // Scroll reveal observer
    const handleScroll = () => {
      revealsRef.current.forEach(el => {
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top < window.innerHeight - 100) {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once initially

    // Dynamic counters animation
    const animateCounter = (setter, target, duration = 1000) => {
      let startTime = null;
      const step = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setter(Math.floor(progress * target));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    animateCounter(setMealsCount, 500, 1500);
    animateCounter(setVolunteersCount, 50, 1500);
    animateCounter(setNgosCount, 20, 1500);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmailText(value);
    const len = value.length;

    let feedback = `${len} characters`;
    if (len > 0 && !value.includes('@')) {
      setEmailFeedbackClass('text-red-400 text-xs mt-1');
      feedback += ' - Missing @';
    } else if (value.includes('@')) {
      setEmailFeedbackClass('text-green-400 text-xs mt-1');
    } else {
      setEmailFeedbackClass('text-slate-400 text-xs mt-1');
    }
    setEmailFeedback(feedback);
  };

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmailText('');
      setEmailFeedback('0 characters');
      setEmailFeedbackClass('text-slate-400 text-xs mt-1');
    }, 3000);
  };

  const handleLogoDoubleClick = () => {
    setLogoRotated(!logoRotated);
  };

  const handleDonateHeroClick = (e) => {
    e.preventDefault();
    // Play audio alert if available
    const audio = document.getElementById('notifyAudio');
    if (audio) {
      audio.play().catch(() => { });
    }
    setTimeout(() => {
      setCurrentView('donor');
    }, 1000);
  };

  // Add elements to reveal array
  const addToReveals = (el) => {
    if (el && !revealsRef.current.includes(el)) {
      revealsRef.current.push(el);
    }
  };

  return (
    <>
      <audio id="notifyAudio">
        <source src="assets/audio/notification.mp3" type="audio/mpeg" />
      </audio>

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0">
            <video
              id="heroVideo"
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="src/assets/poverty.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(110deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.50) 55%, rgba(0,0,0,0.15) 100%)' }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-28 flex flex-col lg:flex-row items-center gap-14 w-full">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block border border-green-400/60 text-green-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(22,163,74,0.18)' }}>
              Fighting Hunger Through Technology
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Rescue Food.<br />
              <span style={{ background: 'linear-gradient(90deg,#4ade80,#86efac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Feed Lives.</span>
            </h1>
            <p className="text-slate-300 text-xl mt-6 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              FeedTheNeed connects surplus food from restaurants, hotels, and households with NGOs and communities in need — reducing waste and fighting hunger.
            </p>
            <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
              <a
                href="#donor"
                onClick={handleDonateHeroClick}
                className="text-white font-bold px-8 py-4 rounded-xl text-sm shadow-lg transition-all duration-200 bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90 active:scale-95"
              >
                Donate Food
              </a>
              <a
                href="#solution"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-2 border-white/40 text-white px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-white/10"
              >
                How It Works ↓
              </a>
            </div>

            <div className="mt-12 p-5 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
              <p className="text-white/80 text-sm leading-relaxed">
                🌱 <span className="font-semibold text-white">Currently active in Bangalore.</span> We are a growing initiative — every donation, every volunteer, and every partner organisation brings us closer to a hunger-free city.
              </p>
            </div>
          </div>

          {/* Why It Matters card */}
          <div ref={addToReveals} className="reveal flex-1 w-full max-w-sm">
            <div className="rounded-2xl p-6 space-y-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Why It Matters</p>
              <div className="why-row flex items-start gap-4 p-4 rounded-xl cursor-default transition-transform duration-200 hover:translate-x-1" style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(74,222,128,0.25)' }}>
                <span className="text-2xl">🍽️</span>
                <div>
                  <p className="text-sm font-bold text-white">Every donation feeds a family</p>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">A single restaurant's surplus can provide a full meal to 10–30 people who would otherwise go hungry.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl cursor-default transition-transform duration-200 hover:translate-x-1" style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(147,197,253,0.25)' }}>
                <span className="text-2xl"><i className="fa-solid fa-clock"></i></span>
                <div>
                  <p className="text-sm font-bold text-white">Food rescued in under 60 minutes</p>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">From listing to pickup, our volunteer network ensures edible food never goes to waste.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl cursor-default transition-transform duration-200 hover:translate-x-1" style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(252,211,77,0.25)' }}>
                <span className="text-2xl"><i className="fa-solid fa-globe"></i></span>
                <div>
                  <p className="text-sm font-bold text-white">Less waste, less CO₂</p>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">Food waste produces methane — 25× more potent than CO₂. Rescuing food protects the planet.</p>
                </div>
              </div>
              <a
                href="#solution"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block text-center text-white font-semibold py-3 rounded-xl text-sm transition-opacity duration-200 hover:opacity-90 bg-gradient-to-r from-green-600 to-green-500"
              >
                See How It Works ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      <main>
        {/* PROBLEM */}
        <section id="problem" ref={addToReveals} className="reveal py-0 overflow-hidden">
          <div className="py-16 text-center" style={{ background: 'linear-gradient(135deg,#fef2f2 0%,#fff7ed 100%)' }}>
            <span className="bg-red-100 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">The Problem</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>A World of Contrast</h2>
            <p className="text-slate-600 max-w-xl mx-auto mt-4 text-lg">While millions of meals are wasted every day, countless people struggle to access nutritious food.</p>
          </div>

          <div className="grid md:grid-cols-2 min-h-[24rem]">
            <div className="problem-panel relative overflow-hidden min-h-[20rem] group">
              <img src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=900&q=80" alt="Food waste" className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 transition-opacity duration-500" style={{ background: 'linear-gradient(180deg,rgba(220,38,38,0.15) 0%,rgba(0,0,0,0.85) 100%)' }}></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="text-red-300 text-xs font-bold uppercase tracking-wider">The Waste Side</span>
                <h3 className="text-2xl font-black text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>1.3 Billion Tons Wasted</h3>
                <p className="text-slate-300 text-sm mt-2 leading-relaxed max-w-sm">Restaurants, hotels, and events discard large quantities of perfectly edible food daily.</p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(220,38,38,0.25)', border: '1px solid rgba(252,165,165,0.3)' }}>
                    <p className="text-2xl font-black text-red-300">33%</p>
                    <p className="text-xs text-slate-400 mt-1">of global food production wasted</p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(220,38,38,0.25)', border: '1px solid rgba(252,165,165,0.3)' }}>
                    <p className="text-2xl font-black text-red-300">₹92K Cr</p>
                    <p className="text-xs text-slate-400 mt-1">wasted in India annually</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="problem-panel relative overflow-hidden min-h-[20rem] group">
              <img src="https://images.unsplash.com/photo-1547489432-cf93fa6c71ee?w=900&q=80" alt="Hunger" className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 transition-opacity duration-500" style={{ background: 'linear-gradient(180deg,rgba(161,98,7,0.1) 0%,rgba(0,0,0,0.88) 100%)' }}></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">The Hunger Side</span>
                <h3 className="text-2xl font-black text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>820 Million Go Hungry</h3>
                <p className="text-slate-300 text-sm mt-2 leading-relaxed max-w-sm">Many communities face hunger despite the abundance of food around us. This is a logistics problem, not a supply problem.</p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(161,98,7,0.3)', border: '1px solid rgba(252,211,77,0.3)' }}>
                    <p className="text-2xl font-black text-amber-300">194M</p>
                    <p className="text-xs text-slate-400 mt-1">undernourished in India</p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(161,98,7,0.3)', border: '1px solid rgba(252,211,77,0.3)' }}>
                    <p className="text-2xl font-black text-amber-300">1 in 9</p>
                    <p className="text-xs text-slate-400 mt-1">people sleep hungry globally</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="py-10 text-center" style={{ background: 'linear-gradient(135deg,#fef2f2 0%,#fff7ed 100%)' }}>
            <p className="text-2xl md:text-3xl font-black text-slate-900">Food exists. <span style={{ background: 'linear-gradient(90deg,#16a34a,#22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Distribution is the problem.</span></p>
          </div>
        </section>

        {/* SOLUTION */}
        <section id="solution" ref={addToReveals} className="reveal py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="bg-green-100 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">Our Solution</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>How FeedTheNeed Works</h2>
              <p className="text-slate-500 max-w-xl mx-auto mt-4 text-lg">A simple, efficient process that ensures surplus food reaches those who need it most.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group bg-white border border-slate-200 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-100 hover:border-green-300 cursor-default">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}><i className="fas fa-utensils"></i></div>
                <span className="text-white text-xs font-bold px-3 py-1 rounded-full inline-block transition-transform duration-300 group-hover:scale-105 bg-gradient-to-r from-green-600 to-green-500">Step 01</span>
                <h3 className="text-lg font-black text-slate-900 mt-3">Donor Lists Food</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">Restaurants, hotels, and households upload surplus food — type, quantity, and pickup window.</p>
              </div>
              <div className="group bg-white border border-slate-200 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-100 hover:border-green-300 cursor-default">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' }}><i className="fas fa-bell"></i></div>
                <span className="text-white text-xs font-bold px-3 py-1 rounded-full inline-block transition-transform duration-300 group-hover:scale-105 bg-gradient-to-r from-green-600 to-green-500">Step 02</span>
                <h3 className="text-lg font-black text-slate-900 mt-3">NGOs Get Notified</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">Nearby NGOs and volunteers receive instant alerts and claim donations in real time.</p>
              </div>
              <div className="group bg-white border border-slate-200 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-100 hover:border-green-300 cursor-default">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: 'linear-gradient(135deg,#fef9c3,#fde68a)' }}><i className="fas fa-truck"></i></div>
                <span className="text-white text-xs font-bold px-3 py-1 rounded-full inline-block transition-transform duration-300 group-hover:scale-105 bg-gradient-to-r from-green-600 to-green-500">Step 03</span>
                <h3 className="text-lg font-black text-slate-900 mt-3">Food is Collected</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">Volunteers pick up and transport verified food safely to distribution centres.</p>
              </div>
              <div className="group bg-white border border-slate-200 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-100 hover:border-green-300 cursor-default">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: 'linear-gradient(135deg,#fce7f3,#fbcfe8)' }}><i className="fas fa-heart"></i></div>
                <span className="text-white text-xs font-bold px-3 py-1 rounded-full inline-block transition-transform duration-300 group-hover:scale-105 bg-gradient-to-r from-green-600 to-green-500">Step 04</span>
                <h3 className="text-lg font-black text-slate-900 mt-3">Communities Fed</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">Meals reach shelters, orphanages, and families — tracked and verified end-to-end.</p>
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE BANNER */}
        <section ref={addToReveals} className="reveal py-0 overflow-hidden">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&q=80" alt="Food waste" className="w-full h-72 object-cover" />
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(90deg,rgba(0,0,0,0.72),rgba(0,0,0,0.45))' }}>
              <div className="text-center px-6 max-w-3xl">
                <p className="text-white text-3xl md:text-4xl font-black leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  "Roughly <span style={{ background: 'linear-gradient(90deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>one-third</span> of all food produced globally is lost or wasted each year."
                </p>
                <p className="text-slate-400 text-sm mt-4">— United Nations Food and Agriculture Organization (FAO)</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" ref={addToReveals} className="reveal py-24" style={{ background: 'linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%)' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="bg-green-100 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">Features</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>Built to Rescue Food</h2>
              <p className="text-slate-600 max-w-xl mx-auto mt-4 text-lg">A complete ecosystem connecting donors, NGOs, volunteers, and communities.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group bg-white rounded-2xl border border-green-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-100 hover:border-green-300 cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" style={{ background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}><i className="fas fa-bell"></i></div>
                <h3 className="text-lg font-black text-slate-900">Real-Time Alerts</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">Instant notifications help NGOs respond quickly before food spoils. Every second counts.</p>
              </div>
              <div className="group bg-white rounded-2xl border border-green-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-100 hover:border-green-300 cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" style={{ background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' }}><i className="fas fa-box-open"></i></div>
                <h3 className="text-lg font-black text-slate-900">Food Listings</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">Donors register surplus food with type, quantity, photos, and ideal pickup window.</p>
              </div>
              <div className="group bg-white rounded-2xl border border-green-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-100 hover:border-green-300 cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" style={{ background: 'linear-gradient(135deg,#fce7f3,#fbcfe8)' }}><i className="fas fa-handshake"></i></div>
                <h3 className="text-lg font-black text-slate-900">NGO Collaboration</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">Partner organisations coordinate food collection through a shared, real-time dashboard.</p>
              </div>
              <div className="group bg-white rounded-2xl border border-green-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-100 hover:border-green-300 cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" style={{ background: 'linear-gradient(135deg,#fef9c3,#fde68a)' }}><i className="fas fa-truck-fast"></i></div>
                <h3 className="text-lg font-black text-slate-900">Volunteer Network</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">Volunteers assist in collecting and delivering donated food — tracked from pickup to drop.</p>
              </div>
              <div className="group bg-white rounded-2xl border border-green-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-100 hover:border-green-300 cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" style={{ background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)' }}><i className="fas fa-location-dot"></i></div>
                <h3 className="text-lg font-black text-slate-900">Location Matching</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">Donors and NGOs are geo-matched for the fastest possible redistribution routes.</p>
              </div>
              <div className="group bg-white rounded-2xl border border-green-100 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-100 hover:border-green-300 cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" style={{ background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}><i className="fas fa-chart-line"></i></div>
                <h3 className="text-lg font-black text-slate-900">Impact Tracking</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">Monitor meals saved, families helped, and community impact with live analytics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* IMPACT */}
        <section id="impact" ref={addToReveals} className="reveal py-0">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1600&q=80" alt="Volunteers distributing food" className="w-full h-72 object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(0,0,0,0.68) 0%,rgba(0,0,0,0.3) 100%)' }}></div>
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20">
              <span className="border border-green-400/40 text-green-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full w-fit mb-4" style={{ background: 'rgba(22,163,74,0.2)' }}>Impact</span>
              <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Community Impact</h2>
              <p className="text-slate-300 mt-2 max-w-lg">FeedTheNeed is building toward measurable change — one rescued meal at a time.</p>
            </div>
          </div>

          <div className="py-16" style={{ background: 'linear-gradient(135deg,#ffffff 0%,#f0fdf4 100%)' }}>
            <div className="max-w-6xl mx-auto px-6">
              <div ref={addToReveals} className="reveal grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                <div className="group rounded-2xl p-6 border border-green-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-green-100 cursor-default" style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-2">Our Goal</p>
                  <p className="text-3xl font-black text-green-700">Zero Waste</p>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">Every kg of edible food that would otherwise be discarded should reach a plate, not a landfill.</p>
                </div>
                <div ref={addToReveals} className="reveal group rounded-2xl p-6 border border-blue-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-100 cursor-default" style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)' }}>
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Current Reach</p>
                  <p className="text-3xl font-black text-blue-700">Bangalore</p>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">Active in Bangalore with a growing network of donor restaurants, NGO partners, and volunteers.</p>
                </div>
                <div className="group rounded-2xl p-6 border border-amber-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-amber-100 cursor-default" style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)' }}>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Always</p>
                  <p className="text-3xl font-black text-amber-700">Free</p>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">FeedTheNeed is entirely free for NGOs, volunteers, and beneficiary communities — always.</p>
                </div>
              </div>

              <div ref={addToReveals} className="reveal grid md:grid-cols-3 gap-6">
                <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <div className="overflow-hidden h-44">
                    <img src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80" alt="Shelter" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-black text-slate-900">Shelters & Orphanages</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">Children and shelter residents receive nutritious meals that would have otherwise been discarded — giving dignity to the most vulnerable.</p>
                    <div className="mt-4 rounded-xl p-3 text-center border border-green-100" style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}>
                      <p className="text-sm font-black text-green-700">Primary Beneficiary</p>
                      <p className="text-xs text-slate-500 mt-1">Every rescued meal goes here first</p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <div className="overflow-hidden h-44">
                    <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80" alt="Food waste reduction" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-black text-slate-900">Reduced Food Waste</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">India wastes ₹92,000 crore worth of food every year. FeedTheNeed intercepts surplus food before it reaches the bin, cutting emissions and saving value.</p>
                    <div className="mt-4 rounded-xl p-3 text-center border border-blue-100" style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)' }}>
                      <p className="text-sm font-black text-blue-700">~2.5 kg CO₂ saved</p>
                      <p className="text-xs text-slate-500 mt-1">per kilogram of food rescued</p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <div className="overflow-hidden h-44">
                    <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80" alt="NGO support" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-black text-slate-900">Empowering NGOs</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">NGOs spend less time sourcing food and more time serving communities. Our platform removes logistics barriers so they focus on what matters.</p>
                    <div className="mt-4 rounded-xl p-3 text-center border border-amber-100" style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)' }}>
                      <p className="text-sm font-black text-amber-700">Zero Cost</p>
                      <p className="text-xs text-slate-500 mt-1">to NGOs and beneficiaries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div ref={addToReveals} className="reveal mt-12 bg-white rounded-2xl shadow-lg border border-slate-200 p-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 text-center">
              <div className="py-4">
                <h3 className="text-5xl font-black text-green-600">{mealsCount}</h3>
                <p className="text-slate-500 font-medium mt-2">Meals Rescued</p>
              </div>
              <div className="py-4 border-y md:border-y-0 md:border-x border-slate-200">
                <h3 className="text-5xl font-black text-blue-600">{volunteersCount}</h3>
                <p className="text-slate-500 font-medium mt-2">Volunteers</p>
              </div>
              <div className="py-4">
                <h3 className="text-5xl font-black text-orange-600">{ngosCount}</h3>
                <p className="text-slate-500 font-medium mt-2">Partner NGOs</p>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" ref={addToReveals} className="reveal py-24" style={{ background: 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)' }}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="border border-green-400/40 text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full" style={{ background: 'rgba(22,163,74,0.15)' }}>About</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>About FeedTheNeed</h2>
            </div>

            <div className="rounded-2xl border border-white/10 p-8 md:p-12" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}>
              <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
                <p className="text-base">FeedTheNeed is a food rescue and redistribution platform designed to reduce food waste while addressing hunger in local communities. The platform connects food donors, volunteers, and NGOs through a simple and efficient process.</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-xl p-5 border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-green-500/30" style={{ background: 'rgba(22,163,74,0.1)' }}>
                    <h3 className="text-sm font-black text-white mb-2">🎯 Mission</h3>
                    <p className="text-slate-400 text-sm">To minimise food waste and ensure that surplus food reaches communities facing hunger through technology-powered logistics.</p>
                  </div>
                  <div className="rounded-xl p-5 border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30" style={{ background: 'rgba(59,130,246,0.1)' }}>
                    <h3 className="text-sm font-black text-white mb-2">🔭 Vision</h3>
                    <p className="text-slate-400 text-sm">A future where no edible food is wasted and every individual has access to nutritious meals — regardless of geography or circumstance.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-white mb-3">Key Benefits</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}><i className="fas fa-check"></i></span>Reduces food waste at the source</li>
                    <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}><i className="fas fa-check"></i></span>Supports NGOs and volunteer networks at zero cost</li>
                    <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}><i className="fas fa-check"></i></span>Improves food accessibility for vulnerable communities</li>
                    <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}><i className="fas fa-check"></i></span>Creates measurable, trackable social impact</li>
                    <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}><i className="fas fa-check"></i></span>Encourages sustainable, community-driven solutions</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-5 py-2 rounded-r-xl" style={{ background: 'rgba(22,163,74,0.1)' }}>
                  <p className="text-green-300 font-medium italic">"Every meal saved is an opportunity to feed someone in need."</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
                <span className="text-green-300 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/30 transition-colors duration-200 hover:bg-green-500/20 cursor-default" style={{ background: 'rgba(22,163,74,0.15)' }}>Sustainability</span>
                <span className="text-green-300 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/30 transition-colors duration-200 hover:bg-green-500/20 cursor-default" style={{ background: 'rgba(22,163,74,0.15)' }}>Community</span>
                <span className="text-green-300 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/30 transition-colors duration-200 hover:bg-green-500/20 cursor-default" style={{ background: 'rgba(22,163,74,0.15)' }}>Technology</span>
                <span className="text-green-300 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/30 transition-colors duration-200 hover:bg-green-500/20 cursor-default" style={{ background: 'rgba(22,163,74,0.15)' }}>Social Impact</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-black text-white mb-5">
                <i className="ml-4 fa-solid fa-globe"></i> Supporting UN Sustainable Development Goals
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl p-5 border border-white/10" style={{ background: 'rgba(220,38,38,0.15)' }}>
                  <h4 className="font-bold text-white">SDG 2: Zero Hunger</h4>
                  <p className="text-slate-400 text-sm mt-2">FeedTheNeed helps provide nutritious meals to vulnerable communities by redistributing surplus food instead of letting it go to waste.</p>
                </div>
                <div className="rounded-xl p-5 border border-white/10" style={{ background: 'rgba(245,158,11,0.15)' }}>
                  <h4 className="font-bold text-white">SDG 12: Responsible Consumption & Production</h4>
                  <p className="text-slate-400 text-sm mt-2">By rescuing edible food from restaurants, events, and households, we reduce unnecessary food waste and encourage sustainable consumption.</p>
                </div>
                <div className="rounded-xl p-5 border border-white/10" style={{ background: 'rgba(34,197,94,0.15)' }}>
                  <h4 className="font-bold text-white">SDG 13: Climate Action</h4>
                  <p className="text-slate-400 text-sm mt-2">Reducing food waste lowers methane emissions from landfills, helping combat climate change and protect the environment.</p>
                </div>
                <div className="rounded-xl p-5 border border-white/10" style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <h4 className="font-bold text-white">SDG 17: Partnerships for the Goals</h4>
                  <p className="text-slate-400 text-sm mt-2">FeedTheNeed brings together donors, NGOs, volunteers, and communities to create a collaborative solution for hunger and food waste.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" ref={addToReveals} className="reveal relative py-24 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1593113616828-6f22bca04804?w=1600&q=80" alt="Volunteers packing food" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(5,46,22,0.93) 0%,rgba(20,83,45,0.88) 100%)' }}></div>

          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <span className="border border-green-400/40 text-green-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full" style={{ background: 'rgba(22,163,74,0.2)' }}>Join The Movement</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-5" style={{ fontFamily: "'Playfair Display', serif" }}>Every Meal Matters</h2>
            <p className="text-green-200 text-lg mt-4 max-w-xl mx-auto">
              Join FeedTheNeed in reducing food waste and helping communities access nutritious meals across India.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="#donor"
                onClick={(e) => { e.preventDefault(); setCurrentView('donor'); }}
                className="inline-block text-center text-green-700 font-bold px-8 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-900/50 bg-gradient-to-r from-white to-green-50"
              >
                Donate Food
              </a>
              <a
                href="#volunteer"
                onClick={(e) => { e.preventDefault(); setCurrentView('volunteer'); }}
                className="inline-block text-center border-2 border-white/50 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 hover:bg-white/10 hover:-translate-y-1"
              >
                Become a Volunteer
              </a>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-6 text-green-200 text-sm">
              <span>📧 mcornelius019@gmail.com</span>
              <span>📞 +91 7204576141</span>
              <span>📍 Bangalore, India</span>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="assets/images/logo.png"
                  alt="FeedTheNeed Logo"
                  className={`w-17 h-16 object-contain drop-shadow-md cursor-pointer transition-transform duration-500 ${logoRotated ? 'rotate-180' : ''}`}
                  onDoubleClick={handleLogoDoubleClick}
                  title="Double click me!"
                />
                <p className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>FeedTheNeed</p>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">Connecting surplus food with communities in need through technology.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li><span onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-green-400 transition-colors duration-200 cursor-pointer">Home</span></li>
                <li><span onClick={() => { setCurrentView('home'); setTimeout(() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-green-400 transition-colors duration-200 cursor-pointer">The Problem</span></li>
                <li><span onClick={() => { setCurrentView('home'); setTimeout(() => document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-green-400 transition-colors duration-200 cursor-pointer">How It Works</span></li>
                <li><span onClick={() => { setCurrentView('home'); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-green-400 transition-colors duration-200 cursor-pointer">Features</span></li>
                <li><span onClick={() => { setCurrentView('home'); setTimeout(() => document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-green-400 transition-colors duration-200 cursor-pointer">Impact</span></li>
                <li><span onClick={() => { setCurrentView('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-green-400 transition-colors duration-200 cursor-pointer">About</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wide">Contact</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li>mcornelius019@gmail.com</li>
                <li>+91 7204576141</li>
                <li>Bangalore, Karnataka, India</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wide">Follow Us</h4>
              <ul className="space-y-2 text-sm mb-6 flex gap-4">
                <li><a href="https://www.linkedin.com/in/michael-pereira-347b8a34b/" className="text-slate-500 hover:text-green-400 transition-colors duration-200 text-xl"><i className="fab fa-linkedin"></i></a></li>
                <li><a href="https://github.com/michael-cornelius720" className="text-slate-500 hover:text-green-400 transition-colors duration-200 text-xl"><i className="fab fa-github"></i></a></li>
              </ul>
              <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wide">Newsletter</h4>
              <form id="newsletterForm" onSubmit={handleSubscribeSubmit} className="space-y-3">
                <div>
                  <input
                    type="email"
                    id="emailInput"
                    value={emailText}
                    onChange={handleEmailChange}
                    placeholder="Email address"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none transition-colors duration-300"
                    required
                  />
                  <p id="emailFeedback" className={emailFeedbackClass}>{emailFeedback}</p>
                </div>
                <button
                  type="submit"
                  id="subscribeBtn"
                  className={`w-full text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${subscribed ? 'bg-slate-600' : 'bg-green-600'}`}
                >
                  {subscribed ? 'Done!' : 'Subscribe'}
                </button>
              </form>
              {subscribed && <p id="formSuccess" className="text-green-400 text-sm mt-2 animate-fadeIn">Subscribed successfully!</p>}
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-slate-600 text-sm">
            <p>© 2026 FeedTheNeed. All Rights Reserved.</p>
            <p>Built to fight hunger.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
