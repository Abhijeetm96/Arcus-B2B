import React, { useState, useEffect } from 'react';
import { IndividualLayout } from './layouts/IndividualLayout';
import { IndividualOrders } from './IndividualOrders';
import { IndividualAddresses } from './IndividualAddresses';
import { IndividualProfile } from './IndividualProfile';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../core/hooks/useOrders';
import { formatCurrency, formatDate } from '../../core/config/format';

export const IndividualDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Rewards states
  const [challengesClaimed, setChallengesClaimed] = useState<string[]>([]);
  const [redeemedPoints, setRedeemedPoints] = useState(0);

  useEffect(() => {
    if (user) {
      const savedPoints = localStorage.getItem(`arcus-user-redeemed-points-${user.id}`);
      setRedeemedPoints(savedPoints ? Number(savedPoints) : 0);
    }
  }, [user]);

  // Calculate monthly spend dynamically
  const parseAmount = (amtStr: any) => {
    if (typeof amtStr === 'number') return amtStr;
    if (!amtStr) return 0;
    return parseFloat(String(amtStr).replace(/[^\d.]/g, '')) || 0;
  };

  const calculatedMonthlySpend = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + parseAmount(o.amount), 0);

  // BuildPoints dynamic calculations
  const basePoints = Math.floor(calculatedMonthlySpend / 500) * 2;
  const challengeBonus = (challengesClaimed.includes('challenge_profile') ? 100 : 0) +
    (challengesClaimed.includes('challenge_orders') ? 100 : 0);
  const totalPoints = Math.max(0, basePoints + challengeBonus - redeemedPoints);

  const activeTier = calculatedMonthlySpend >= 100000 ? 'Architect' :
    calculatedMonthlySpend >= 50000 ? 'Builder' :
    calculatedMonthlySpend >= 25000 ? 'Creator' : 'Explorer';

  const renderOverview = () => {
    return (
      <div className="space-y-lg text-left">
        {/* Banner */}
        <div className="bg-[#1a1c1c] text-white p-xl rounded-3xl relative overflow-hidden flex flex-col justify-center min-h-[140px] shadow-md">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[#FFC107]/10 skew-x-12 translate-x-1/3 pointer-events-none"></div>
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-[#FFC107] text-[40px]">stars</span>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Welcome, {user?.name}!</h2>
              <p className="text-[#FFC107] text-xs font-bold font-label-caps uppercase tracking-widest mt-0.5">Build More, Earn More with ARCUS BuildPoints™</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="bg-white border border-slate-200 p-md rounded-2xl shadow-sm relative overflow-hidden">
            <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">BuildPoints Balance</p>
            <p className="text-[28px] font-extrabold text-[#0A0A0A] mt-sm leading-none">{totalPoints.toLocaleString()}</p>
            <p className="text-[10px] text-green-700 bg-green-50 rounded-lg px-sm py-1 font-bold w-fit mt-md">Equivalent to ₹{(totalPoints * 0.5).toLocaleString()} Credit</p>
          </div>
          <div className="bg-white border border-slate-200 p-md rounded-2xl shadow-sm">
            <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Total Monthly Spend</p>
            <p className="text-[28px] font-extrabold text-[#0A0A0A] mt-sm leading-none">{formatCurrency(calculatedMonthlySpend)}</p>
            <p className="text-[10px] text-secondary font-medium mt-md">Rate: ₹500 spend = 2 BuildPoints</p>
          </div>
          <div className="bg-white border border-slate-200 p-md rounded-2xl shadow-sm">
            <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Loyalty Tier Status</p>
            <p className="text-[20px] font-extrabold text-primary mt-sm leading-none flex items-center gap-xs">🏗️ {activeTier}</p>
            <p className="text-[10px] text-secondary font-medium mt-md">Progressing to next reward level</p>
          </div>
        </div>

        {/* Recent Orders Short-list */}
        <div className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm space-y-md">
          <div className="flex justify-between items-center border-b border-slate-100 pb-sm">
            <h3 className="font-bold text-sm text-slate-800">Recent Orders</h3>
            <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-[#FFC107] hover:underline">View All</button>
          </div>
          {orders.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-md">No orders placed yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.slice(0, 3).map((o: any) => (
                <div key={o.id} className="py-md flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{o.id}</p>
                    <p className="text-[10px] text-slate-500 mt-xs">{formatDate(o.timestamp || o.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(o.amount)}</p>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'orders':
        return <IndividualOrders />;
      case 'addresses':
        return <IndividualAddresses />;
      case 'wishlist':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm text-center text-slate-500 text-xs py-xl">
            <span className="material-symbols-outlined text-[48px] text-slate-300">favorite</span>
            <p className="mt-sm">Wishlist module coming soon in Phase 2.</p>
          </div>
        );
      case 'rewards':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm text-left space-y-md">
            <h3 className="font-bold text-md text-slate-800 border-b border-slate-100 pb-sm">Rewards Challenges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-xs">
              <div className="bg-slate-50 p-md rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-slate-800">Complete Profile Details</h4>
                  <p className="text-slate-500 text-[10px] mt-xs">Earn bonus points for setting up your account profile.</p>
                </div>
                <button
                  disabled={challengesClaimed.includes('challenge_profile')}
                  onClick={() => {
                    setChallengesClaimed([...challengesClaimed, 'challenge_profile']);
                    alert('Claimed 100 BuildPoints!');
                  }}
                  className="px-md py-1.5 bg-[#FFC107] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#fabd00] disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {challengesClaimed.includes('challenge_profile') ? 'Claimed' : 'Claim 100 Pts'}
                </button>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return <IndividualProfile />;
      default:
        return renderOverview();
    }
  };

  return (
    <IndividualLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </IndividualLayout>
  );
};
export default IndividualDashboard;
