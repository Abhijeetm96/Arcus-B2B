import React, { useState, useEffect } from 'react';
import { AdminLayout, type AdminRole } from './AdminLayout';
import { useAuth } from '../../context/AuthContext';

import { DashboardHome } from './DashboardHome';
import { ProductManagement } from './ProductManagement';
import { CategoryManagement } from './CategoryManagement';
import { BrandManagement } from './BrandManagement';
import { InventoryManagement } from './InventoryManagement';
import { OrderManagement } from './OrderManagement';
import { RFQManagement } from './RFQManagement';
import { CustomerManagement } from './CustomerManagement';
import { SearchAnalytics } from './SearchAnalytics';
import { Reports } from './Reports';
import { RoleManagement } from './RoleManagement';
import { Settings } from './Settings';
import { AuditLogs } from './AuditLogs';
import { ImportProducts } from './ImportProducts';
import { ExportProducts } from './ExportProducts';
import { BulkUpdates } from './BulkUpdates';

export const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<AdminRole>('SUPER_ADMIN');

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'Admin' && user.role !== 'ADMIN'))) {
      window.location.hash = '#/auth?tab=login';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'Admin' && user.role !== 'ADMIN')) {
    return null;
  }

  // Simple router based on selected section ID
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'products':
        return <ProductManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'brands':
        return <BrandManagement />;
      case 'import-products':
        return <ImportProducts />;
      case 'export-products':
        return <ExportProducts />;
      case 'bulk-updates':
        return <BulkUpdates />;
      case 'inventory-overview':
      case 'stock-adjustments':
        return <InventoryManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'rfqs':
        return <RFQManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'search-analytics':
        return <SearchAnalytics />;
      case 'reports':
        return <Reports />;
      case 'audit-logs':
        return <AuditLogs />;
      case 'role-mgmt':
        return <RoleManagement currentRole={currentRole} setCurrentRole={setCurrentRole} />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <AdminLayout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      currentRole={currentRole}
      setCurrentRole={setCurrentRole}
    >
      {renderContent()}
    </AdminLayout>
  );
};
