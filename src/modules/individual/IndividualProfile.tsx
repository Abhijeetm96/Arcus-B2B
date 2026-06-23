import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const IndividualProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    defaultAddress: '',
    city: 'Bengaluru',
    state: 'Karnataka'
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [settingsToast, setSettingsToast] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const savedProfile = localStorage.getItem(`arcus-user-profile-data-${user.id}`);
      let parsed = {};
      if (savedProfile) {
        try {
          parsed = JSON.parse(savedProfile);
        } catch {}
      }
      setSettingsForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || 'Bengaluru',
        state: user.state || 'Karnataka',
        company: user.companyName || '',
        defaultAddress: 'Flat 402, Block A, Prestige Shantiniketan, Whitefield, Bengaluru - 560048',
        ...parsed
      });
      setEmailVerified(localStorage.getItem(`arcus-email-verified-${user.id}`) === 'true' || !!user.email);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch('http://localhost:5000/api/users/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: settingsForm.name,
          city: settingsForm.city,
          state: settingsForm.state
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update profile.');
        return;
      }
      localStorage.setItem(`arcus-user-profile-data-${user?.id}`, JSON.stringify(settingsForm));
      await refreshUser();
      setSettingsToast('Profile settings saved successfully!');
      setTimeout(() => setSettingsToast(null), 3000);
    } catch {
      alert('Network error. Failed to save profile.');
    }
  };

  return (
    <div className="space-y-md text-left">
      {settingsToast && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-xs p-sm rounded-xl font-bold flex items-center gap-xs shadow-sm">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {settingsToast}
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm space-y-md">
        <h3 className="font-bold text-md text-slate-800 border-b border-slate-100 pb-xs">Account Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-xs">
          <div className="flex flex-col gap-xs">
            <label className="font-bold text-secondary uppercase font-label-caps tracking-wider">Full Name</label>
            <input
              type="text"
              value={settingsForm.name}
              onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
              className="h-11 px-md border border-slate-200 rounded-xl focus:border-[#FFC107] focus:ring-0 text-slate-800 font-semibold"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-bold text-secondary uppercase font-label-caps tracking-wider">Email Address</label>
            <div className="flex gap-sm">
              <input
                type="text"
                disabled
                value={settingsForm.email}
                className="flex-1 h-11 px-md border border-slate-200 bg-slate-50 rounded-xl text-slate-400 font-semibold"
              />
              <span className={`h-11 px-md flex items-center rounded-xl font-bold border text-[10px] ${
                emailVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {emailVerified ? 'VERIFIED' : 'UNVERIFIED'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-xl py-3 bg-[#FFC107] hover:bg-[#fabd00] text-[#0A0A0A] font-bold rounded-xl text-xs font-label-caps uppercase tracking-wider shadow-sm"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};
export default IndividualProfile;
