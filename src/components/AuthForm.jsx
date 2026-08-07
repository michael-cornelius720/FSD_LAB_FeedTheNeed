import React, { useState } from 'react';

export default function AuthForm({ onLoginSuccess, onCancel }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'donor',
    name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isRegister 
      ? 'http://localhost:5001/api/auth/register' 
      : 'http://localhost:5001/api/auth/login';

    const payload = isRegister 
      ? formData 
      : { username: formData.username, password: formData.password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        if (isRegister) {
          // Auto login on successful registration
          setIsRegister(false);
          setFormData(prev => ({ ...prev, password: '' }));
          setError('Registration successful! Please login with your details.');
        } else {
          onLoginSuccess(data);
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-slate-100 rounded-3xl p-8 shadow-2xl relative animate-slideUp">
        {onCancel && (
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        )}

        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isRegister ? 'Join FeedTheNeed' : 'Welcome Back'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {isRegister ? 'Register as a Donor or Volunteer to start saving lives' : 'Access your role-based dashboard'}
          </p>
        </div>

        {error && (
          <div className={`p-4 rounded-xl text-sm mb-6 ${error.includes('successful') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            <i className="fa-solid fa-circle-info mr-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Phone Number *</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 99999 88888"
                  className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">I want to be a *</label>
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
                >
                  <option value="donor">Donor (Individual / Restaurant / Store)</option>
                  <option value="volunteer">Volunteer (Courier / Driver / Rescuer)</option>
                </select>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Username *</label>
            <input 
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Password *</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90 active:scale-95 text-white font-bold rounded-xl shadow-md transition disabled:opacity-60 text-sm mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Processing...
              </>
            ) : (
              isRegister ? 'Register Account' : 'Login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-6">
          <button 
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs font-semibold text-green-600 hover:text-green-700 transition"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
