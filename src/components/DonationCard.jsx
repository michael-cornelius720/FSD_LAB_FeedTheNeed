import React from 'react';

export default function DonationCard({ donation, onEdit, onDelete, onStatusChange }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 bg-green-50 text-green-700 border-green-200">
            <i className="fa-solid fa-check-double"></i> Delivered
          </span>
        );
      case 'packed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 bg-blue-50 text-blue-700 border-blue-200">
            <i className="fa-solid fa-box"></i> Packed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border-yellow-200">
            <i className="fa-solid fa-clock"></i> Pending
          </span>
        );
    }
  };

  const getUrgencyIndicator = (urgency) => {
    switch (urgency) {
      case 'High':
        return <span className="text-red-500 font-bold text-xs"><i className="fa-solid fa-triangle-exclamation mr-1"></i> High Urgency</span>;
      case 'Low':
        return <span className="text-slate-400 text-xs"><i className="fa-solid fa-info-circle mr-1"></i> Low Urgency</span>;
      default:
        return <span className="text-amber-500 text-xs"><i className="fa-solid fa-circle-exclamation mr-1"></i> Medium Urgency</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-green-600"></div>
      
      <div>
        <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3 gap-3">
          <div className="font-bold text-slate-800 text-lg leading-tight">{donation.foodName}</div>
          {getStatusBadge(donation.status)}
        </div>

        <div className="text-sm text-slate-600 space-y-2 mb-6">
          <div className="flex items-center gap-2"><i className="fa-solid fa-tag text-green-600 w-4"></i> <span><strong>Category:</strong> {donation.category}</span></div>
          <div className="flex items-center gap-2"><i className="fa-solid fa-user text-green-600 w-4"></i> <span><strong>Donor:</strong> {donation.donorName}</span></div>
          <div className="flex items-center gap-2"><i className="fa-solid fa-phone text-green-600 w-4"></i> <span><strong>Phone:</strong> {donation.phone}</span></div>
          <div className="flex items-center gap-2"><i className="fa-solid fa-people-group text-green-600 w-4"></i> <span><strong>Servings:</strong> {donation.quantity} servings</span></div>
          <div className="flex items-center gap-2"><i className="fa-solid fa-location-dot text-green-600 w-4"></i> <span><strong>Address:</strong> {donation.location}</span></div>
          {donation.notes && (
            <div className="flex items-start gap-2 pt-1 border-t border-slate-50 mt-1">
              <i className="fa-solid fa-clipboard-list text-green-600 w-4 mt-0.5"></i>
              <span className="text-xs text-slate-500"><strong>Notes:</strong> {donation.notes}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
        {getUrgencyIndicator(donation.urgency)}
        
        <div className="flex gap-2">
          {donation.status === 'pending' && (
            <button 
              onClick={() => onStatusChange(donation.id, 'packed')}
              className="text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-100 transition"
            >
              Mark Packed
            </button>
          )}
          {donation.status === 'packed' && (
            <button 
              onClick={() => onStatusChange(donation.id, 'completed')}
              className="text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-100 transition"
            >
              Mark Delivered
            </button>
          )}

          <button 
            onClick={() => onEdit(donation)} 
            className="p-1.5 text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition w-8 h-8 flex items-center justify-center"
            title="Edit"
          >
            <i className="fa-solid fa-pen text-xs"></i>
          </button>
          <button 
            onClick={() => onDelete(donation.id)} 
            className="p-1.5 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition w-8 h-8 flex items-center justify-center"
            title="Delete"
          >
            <i className="fa-solid fa-trash text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
