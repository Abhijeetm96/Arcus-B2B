import React, { useState, useEffect } from 'react';
import { AdminLayout, type AdminRole } from './AdminLayout';
import { useAuth } from '../../context/AuthContext';

import { DashboardHome } from './DashboardHome';
import { ProductManagement } from './ProductManagement';
import { CategoryManagement } from './CategoryManagement';
import { BrandManagement } from './BrandManagement';
import { InventoryManagement } from './InventoryManagement';
import { OrderManagement } from './OrderManagement';
import { CustomerManagement } from './CustomerManagement';
import { SearchAnalytics } from './SearchAnalytics';
import { Reports } from './Reports';
import { RoleManagement } from './RoleManagement';
import { Settings } from './Settings';
import { AuditLogs } from './AuditLogs';
import { ImportProducts } from './ImportProducts';
import { ExportProducts } from './ExportProducts';
import { BulkUpdates } from './BulkUpdates';
import { AbandonedCarts } from './AbandonedCarts';
import { TaxControlCentre } from './TaxControlCentre';

export const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const getInitialSection = () => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    return params.get('section') || 'dashboard';
  };

  const [activeSection, setActiveSection] = useState<string>(getInitialSection);
  const [currentRole, setCurrentRole] = useState<AdminRole>('SUPER_ADMIN');

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'Admin' && user.role !== 'ADMIN'))) {
      window.location.hash = '#/auth?tab=login';
    }
  }, [user, loading]);

  // Synchronize section from URL hash query parameter on hash change & mount
  useEffect(() => {
    const handleHashChange = () => {
      if (!window.location.hash.startsWith('#/portal/admin')) return;
      const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const section = params.get('section') || 'dashboard';
      setActiveSection(section);
    };

    window.addEventListener('hashchange', handleHashChange);

    // Initialize the hash query parameter if not present
    if (window.location.hash.startsWith('#/portal/admin')) {
      const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
      if (!params.get('section')) {
        const hashWithoutParams = window.location.hash.split('?')[0] || '#/portal/admin';
        window.location.hash = `${hashWithoutParams}?section=${activeSection}`;
      }
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSectionChange = (section: string) => {
    if (!window.location.hash.startsWith('#/portal/admin')) return;
    const hashWithoutParams = window.location.hash.split('?')[0] || '#/portal/admin';
    window.location.hash = `${hashWithoutParams}?section=${section}`;
  };

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
        return <ProductManagement setActiveSection={setActiveSection} />;
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
      case 'orders-b2b':
        return <OrderManagement type="B2B" />;
      case 'orders-b2c':
        return <OrderManagement type="B2C" />;
      case 'orders-services':
        return <OrderManagement type="SERVICES" />;

      case 'customers':
        return <CustomerManagement />;
      case 'search-analytics':
      case 'search-queries':
        return <SearchAnalytics view="queries" />;
      case 'search-locations':
        return <SearchAnalytics view="locations" />;
      case 'abandoned-carts':
        return <AbandonedCarts />;
      case 'reports':
        return <Reports />;
      case 'tax':
        return <TaxControlCentre />;
      case 'audit-logs':
        return <AuditLogs currentRole={currentRole} />;
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
      setActiveSection={handleSectionChange}
      currentRole={currentRole}
      setCurrentRole={setCurrentRole}
    >
      {renderContent()}
    </AdminLayout>
  );
};
