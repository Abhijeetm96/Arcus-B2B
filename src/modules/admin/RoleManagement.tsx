import React from 'react';
import type { AdminRole } from './AdminLayout';

interface RoleManagementProps {
  currentRole: AdminRole;
  setCurrentRole: (role: AdminRole) => void;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ currentRole, setCurrentRole }) => {
  const roles: AdminRole[] = [
    'SUPER_ADMIN',
    'OPERATIONS_MANAGER',
    'INVENTORY_MANAGER',
    'SALES_MANAGER',
    'CUSTOMER_SUPPORT'
  ];

  const getRoleLabel = (role: AdminRole) => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const getRoleDesc = (role: AdminRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Universal control over products, orders, inventory adjustments, settings, and administrator roles.';
      case 'OPERATIONS_MANAGER':
        return 'Responsible for catalog management, stock adjustments, RFQ workflow actions, and analytical reports.';
      case 'INVENTORY_MANAGER':
        return 'Dedicated to monitoring stock levels, conducting inventory audits, and preparing adjustments.';
      case 'SALES_MANAGER':
        return 'Focused on reviewing incoming RFQs, issuing quotes, converting bids to orders, and customer logs.';
      case 'CUSTOMER_SUPPORT':
        return 'Assists customers with status updates, tracking orders, verifying inventory levels, and viewing RFQ submissions.';
      default:
        return '';
    }
  };

  const permissions = [
    { 
      module: 'Dashboard Metrics', 
      read: ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER', 'SALES_MANAGER', 'CUSTOMER_SUPPORT'], 
      write: ['SUPER_ADMIN'] 
    },
    { 
      module: 'Catalog Products', 
      read: ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER'], 
      write: ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER'] 
    },
    { 
      module: 'Category Structure', 
      read: ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER'], 
      write: ['SUPER_ADMIN', 'OPERATIONS_MANAGER'] 
    },
    { 
      module: 'Brand Metadata', 
      read: ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER'], 
      write: ['SUPER_ADMIN', 'OPERATIONS_MANAGER'] 
    },
    { 
      module: 'Orders Processing', 
      read: ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'SALES_MANAGER', 'CUSTOMER_SUPPORT'], 
      write: ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'SALES_MANAGER'] 
    },
    { 
      module: 'Inventory Management', 
      read: ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER', 'CUSTOMER_SUPPORT'], 
      write: ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER'] 
    },
    { 
      module: 'RFQ Workspace', 
      read: ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'SALES_MANAGER', 'CUSTOMER_SUPPORT'], 
      write: ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'SALES_MANAGER'] 
    },
    { 
      module: 'Search Analytics', 
      read: ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER'], 
      write: ['SUPER_ADMIN'] 
    },
    { 
      module: 'System Configurations', 
      read: ['SUPER_ADMIN', 'OPERATIONS_MANAGER'], 
      write: ['SUPER_ADMIN'] 
    },
    { 
      module: 'Admin Log Audits', 
      read: ['SUPER_ADMIN'], 
      write: ['SUPER_ADMIN'] 
    }
  ];

  return (
    <div className="space-y-lg text-left">
      {/* Role details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-md">
        {roles.map(r => (
          <div
            key={r}
            onClick={() => setCurrentRole(r)}
            className={`cursor-pointer border p-md rounded-2xl transition-all flex flex-col justify-between h-44 ${
              currentRole === r 
                ? 'bg-amber-50/50 border-[#FFC107] shadow-md shadow-[#FFC107]/10' 
                : 'bg-white border-slate-200 hover:border-slate-350 shadow-sm'
            }`}
          >
            <div className="space-y-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">System Role</span>
                {currentRole === r && <span className="material-symbols-outlined text-[#FFC107] text-[16px]">check_circle</span>}
              </div>
              <h4 className="font-extrabold text-slate-900 text-body-sm">{getRoleLabel(r)}</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                {getRoleDesc(r)}
              </p>
            </div>
            <span className="text-[9px] font-extrabold text-[#FFC107] uppercase tracking-wider">Select to simulate</span>
          </div>
        ))}
      </div>

      {/* Permission Matrix Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-w-4xl">
        <div className="p-md bg-slate-50 border-b border-slate-200">
          <h4 className="font-extrabold text-slate-900 text-body-sm">Role Authorization Matrix</h4>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Authorization checks validated in frontend views & API controllers</p>
        </div>
        
        <table className="w-full text-body-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="px-lg py-md">Module Area</th>
              <th className="px-lg py-md">Read Rights</th>
              <th className="px-lg py-md">Write/Edit Rights</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {permissions.map((p, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-lg py-md font-bold text-slate-900">{p.module}</td>
                <td className="px-lg py-md">
                  <div className="flex flex-wrap gap-xs">
                    {p.read.map(role => (
                      <span
                        key={role}
                        className={`text-[9px] font-bold px-md py-0.5 rounded ${
                          currentRole === role ? 'bg-amber-100 text-amber-900 border border-[#FFE082]' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {getRoleLabel(role as AdminRole)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-lg py-md">
                  <div className="flex flex-wrap gap-xs">
                    {p.write.map(role => (
                      <span
                        key={role}
                        className={`text-[9px] font-bold px-md py-0.5 rounded ${
                          currentRole === role ? 'bg-amber-100 text-amber-900 border border-[#FFE082]' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {getRoleLabel(role as AdminRole)}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
