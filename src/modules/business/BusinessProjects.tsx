import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const BusinessProjects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`arcus-business-projects-${user.id}`);
      setProjects(saved ? JSON.parse(saved) : [
        { id: 'PROJ-01', name: 'Whitefield Residential Complex', siteManager: 'Ramesh Patel', address: 'Plot 48, ITPL Road, Bangalore', status: 'ACTIVE', spend: 850000 },
        { id: 'PROJ-02', name: 'HSR Layout Office Block', siteManager: 'Karan Mehra', address: 'Sector 2, HSR Layout, Bangalore', status: 'ACTIVE', spend: 320000 }
      ]);
    }
  }, [user]);

  const saveProjects = (newProjs: any[]) => {
    setProjects(newProjs);
    if (user) {
      localStorage.setItem(`arcus-business-projects-${user.id}`, JSON.stringify(newProjs));
    }
  };

  const handleAddProject = () => {
    const name = prompt('Enter project / site name:');
    if (!name || !name.trim()) return;
    const siteManager = prompt('Enter Site Manager name:');
    const address = prompt('Enter Site delivery address:');
    
    const newProj = {
      id: `PROJ-${Math.floor(10 + Math.random() * 90)}`,
      name: name.trim(),
      siteManager: siteManager?.trim() || 'N/A',
      address: address?.trim() || 'N/A',
      status: 'ACTIVE',
      spend: 0
    };
    saveProjects([...projects, newProj]);
  };

  return (
    <div className="bg-white border border-slate-200 rounded p-lg shadow-sm space-y-md text-left">
      <div className="flex justify-between items-center border-b border-slate-100 pb-sm">
        <div>
          <h3 className="font-bold text-md text-slate-800">Commercial Projects &amp; Sites</h3>
          <p className="text-secondary text-xs mt-0.5">Track procurement budgets, delivery locations, and managers for active construction sites.</p>
        </div>
        <button
          onClick={handleAddProject}
          className="px-md py-1.5 bg-primary text-[#0A0A0A] hover:bg-[#fabd00] font-bold rounded text-xs flex items-center gap-xs shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add New Project Site
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-xs text-xs">
        {projects.map((proj) => (
          <div key={proj.id} className="bg-slate-50 p-md rounded border border-slate-200 space-y-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-bold font-mono">{proj.id}</span>
                <h4 className="font-bold text-slate-800 text-sm mt-xs">{proj.name}</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-green-50 text-green-700 border border-green-200">
                {proj.status}
              </span>
            </div>
            <div className="space-y-xs text-slate-600 font-medium">
              <p><span className="font-bold text-secondary">Site Manager:</span> {proj.siteManager}</p>
              <p><span className="font-bold text-secondary">Delivery Location:</span> {proj.address}</p>
              <p><span className="font-bold text-secondary">Total Procurement Spend:</span> ₹{proj.spend.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default BusinessProjects;
