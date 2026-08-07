import React, { useState } from 'react';
import DonationCard from './DonationCard';

export default function DonationList({ donations, onEdit, onDelete, onStatusChange, filters, onFilterChange, onViewDetails }) {
  const [searchTerm, setSearchTerm] = useState('');

  const categoryFilter = filters?.category || 'All';
  const statusFilter = filters?.status || 'All';
  const urgencyFilter = filters?.urgency || 'All';

  const handleFilterChange = (key, value) => {
    if (onFilterChange) {
      onFilterChange(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const filteredDonations = donations.filter(d => {
    const matchesSearch = 
      d.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location.toLowerCase().includes(searchTerm.toLowerCase());

    // Category, Status, Urgency are now filtered at the backend,
    // but we keep a local fallback check just in case.
    const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'All' || d.urgency === urgencyFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesUrgency;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 animate-fadeUp">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-black text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          <i className="fa-solid fa-clock-rotate-left text-green-600 mr-2"></i> Recent Food Donations
        </h2>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <i className="fa-solid fa-magnifying-glass text-xs"></i>
            </span>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search food, donor, location..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all w-52 md:w-64"
            />
          </div>

          <select 
            value={categoryFilter}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-green-500 bg-white"
          >
            <option value="All">All Categories</option>
            <option value="Cooked Food">Cooked Food</option>
            <option value="Packaged Goods">Packaged Goods</option>
            <option value="Fresh Produce">Fresh Produce</option>
            <option value="Bakery">Bakery</option>
            <option value="Dairy">Dairy</option>
            <option value="Other">Other</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-green-500 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="packed">Packed</option>
            <option value="completed">Delivered</option>
          </select>

          <select 
            value={urgencyFilter}
            onChange={(e) => handleFilterChange('urgency', e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-green-500 bg-white"
          >
            <option value="All">All Urgency</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {filteredDonations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map(donation => (
            <DonationCard 
              key={donation.id}
              donation={donation}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
          <i className="fa-solid fa-seedling text-5xl mb-4 text-green-300 animate-pulse"></i>
          <h3 className="text-xl font-bold text-slate-700">No donations found</h3>
          <p className="text-sm mt-1">Try adjusting your filters or add a new donation listing.</p>
        </div>
      )}
    </div>
  );
}

