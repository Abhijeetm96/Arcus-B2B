import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { PageLayout } from '../../../components/layout/PageLayout';
import { Button } from '../../../components/ui/Button';
import { 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  History, 
  Receipt, 
  Briefcase, 
  Bookmark, 
  Users, 
  ShieldAlert, 
  MapPin,
  Wrench
} from 'lucide-react';

interface BusinessLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BusinessLayout: React.FC<BusinessLayoutProps> = ({
  children,
  activeTab,
  setActiveTab
}) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'rfqs', name: 'B2B RFQs Workspace', icon: FileText },
    { id: 'orders', name: 'Purchase History', icon: History },
    { id: 'bookings', name: 'Service Bookings', icon: Wrench },
    { id: 'invoices', name: 'Tax Invoices Input', icon: Receipt },
    { id: 'projects', name: 'Commercial Projects', icon: Briefcase },
    { id: 'quotes', name: 'Saved Quotes', icon: Bookmark },
    { id: 'team', name: 'Team Members', icon: Users },
    { id: 'gst', name: 'GST Profile', icon: ShieldAlert },
    { id: 'addresses', name: 'Company Addresses', icon: MapPin }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg tracking-wider text-white">
            ARCUS <span className="text-primary text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">BUSINESS</span>
          </span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-semibold transition-all ${
                activeTab === item.id
                  ? 'bg-primary text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.name}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-primary font-bold text-sm">
            {user?.companyName?.slice(0, 2).toUpperCase() || 'CO'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.companyName || 'Corporate Entity'}</p>
            <p className="text-[10px] text-slate-500 truncate">B2B Procurement</p>
          </div>
        </div>
      </div>
    </div>
  );

  const breadcrumbs = [
    { label: 'Business Portal', href: '#/dashboard/business' },
    { label: activeTab.replace('-', ' ') }
  ];

  const headerActions = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.location.hash = '#/'}
      className="flex items-center gap-1.5 text-slate-600 hover:text-slate-950 border-slate-200"
    >
      <LogOut className="h-3.5 w-3.5" />
      Exit Dashboard
    </Button>
  );

  return (
    <PageLayout
      sidebar={sidebarContent}
      breadcrumbItems={breadcrumbs}
      title={activeTab.replace('-', ' ')}
      actions={headerActions}
      className="bg-slate-50"
    >
      {children}
    </PageLayout>
  );
};

export default BusinessLayout;
