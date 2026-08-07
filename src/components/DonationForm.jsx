import React, { useState, useEffect, useRef } from 'react';

const BLANK_FORM = {
  donorName: '',
  phone: '',
  foodName: '',
  quantity: '',
  category: 'Cooked Food',
  urgency: 'Medium',
  location: '',
  lat: null,
  lng: null,
  photo: '',
  notes: ''
};

const URGENCY_STYLES = {
  High: {
    active: 'bg-red-50 border-red-400 text-red-700 ring-2 ring-red-500/20',
    dot: 'bg-red-500'
  },
  Medium: {
    active: 'bg-amber-50 border-amber-400 text-amber-700 ring-2 ring-amber-500/20',
    dot: 'bg-amber-500'
  },
  Low: {
    active: 'bg-green-50 border-green-400 text-green-700 ring-2 ring-green-500/20',
    dot: 'bg-green-500'
  }
};

const LEAFLET_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
const LEAFLET_JS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-green-600/10 flex items-center justify-center shrink-0">
        <i className={`fa-solid ${icon} text-green-700 text-sm`}></i>
      </div>
      <div>
        <h4 className="text-base font-bold text-slate-900 leading-tight">{title}</h4>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function DonationForm({ onSave, editingDonation, setEditingDonation }) {
  const [formData, setFormData] = useState(BLANK_FORM);
  const [leafletReady, setLeafletReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingDonation) {
      setFormData({ ...BLANK_FORM, ...editingDonation });
    } else {
      setFormData(BLANK_FORM);
    }
  }, [editingDonation]);

  // Load Leaflet from CDN once
  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }
    if (!document.querySelector('link[data-leaflet]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      link.setAttribute('data-leaflet', 'true');
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[data-leaflet]')) {
      const script = document.createElement('script');
      script.src = LEAFLET_JS;
      script.setAttribute('data-leaflet', 'true');
      script.onload = () => setLeafletReady(true);
      document.body.appendChild(script);
    } else {
      const check = setInterval(() => {
        if (window.L) {
          setLeafletReady(true);
          clearInterval(check);
        }
      }, 200);
      return () => clearInterval(check);
    }
  }, []);

  // Initialize / update map whenever coordinates are available
  useEffect(() => {
    if (!leafletReady || formData.lat == null || formData.lng == null || !mapElRef.current) return;
    const L = window.L;
    const pos = [formData.lat, formData.lng];

    if (!mapRef.current) {
      mapRef.current = L.map(mapElRef.current, { scrollWheelZoom: false }).setView(pos, 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapRef.current);

      markerRef.current = L.marker(pos, { draggable: true }).addTo(mapRef.current);
      markerRef.current.on('dragend', () => {
        const p = markerRef.current.getLatLng();
        setFormData(prev => ({ ...prev, lat: p.lat, lng: p.lng }));
        reverseGeocode(p.lat, p.lng);
      });

      setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 150);
    } else {
      mapRef.current.setView(pos, 16);
      markerRef.current.setLatLng(pos);
    }
  }, [leafletReady, formData.lat, formData.lng]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, location: data.display_name }));
      }
    } catch (err) {
      // Address lookup failed silently; coordinates are still saved
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support location detection. Please enter the address manually.");
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
        reverseGeocode(latitude, longitude).finally(() => setLocating(false));
      },
      () => {
        setLocating(false);
        setLocationError('Could not detect your location. Please allow location access or type the address below.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const readPhotoFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, etc).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFormData(prev => ({ ...prev, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  const handlePhotoInput = (e) => readPhotoFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    readPhotoFile(e.dataTransfer.files[0]);
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.donorName || !formData.phone || !formData.foodName || !formData.quantity || !formData.location) {
      alert('Please fill out all required fields.');
      return;
    }
    onSave(formData);
    setFormData(BLANK_FORM);
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-white border border-slate-200 rounded-2xl shadow-lg mt-8 mb-8 animate-fadeUp">
      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
        <h3 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          {editingDonation ? <i className="fa-solid fa-pen-to-square text-green-600 mr-2"></i> : <i className="fa-solid fa-circle-plus text-green-600 mr-2"></i>}
          {editingDonation ? 'Edit Donation Details' : 'Register New Surplus Food Donation'}
        </h3>
        {editingDonation && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Editing
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Donor Info */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-6">
          <SectionHeader icon="fa-user" title="Donor Information" subtitle="Who can we reach out to?" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Full Name *</label>
              <input
                type="text"
                name="donorName"
                value={formData.donorName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Contact Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Food Details */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-6">
          <SectionHeader icon="fa-utensils" title="Food Details" subtitle="What are you donating, and how much?" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Food Item Name *</label>
              <input
                type="text"
                name="foodName"
                value={formData.foodName}
                onChange={handleChange}
                placeholder="e.g. Rice & Curry, Packaged Biscuits"
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Quantity (Approx Servings) *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g. 25"
                min="1"
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Food Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              >
                <option value="Cooked Food">Cooked Food (Hot Meals)</option>
                <option value="Packaged Goods">Packaged Goods (Long Shelf Life)</option>
                <option value="Fresh Produce">Fresh Produce (Fruits & Veggies)</option>
                <option value="Bakery">Bakery & Pastries</option>
                <option value="Dairy">Dairy Products</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Urgency Level</label>
              <div className="flex gap-2">
                {['High', 'Medium', 'Low'].map((level) => (
                  <label
                    key={level}
                    className={`flex-1 cursor-pointer select-none flex items-center justify-center gap-2 px-3 py-3 border rounded-xl text-sm font-semibold transition-all ${formData.urgency === level
                        ? URGENCY_STYLES[level].active
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={level}
                      checked={formData.urgency === level}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className={`w-2 h-2 rounded-full ${URGENCY_STYLES[level].dot}`}></span>
                    {level}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-6">
          <SectionHeader icon="fa-camera" title="Food Photo" subtitle="A photo helps recipients know what to expect (optional)" />

          {formData.photo ? (
            <div className="relative w-full max-w-sm">
              <img
                src={formData.photo}
                alt="Food preview"
                className="w-full h-56 object-cover rounded-xl border border-slate-200 shadow-sm"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-slate-900/70 text-white hover:bg-red-600 transition"
                aria-label="Remove photo"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>
          ) : (
            <label
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-2 w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${dragActive ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-white hover:border-green-400 hover:bg-green-50/40'
                }`}
            >
              <i className="fa-solid fa-cloud-arrow-up text-2xl text-green-600"></i>
              <p className="text-sm text-slate-600 font-medium">Click to upload or drag a photo here</p>
              <p className="text-xs text-slate-400">PNG or JPG</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoInput}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Location */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-6">
          <SectionHeader icon="fa-location-dot" title="Pickup Location" subtitle="Where should volunteers collect the food?" />

          <div className="flex flex-col gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. 123 Green Avenue, Sector 5"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="shrink-0 px-4 py-3 border border-green-200 bg-green-50 text-green-700 font-semibold rounded-xl hover:bg-green-100 active:scale-95 transition disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
              >
                {locating ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Locating...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-crosshairs"></i> Use current location
                  </>
                )}
              </button>
            </div>
            {locationError && (
              <p className="text-xs text-red-600 flex items-center gap-1.5">
                <i className="fa-solid fa-triangle-exclamation"></i> {locationError}
              </p>
            )}
            {formData.lat != null && !locationError && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <i className="fa-solid fa-check text-green-600"></i>
                Pinned at {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)} — drag the marker to fine-tune
              </p>
            )}
          </div>

          {formData.lat != null && (
            <div
              ref={mapElRef}
              className="w-full h-64 rounded-xl border border-slate-200 overflow-hidden shadow-sm"
              style={{ background: '#e5e7eb' }}
            >
              {!leafletReady && (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm gap-2">
                  <i className="fa-solid fa-spinner fa-spin"></i> Loading map...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-6">
          <SectionHeader icon="fa-note-sticky" title="Additional Notes" subtitle="Anything volunteers should know before pickup (optional)" />
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g. Please bring clean boxes for packaging. Food is hot."
            rows="3"
            className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all w-full"
          />
        </div>

        <div className="flex gap-4 justify-end pt-4 border-t border-slate-100">
          {editingDonation && (
            <button
              type="button"
              onClick={() => setEditingDonation(null)}
              className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl shadow-md hover:opacity-90 active:scale-95 transition"
          >
            {editingDonation ? 'Update Donation' : 'Submit Donation'}
          </button>
        </div>
      </form>
    </div>
  );
}