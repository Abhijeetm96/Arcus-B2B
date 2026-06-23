import React, { useState } from 'react';
import { BusinessLayout } from './layouts/BusinessLayout';
import { BusinessRFQs } from './BusinessRFQs';
import { BusinessProjects } from './BusinessProjects';
import { BusinessInvoices } from './BusinessInvoices';
import { IndividualOrders } from '../individual/IndividualOrders';
import { IndividualAddresses } from '../individual/IndividualAddresses';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../core/hooks/useOrders';
import { formatCurrency } from '../../core/config/format';

export const BusinessDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState<string>('overview');

  const parseAmount = (amtStr: any) => {
    if (typeof amtStr === 'number') return amtStr;
    if (!amtStr) return 0;
    return parseFloat(String(amtStr).replace(/[^\d.]/g, '')) || 0;
  };

  const totalSpend = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + parseAmount(o.amount), 0);

  const renderOverview = () => {
    return (
      <div className="space-y-lg text-left">
        {/* Banner */}
        <div className="bg-[#1a1c1c] text-white p-xl rounded-3xl relative overflow-hidden flex flex-col justify-center min-h-[140px] shadow-md">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[#FFC107]/10 skew-x-12 translate-x-1/3 pointer-events-none"></div>
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-[#FFC107] text-[40px]">apartment</span>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Corporate Procurement Portal</h2>
              <p className="text-[#FFC107] text-xs font-bold font-label-caps uppercase tracking-widest mt-0.5">{user?.companyName || 'Corporate Entity'}</p>
            </div>
          </div>
        </div>

        {/* Core Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="bg-[#FFFDF5] border border-[#FFC107]/20 p-md rounded-2xl">
            <span className="material-symbols-outlined text-[#FFC107] text-[32px]">percent</span>
            <p className="text-[24px] font-bold text-[#FFC107] mt-2">{formatCurrency(totalSpend * 0.18)}</p>
            <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">GST Savings Input</p>
          </div>
          <div className="bg-white border border-slate-200 p-md rounded-2xl shadow-sm">
            <span className="material-symbols-outlined text-[#FFC107] text-[32px]">assignment</span>
            <p className="text-[24px] font-bold text-[#0A0A0A] mt-2">Active Workspace</p>
            <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">B2B RFQs</p>
          </div>
          <div className="bg-white border border-slate-200 p-md rounded-2xl shadow-sm">
            <span className="material-symbols-outlined text-[#FFC107] text-[32px]">analytics</span>
            <p className="text-[24px] font-bold text-[#0A0A0A] mt-2">{formatCurrency(totalSpend)}</p>
            <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">Annual Spend</p>
          </div>
        </div>

        {/* Corporate Profile Card */}
        <div className="border border-slate-200 rounded-2xl p-lg space-y-md bg-white shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">badge</span> Corporate Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-xs">
            <div>
              <p className="font-bold text-secondary">Company Name</p>
              <p className="text-sm font-bold text-slate-800 mt-xs">{user?.companyName || 'Corporate Entity'}</p>
            </div>
            <div>
              <p className="font-bold text-secondary">GSTIN Number</p>
              <p className="text-sm font-bold text-slate-800 mt-xs">{user?.gstNumber || 'Unverified GST Profile'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'rfqs':
        return <BusinessRFQs />;
      case 'orders':
        return <IndividualOrders />;
      case 'invoices':
        return <BusinessInvoices />;
      case 'projects':
        return <BusinessProjects />;
      case 'quotes':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm text-center text-slate-500 text-xs py-xl">
            <span className="material-symbols-outlined text-[48px] text-slate-300">bookmark</span>
            <p className="mt-sm">Saved Quotes module coming soon in Phase 2.</p>
          </div>
        );
      case 'team':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm text-center text-slate-500 text-xs py-xl">
            <span className="material-symbols-outlined text-[48px] text-slate-300">group</span>
            <p className="mt-sm">Team Members module coming soon in Phase 2.</p>
          </div>
        );
      case 'gst':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm text-left space-y-md text-xs">
            <h3 className="font-bold text-md text-slate-800 border-b border-slate-100 pb-sm">GSTIN Profile Details</h3>
            <div className="space-y-xs">
              <p><span className="font-bold text-secondary">Verified Entity:</span> {user?.companyName}</p>
              <p><span className="font-bold text-secondary">GSTIN:</span> {user?.gstNumber}</p>
              <p><span className="font-bold text-secondary">Authorized Signatory:</span> {user?.name}</p>
              <p><span className="font-bold text-secondary">Email:</span> {user?.email}</p>
            </div>
          </div>
        );
      case 'addresses':
        return <IndividualAddresses />;
      default:
        return renderOverview();
    }
  };

  return (
    <BusinessLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </BusinessLayout>
  );
};
export default BusinessDashboard;
