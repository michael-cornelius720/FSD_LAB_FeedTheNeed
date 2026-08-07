import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import DonationForm from './components/DonationForm';
import DonationList from './components/DonationList';
import AuthForm from './components/AuthForm';
import NgoDashboard from './components/NgoDashboard';

function App() {
  const [donations, setDonations] = useState([]);
  const [editingDonation, setEditingDonation] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const API_URL = 'http://localhost:5001/api/donations';

  // Load user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('ftn_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        // Direct users to their portal automatically
        if (parsed.role === 'ngo') setCurrentView('ngo');
        else if (parsed.role === 'volunteer') setCurrentView('volunteer');
        else if (parsed.role === 'donor') setCurrentView('donor');
      } catch (e) {
        localStorage.removeItem('ftn_user');
      }
    }
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setDonations(data);
      } else {
        console.error('Failed to fetch donations from server');
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const showNotification = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // CRUD Operations
  const handleSaveDonation = async (formData) => {
    const payload = {
      ...formData,
      donorId: currentUser?.id || null
    };

    if (editingDonation) {
      const updatedPayload = { 
        ...editingDonation, 
        ...payload, 
        submittedAt: new Date().toISOString() 
      };
      try {
        const response = await fetch(`${API_URL}/${editingDonation.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedPayload),
        });

        if (response.ok) {
          fetchDonations();
          setEditingDonation(null);
          showNotification('Donation details updated successfully!');
        } else {
          showNotification('Error updating donation.');
        }
      } catch (error) {
        console.error('Error updating donation:', error);
        showNotification('Error connecting to server.');
      }
    } else {
      const newDonation = {
        ...payload,
        id: 'ftn_' + Date.now(),
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newDonation),
        });

        if (response.ok) {
          fetchDonations();
          showNotification('Surplus donation registered successfully!');
        } else {
          showNotification('Error registering donation.');
        }
      } catch (error) {
        console.error('Error saving donation:', error);
        showNotification('Error connecting to server.');
      }
    }
  };

  const handleDeleteDonation = async (id) => {
    if (window.confirm('Are you sure you want to cancel this donation request?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchDonations();
          showNotification('Donation removed.');
        } else {
          showNotification('Error removing donation.');
        }
      } catch (error) {
        console.error('Error deleting donation:', error);
        showNotification('Error connecting to server.');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchDonations();
        showNotification(`Status updated to ${newStatus}!`);
      } else {
        showNotification('Error updating status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Error connecting to server.');
    }
  };

  const handleEditClick = (donation) => {
    setEditingDonation(donation);
    setCurrentView('donor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('ftn_user', JSON.stringify(user));
    setShowAuthModal(false);
    showNotification(`Logged in successfully as ${user.name}!`);

    // Redirect depending on role
    if (user.role === 'ngo') {
      setCurrentView('ngo');
    } else if (user.role === 'volunteer') {
      setCurrentView('volunteer');
    } else {
      setCurrentView('donor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ftn_user');
    setCurrentUser(null);
    setCurrentView('home');
    showNotification('Logged out successfully.');
  };

  // Filter volunteer list so volunteers only see what is assigned to them
  const volunteerDonations = donations.filter(d => d.assignedVolunteerId === currentUser?.id);

  // Filter donor list so donors only see their submissions
  const donorDonations = currentUser 
    ? donations.filter(d => d.donorId === currentUser.id)
    : donations;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuthModal(true)}
      />

      <div>
        {currentView === 'home' && (
          <LandingPage setCurrentView={(view) => {
            if (!currentUser && (view === 'donor' || view === 'volunteer')) {
              setShowAuthModal(true);
            } else {
              setCurrentView(view);
            }
          }} />
        )}

        {currentView === 'donor' && (
          <div className="py-8 bg-slate-50">
            <section className="relative overflow-hidden px-6 py-12 border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50 mb-8">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-green-100 border border-green-200 text-green-700 px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
                    <i className="fa-solid fa-leaf"></i> Donor Portal
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Surplus Donation Dashboard
                  </h1>
                  <p className="text-slate-600 max-w-lg mt-2 text-sm">
                    Submit food donations and manage active requests.
                  </p>
                </div>
              </div>
            </section>

            <DonationForm 
              onSave={handleSaveDonation} 
              editingDonation={editingDonation} 
              setEditingDonation={setEditingDonation}
            />

            <div className="max-w-6xl mx-auto px-6 mt-12 mb-4">
              <h3 className="text-xl font-bold text-slate-800">Your Donation Submissions</h3>
              <p className="text-xs text-slate-500 mt-1">Listing donations registered under your account</p>
            </div>

            <DonationList 
              donations={donorDonations} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteDonation}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

        {currentView === 'volunteer' && (
          <div className="py-8 bg-slate-50">
            <section className="relative overflow-hidden px-6 py-12 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 mb-8">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-blue-100 border border-blue-200 text-blue-700 px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
                    <i className="fa-solid fa-people-carry-box"></i> Volunteer Portal
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Active Rescue Operations
                  </h1>
                  <p className="text-slate-600 max-w-lg mt-2 text-sm">
                    Review pending donations, mark them packed, and confirm deliveries.
                  </p>
                </div>
              </div>
            </section>

            <div className="max-w-6xl mx-auto px-6 mb-4">
              <h3 className="text-xl font-bold text-slate-800">Assigned Rescue Deliveries ({volunteerDonations.length})</h3>
              <p className="text-xs text-slate-500 mt-1">Task items assigned to you by NGO administration</p>
            </div>

            <DonationList 
              donations={volunteerDonations} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteDonation}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

        {currentView === 'ngo' && (
          <div className="py-8 bg-slate-50">
            <section className="relative overflow-hidden px-6 py-12 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50 mb-8">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-purple-100 border border-purple-200 text-purple-700 px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
                    <i className="fa-solid fa-building-shield"></i> NGO Portal
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Administrative Console
                  </h1>
                  <p className="text-slate-600 max-w-lg mt-2 text-sm">
                    Manage food rescue tasks, register users, and assign volunteer drivers.
                  </p>
                </div>
              </div>
            </section>

            <NgoDashboard 
              donations={donations} 
              onStatusChange={handleStatusChange} 
              onDelete={handleDeleteDonation}
            />
          </div>
        )}
      </div>

      {showAuthModal && (
        <AuthForm 
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setShowAuthModal(false)}
        />
      )}

      {/* Toast notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-slideUp">
          <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-lg px-6 py-4 flex items-center gap-3">
            <i className="fa-solid fa-circle-check text-green-600 text-lg"></i>
            <span className="text-sm font-semibold text-slate-800">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
