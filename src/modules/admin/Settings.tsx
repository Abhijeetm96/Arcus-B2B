import React, { useEffect, useState } from 'react';
import type { AppSettings } from './types';


export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'commerce' | 'inventory' | 'rfq' | 'search' | 'notifications'>('commerce');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/settings');
        if (!res.ok) throw new Error('Failed to load settings.');
        const data = await res.json();
        setSettings(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings.');

      setSuccess('Application settings updated successfully!');
      setSettings(data);
    } catch (err: any) {
      setError(err.message || 'Error updating settings.');
    }
  };

  const updateField = (key: keyof AppSettings, val: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: val
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-xl">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="bg-red-50 text-red-800 p-md rounded border border-red-200">
        <p className="font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-lg text-left max-w-3xl">
      {/* Notifications */}
      {error && (
        <div className="bg-red-50 text-red-800 p-md rounded border border-red-200 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="material-symbols-outlined text-[18px]">close</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-800 p-md rounded border border-green-200 flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="material-symbols-outlined text-[18px]">close</button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[450px]">
        {/* Left Vertical Tabs */}
        <div className="w-full md:w-56 bg-slate-50 border-r border-slate-200 p-sm space-y-xs flex-shrink-0 flex md:flex-col overflow-x-auto md:overflow-x-visible">
          <button
            type="button"
            onClick={() => setActiveTab('commerce')}
            className={`w-full text-left px-md py-sm rounded text-xs font-bold uppercase tracking-wider flex items-center gap-xs transition-all ${
              activeTab === 'commerce' ? 'bg-primary text-slate-950 font-black' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/55'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            Commerce
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`w-full text-left px-md py-sm rounded text-xs font-bold uppercase tracking-wider flex items-center gap-xs transition-all ${
              activeTab === 'inventory' ? 'bg-primary text-slate-950 font-black' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/55'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">warehouse</span>
            Inventory
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rfq')}
            className={`w-full text-left px-md py-sm rounded text-xs font-bold uppercase tracking-wider flex items-center gap-xs transition-all ${
              activeTab === 'rfq' ? 'bg-primary text-slate-950 font-black' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/55'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">request_quote</span>
            RFQ Pipeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`w-full text-left px-md py-sm rounded text-xs font-bold uppercase tracking-wider flex items-center gap-xs transition-all ${
              activeTab === 'search' ? 'bg-primary text-slate-950 font-black' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/55'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">manage_search</span>
            Search Insights
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-md py-sm rounded text-xs font-bold uppercase tracking-wider flex items-center gap-xs transition-all ${
              activeTab === 'notifications' ? 'bg-primary text-slate-950 font-black' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/55'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            Notifications
          </button>
        </div>

        {/* Right Tab Content */}
        <form onSubmit={handleSaveSettings} className="flex-1 p-lg flex flex-col justify-between space-y-lg text-xs font-semibold text-slate-600">
          <div className="space-y-md">
            {activeTab === 'commerce' && settings && (
              <div className="space-y-md">
                <h4 className="font-extrabold text-slate-900 text-body-md border-b border-slate-100 pb-xs mb-md">Commerce & Value Configurations</h4>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">B2C Minimum Checkout Value (₹) *</label>
                  <input
                    type="number"
                    required
                    value={settings.b2cMinimumOrderValue}
                    onChange={e => updateField('b2cMinimumOrderValue', Number(e.target.value))}
                    className="w-full max-w-xs h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-bold text-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-xs font-medium">B2C carts with total amount below this value will not be allowed to place order.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Free Shipping Threshold Target (₹) *</label>
                  <input
                    type="number"
                    required
                    value={settings.freeShippingThreshold || 5000}
                    onChange={e => updateField('freeShippingThreshold', Number(e.target.value))}
                    className="w-full max-w-xs h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            {activeTab === 'inventory' && settings && (
              <div className="space-y-md">
                <h4 className="font-extrabold text-slate-900 text-body-md border-b border-slate-100 pb-xs mb-md">Default Safety Stock & MOQ Guidelines</h4>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Default Minimum Order Quantity (MOQ)</label>
                  <input
                    type="number"
                    required
                    value={settings.defaultMoq !== undefined ? settings.defaultMoq : 1}
                    onChange={e => updateField('defaultMoq', Number(e.target.value))}
                    className="w-full max-w-xs h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Default Order Packaging Multiples</label>
                  <input
                    type="number"
                    required
                    value={settings.defaultOrderMultiple !== undefined ? settings.defaultOrderMultiple : 1}
                    onChange={e => updateField('defaultOrderMultiple', Number(e.target.value))}
                    className="w-full max-w-xs h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            {activeTab === 'rfq' && settings && (
              <div className="space-y-md">
                <h4 className="font-extrabold text-slate-900 text-body-md border-b border-slate-100 pb-xs mb-md">RFQ Pipeline Workflow Rules</h4>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Auto Assignment Mode</label>
                  <select
                    value={settings.rfqAutoAssignment || 'Unassigned'}
                    onChange={e => updateField('rfqAutoAssignment', e.target.value)}
                    className="w-full max-w-xs h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-bold text-slate-900"
                  >
                    <option value="Unassigned">Unassigned (Manual allocation)</option>
                    <option value="RoundRobin">Round Robin (Auto allocate equally)</option>
                    <option value="LoadBased">Load Based (Allocate to least busy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Quote Validity Limit (Days)</label>
                  <input
                    type="number"
                    required
                    value={settings.quoteValidityDays || 30}
                    onChange={e => updateField('quoteValidityDays', Number(e.target.value))}
                    className="w-full max-w-xs h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-bold text-slate-900"
                  />
                </div>

                <div className="pt-sm">
                  <label className="flex items-center gap-xs text-body-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.rfqNotifications !== false}
                      onChange={e => updateField('rfqNotifications', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    Enable Auto RFQ Notifications for Sales Reps
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'search' && settings && (
              <div className="space-y-md">
                <h4 className="font-extrabold text-slate-900 text-body-md border-b border-slate-100 pb-xs mb-md">Search Insights logging Settings</h4>

                <div className="pt-sm">
                  <label className="flex items-center gap-xs text-body-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.searchEnableLogging !== false}
                      onChange={e => updateField('searchEnableLogging', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    Log user search queries & click-through rates
                  </label>
                  <p className="text-[10px] text-slate-400 mt-xs pl-xl font-medium">When checked, searches resulting in zero products or click logs will be saved to Search Insights workspace.</p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && settings && (
              <div className="space-y-md">
                <h4 className="font-extrabold text-slate-900 text-body-md border-b border-slate-100 pb-xs mb-md">System Notification triggers</h4>

                <div className="space-y-md pt-sm">
                  <label className="flex items-center gap-xs text-body-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.notificationEmailAlerts !== false}
                      onChange={e => updateField('notificationEmailAlerts', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    Enable Email Alerts for order status updates
                  </label>

                  <label className="flex items-center gap-xs text-body-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.defaultGstRate === 18} // reuse check as mock setting
                      onChange={e => updateField('defaultGstRate', e.target.checked ? 18 : 0)}
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    Enable SMS/WhatsApp transactional alerts
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer Save Button */}
          <div className="pt-lg border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="bg-primary-container text-on-primary-container hover:bg-[#fabd00] px-xl h-11 rounded font-bold text-xs transition-all shadow-sm"
            >
              Persist Settings updates
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
