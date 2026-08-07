import React, { useState, useEffect } from 'react';

export default function NgoDashboard({ donations, onStatusChange, onDelete }) {
  const [volunteers, setVolunteers] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assigningDonation, setAssigningDonation] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [activeTab, setActiveTab] = useState('donations'); // 'donations' | 'users'

  // Fetch volunteers and users
  useEffect(() => {
    fetchVolunteers();
    fetchUsers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/volunteers');
      if (res.ok) {
        const data = await res.json();
        setVolunteers(data);
      }
    } catch (e) {
      console.error('Error fetching volunteers:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };

  const handleAssignVolunteer = async () => {
    if (!assigningDonation || !selectedVolunteer) return;
    try {
      const res = await fetch(`http://localhost:5001/api/donations/${assigningDonation.id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedVolunteerId: selectedVolunteer })
      });
      if (res.ok) {
        setAssigningDonation(null);
        setSelectedVolunteer('');
        // Trigger parent state update
        onStatusChange(assigningDonation.id, 'pending');
      }
    } catch (e) {
      console.error('Error assigning volunteer:', e);
    }
  };

  // Compute stats
  const totalDonations = donations.length;
  const pendingDonations = donations.filter(d => d.status === 'pending').length;
  const completedDonations = donations.filter(d => d.status === 'completed').length;

  // Filtered donations
  const filteredDonations = donations.filter(d => {
    const matchesSearch = 
      d.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl font-bold shrink-0">
            <i className="fa-solid fa-box-open"></i>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Rescue Tasks</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{totalDonations}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl font-bold shrink-0">
            <i className="fa-solid fa-hourglass-half"></i>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Pending Assignment/Rescue</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{pendingDonations}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold shrink-0">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Rescues Completed</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{completedDonations}</h4>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('donations')}
          className={`pb-3 font-bold text-sm transition-all ${activeTab === 'donations' ? 'border-b-2 border-green-600 text-green-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          All Donations
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 font-bold text-sm transition-all ${activeTab === 'users' ? 'border-b-2 border-green-600 text-green-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Registered Donors & Volunteers ({users.length})
        </button>
      </div>

      {activeTab === 'donations' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-slate-900">Donations Overview</h3>

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
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all w-52 md:w-64 bg-white"
                />
              </div>

              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
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
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-green-500 bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="packed">Packed</option>
                <option value="completed">Delivered</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-xs border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Food / Category</th>
                    <th className="px-6 py-4">Donor Name</th>
                    <th className="px-6 py-4">Pickup Location</th>
                    <th className="px-6 py-4">Assigned Rescuer</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{d.foodName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{d.category} (Qty: {d.quantity})</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{d.donorRealName || d.donorName}</div>
                        <div className="text-xs text-slate-500">{d.phone}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate" title={d.location}>
                        {d.location}
                      </td>
                      <td className="px-6 py-4">
                        {d.volunteerName ? (
                          <div>
                            <span className="font-semibold text-slate-800">{d.volunteerName}</span>
                            <div className="text-xs text-slate-500">{d.volunteerPhone}</div>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${
                          d.status === 'completed' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : d.status === 'packed' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {d.status === 'completed' ? 'Delivered' : d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setAssigningDonation(d)}
                            className="px-3 py-1.5 bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 font-semibold rounded-lg text-xs transition"
                          >
                            Assign Volunteer
                          </button>
                          <button
                            onClick={() => onDelete(d.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition"
                            title="Cancel donation"
                          >
                            <i className="fa-solid fa-trash-can text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDonations.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-400">
                        No donation items found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Users List Tab */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-xs border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Contact Phone</th>
                  <th className="px-6 py-4">System Role</th>
                  <th className="px-6 py-4">Unique User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {u.name}
                      <span className="block text-xs text-slate-400 font-normal">@{u.username}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{u.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                        u.role === 'volunteer' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{u.id}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-400">
                      No registered donors or volunteers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {assigningDonation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-6 shadow-2xl animate-slideUp">
            <h3 className="text-lg font-black text-slate-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Assign Volunteer to Donation
            </h3>
            
            <p className="text-xs text-slate-500 mb-4">
              Selecting a volunteer for <strong>{assigningDonation.foodName}</strong> by <strong>{assigningDonation.donorRealName || assigningDonation.donorName}</strong>.
            </p>

            <div className="flex flex-col gap-2 mb-6">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Available Volunteers</label>
              <select
                value={selectedVolunteer}
                onChange={(e) => setSelectedVolunteer(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
              >
                <option value="">-- Choose Volunteer --</option>
                {volunteers.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => { setAssigningDonation(null); setSelectedVolunteer(''); }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignVolunteer}
                disabled={!selectedVolunteer}
                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg text-sm shadow-md hover:bg-green-700 active:scale-95 transition disabled:opacity-60"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
