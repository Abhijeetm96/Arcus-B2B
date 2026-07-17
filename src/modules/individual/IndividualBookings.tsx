import React, { useState } from 'react';
import { useBookings } from '../../core/hooks/useBookings';
import { formatDate } from '../../core/config/format';

export const IndividualBookings: React.FC = () => {
  const { bookings, loading } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center py-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const steps = [
    { label: 'Requested', status: 'Pending', desc: 'Booking received' },
    { label: 'Scheduled', status: 'Confirmed', desc: 'Service appointment confirmed' },
    { label: 'Partner Dispatched', status: 'Partner Dispatched', desc: 'Technician on the way' },
    { label: 'Completed', status: 'Completed', desc: 'Service fully completed' }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Confirmed': return 1;
      case 'Partner Dispatched': return 2;
      case 'Completed': return 3;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const currentStepIdx = selectedBooking ? getStepIndex(selectedBooking.status) : 0;
  const isCancelled = selectedBooking?.status === 'Cancelled';

  return (
    <div className="space-y-lg text-left">
      {selectedBooking ? (
        <div className="bg-white border border-slate-200 rounded p-lg shadow-sm space-y-md">
          <div className="flex justify-between items-center border-b border-slate-100 pb-sm">
            <button
              onClick={() => setSelectedBooking(null)}
              className="flex items-center gap-xs text-xs font-bold text-primary hover:underline bg-transparent border-none cursor-pointer p-0"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Bookings
            </button>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${getStatusColor(selectedBooking.status)}`}>
              {selectedBooking.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-xs">
            <div>
              <p className="font-bold text-secondary">Booking Reference</p>
              <p className="text-sm font-bold text-slate-800 mt-xs font-mono">{selectedBooking.id}</p>
            </div>
            <div>
              <p className="font-bold text-secondary">Requested On</p>
              <p className="text-sm font-bold text-slate-800 mt-xs">{formatDate(selectedBooking.timestamp)}</p>
            </div>
          </div>

          {/* Stepper tracking container */}
          <div className="bg-slate-50 border border-slate-200 rounded p-lg my-lg">
            <h4 className="text-xs font-bold text-slate-800 mb-lg uppercase tracking-wider">Service Tracking Status</h4>
            
            {isCancelled ? (
              <div className="flex items-center gap-md text-red-600 bg-red-50 border border-red-200 rounded p-md">
                <span className="material-symbols-outlined text-[24px]">cancel</span>
                <div>
                  <p className="text-xs font-bold">Booking Cancelled</p>
                  <p className="text-[10px] text-red-500">This service booking has been cancelled and will not be processed.</p>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col md:flex-row md:justify-between items-start md:items-center gap-lg md:gap-0 mt-md">
                {/* Horizontal line for desktop stepper */}
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-slate-200 hidden md:block z-0" />
                <div 
                  className="absolute left-0 top-4 h-0.5 bg-primary hidden md:block z-0 transition-all duration-500 ease-out" 
                  style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isActive = idx === currentStepIdx;

                  return (
                    <div key={idx} className="flex flex-row md:flex-col items-center gap-md md:gap-sm z-10 md:w-32 text-left md:text-center relative">
                      {/* Stepper Node */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted ? 'bg-primary border-primary text-slate-900 font-bold' :
                        isActive ? 'bg-white border-primary text-primary font-bold shadow-[0_0_12px_rgba(250,189,0,0.4)] animate-pulse' :
                        'bg-white border-slate-200 text-slate-400'
                      }`}>
                        {isCompleted ? (
                          <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                        ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                      </div>
                      
                      {/* Stepper Labels */}
                      <div>
                        <p className={`text-xs font-bold leading-tight ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                          {step.label}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5 leading-tight md:max-w-[100px] md:mx-auto">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details Card */}
          <div className="bg-white border border-slate-200 rounded p-md space-y-sm text-xs">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-xs mb-sm">Service details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
              <div>
                <p className="font-semibold text-slate-500">Service Category</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedBooking.serviceName}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">Preferred Appointment Date</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedBooking.date}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">Contact Person</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedBooking.name}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">Contact Number</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedBooking.phone}</p>
              </div>
            </div>
            {selectedBooking.notes && (
              <div className="pt-sm border-t border-slate-100 mt-sm">
                <p className="font-semibold text-slate-500">Special Instructions / Notes</p>
                <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{selectedBooking.notes}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-xl text-center text-slate-500">
              <span className="material-symbols-outlined text-[48px] text-slate-300">engineering</span>
              <p className="mt-sm text-sm">No service bookings found. Request technician appointments to build your history!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <th className="p-md">Booking ID</th>
                    <th className="p-md">Requested Date</th>
                    <th className="p-md">Service Name</th>
                    <th className="p-md">Scheduled Date</th>
                    <th className="p-md">Status</th>
                    <th className="p-md text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b: any) => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-md font-bold text-primary font-mono">{b.id}</td>
                      <td className="p-md text-slate-600">{formatDate(b.timestamp)}</td>
                      <td className="p-md text-slate-900 font-bold">{b.serviceName}</td>
                      <td className="p-md text-slate-700 font-semibold">{b.date}</td>
                      <td className="p-md">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${getStatusColor(b.status)}`}>
                          {b.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-md text-right">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-md py-1 border border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold rounded text-[10px] cursor-pointer"
                        >
                          View Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IndividualBookings;
