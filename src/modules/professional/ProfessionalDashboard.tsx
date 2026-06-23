import React, { useState } from 'react';
import { ProfessionalLayout } from './layouts/ProfessionalLayout';
import { useAuth } from '../../context/AuthContext';

export const ProfessionalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');

  const renderOverview = () => {
    return (
      <div className="space-y-lg text-left">
        {/* Banner */}
        <div className="bg-[#1a1c1c] text-white p-xl rounded-3xl relative overflow-hidden flex flex-col justify-center min-h-[140px] shadow-md">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[#FFC107]/10 skew-x-12 translate-x-1/3 pointer-events-none"></div>
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-[#FFC107] text-[40px]">handyman</span>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Professional Service Desk</h2>
              <p className="text-[#FFC107] text-xs font-bold font-label-caps uppercase tracking-widest mt-0.5">Manage details and work history</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="bg-[#FFFDF5] border border-[#FFC107]/20 p-md rounded-2xl">
            <span className="material-symbols-outlined text-[#FFC107] text-[32px]">star</span>
            <p className="text-[24px] font-bold text-[#FFC107] mt-2">4.9 / 5.0</p>
            <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">Client Rating</p>
          </div>
          <div className="bg-white border border-slate-200 p-md rounded-2xl shadow-sm">
            <span className="material-symbols-outlined text-[#FFC107] text-[32px]">construction</span>
            <p className="text-[24px] font-bold text-[#0A0A0A] mt-2">{user?.experience || '10+'} Years</p>
            <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">Experience</p>
          </div>
          <div className="bg-white border border-slate-200 p-md rounded-2xl shadow-sm">
            <span className="material-symbols-outlined text-[#FFC107] text-[32px]">verified</span>
            <p className="text-[20px] font-bold text-green-700 mt-2">ARCUS Verified</p>
            <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">Trust Badge</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="border border-slate-200 rounded-2xl p-lg space-y-md bg-white shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">badge</span> Professional Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-xs">
            <p><span className="font-bold text-secondary">Specialization:</span> {user?.serviceCategory || 'General Contractor'}</p>
            <p><span className="font-bold text-secondary">City:</span> {user?.city || 'Bengaluru'}, {user?.state || 'Karnataka'}</p>
            <p><span className="font-bold text-secondary">Website:</span> {user?.website || 'N/A'}</p>
            <p><span className="font-bold text-secondary">Portfolio URL:</span> {user?.portfolioUrl || 'N/A'}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'profile':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm text-left space-y-md text-xs">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-sm">Professional Profile</h3>
            <p><span className="font-bold text-secondary">Name:</span> {user?.name}</p>
            <p><span className="font-bold text-secondary">Email:</span> {user?.email}</p>
            <p><span className="font-bold text-secondary">Phone:</span> {user?.phone}</p>
            <p><span className="font-bold text-secondary">Experience:</span> {user?.experience || '10+'} Years</p>
            <p><span className="font-bold text-secondary">Category:</span> {user?.serviceCategory || 'General Contractor'}</p>
          </div>
        );
      case 'verification':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm text-left space-y-sm text-xs">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-sm">Verification Badge</h3>
            <div className="p-md bg-green-50 text-green-800 rounded-xl border border-green-200 flex items-center gap-sm">
              <span className="material-symbols-outlined text-[32px] text-green-600">verified</span>
              <div>
                <p className="font-bold text-sm">Verified Service Partner</p>
                <p className="text-[10px]">Your profile has been vetted and marked as a trusted service associate on ARCUS.</p>
              </div>
            </div>
          </div>
        );
      case 'portfolio':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm text-center text-slate-500 text-xs py-xl">
            <span className="material-symbols-outlined text-[48px] text-slate-300">photo_library</span>
            <p className="mt-sm">Portfolio showcase module coming soon.</p>
          </div>
        );
      case 'projects':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm text-center text-slate-500 text-xs py-xl">
            <span className="material-symbols-outlined text-[48px] text-slate-300">assignment_turned_in</span>
            <p className="mt-sm">Active project coordination workspace coming soon.</p>
          </div>
        );
      case 'history':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm text-left space-y-md text-xs">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-sm">Past Completed Works</h3>
            <div className="p-md bg-slate-50 rounded-xl border border-slate-200 space-y-xs">
              <h4 className="font-bold text-slate-900">Whitefield Villa Plumbing System</h4>
              <p className="text-slate-500 text-[10px]">Completed on April 2026 • Rating: 5.0 ★</p>
            </div>
          </div>
        );
      case 'ratings':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm text-left space-y-md text-xs">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-sm">Client Reviews</h3>
            <div className="p-md bg-slate-50 rounded-xl border border-slate-200 space-y-sm">
              <div className="flex justify-between">
                <span className="font-bold">Rahul Sen (Homeowner)</span>
                <span className="text-amber-500 font-bold">5.0 ★</span>
              </div>
              <p className="text-slate-600 italic">"Excellent CPVC plumbing installations. Extremely professional and fast delivery."</p>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <ProfessionalLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </ProfessionalLayout>
  );
};
export default ProfessionalDashboard;
