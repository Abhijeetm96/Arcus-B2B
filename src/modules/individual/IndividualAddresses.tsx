import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const IndividualAddresses: React.FC = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`arcus-user-addresses-${user.id}`);
      setAddresses(saved ? JSON.parse(saved) : [
        'Flat 402, Block A, Prestige Shantiniketan, Whitefield, Bengaluru - 560048',
        'Site B, 24th Main, HSR Layout, Sector 2, Bengaluru - 560102'
      ]);
    }
  }, [user]);

  const saveAddresses = (newAddrs: string[]) => {
    setAddresses(newAddrs);
    if (user) {
      localStorage.setItem(`arcus-user-addresses-${user.id}`, JSON.stringify(newAddrs));
    }
  };

  const handleAddAddress = () => {
    if (addresses.length >= 10) {
      alert('You can store up to 10 addresses.');
      return;
    }
    const newAddr = prompt('Enter new delivery address:');
    if (newAddr && newAddr.trim()) {
      saveAddresses([...addresses, newAddr.trim()]);
    }
  };

  const handleEditAddress = (idx: number, current: string) => {
    const updated = prompt('Edit address:', current);
    if (updated && updated.trim()) {
      const copy = [...addresses];
      copy[idx] = updated.trim();
      saveAddresses(copy);
    }
  };

  const handleDeleteAddress = (idx: number) => {
    if (addresses.length <= 1) {
      alert('At least one default address is required.');
      return;
    }
    if (confirm('Are you sure you want to delete this address?')) {
      saveAddresses(addresses.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded p-lg shadow-sm space-y-md text-left">
      <div className="flex justify-between items-center border-b border-slate-100 pb-sm">
        <div>
          <h3 className="font-bold text-md text-slate-800">Saved Delivery Addresses</h3>
          <p className="text-secondary text-xs mt-0.5">Manage delivery locations and shipping coordinates (Min 1, Max 10).</p>
        </div>
        <button
          onClick={handleAddAddress}
          className="px-md py-1.5 bg-primary text-[#0A0A0A] hover:bg-[#fabd00] font-bold rounded text-xs transition-colors flex items-center gap-xs shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add New Address
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-xs">
        {addresses.map((addr, idx) => (
          <div key={idx} className="bg-slate-50 p-md rounded border border-slate-200 flex flex-col justify-between gap-md relative text-left text-slate-800 font-semibold">
            <div className="space-y-xs">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                <span className="text-xs font-bold text-slate-800 font-label-caps uppercase tracking-wider">
                  {idx === 0 ? 'Default Delivery Address' : `Address #${idx + 1}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-sm pr-md">{addr}</p>
            </div>
            <div className="flex gap-sm border-t border-slate-200 pt-sm">
              <button
                onClick={() => handleEditAddress(idx, addr)}
                className="text-[10px] font-bold text-secondary hover:text-primary hover:underline uppercase tracking-wide"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteAddress(idx)}
                className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-wide"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default IndividualAddresses;
