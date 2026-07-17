import React, { useState } from 'react';
import { BusinessLayout } from './layouts/BusinessLayout';
import { BusinessRFQs } from './BusinessRFQs';
import { BusinessProjects } from './BusinessProjects';
import { BusinessInvoices } from './BusinessInvoices';
import { IndividualOrders } from '../individual/IndividualOrders';
import { IndividualBookings } from '../individual/IndividualBookings';
import { IndividualAddresses } from '../individual/IndividualAddresses';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../core/hooks/useOrders';
import { formatCurrency } from '../../core/config/format';
import { MetricCard, Card, CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import { Building, Percent, FileSpreadsheet, TrendingUp, ShieldAlert, Bookmark, Users } from 'lucide-react';

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
      <div className="space-y-6 text-left">
        {/* Banner */}
        <div className="bg-slate-900 text-white p-6 rounded relative overflow-hidden flex flex-col justify-center min-h-[140px] shadow-sm">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/10 skew-x-12 translate-x-1/3 pointer-events-none"></div>
          <div className="flex items-center gap-3">
            <Building className="text-primary h-10 w-10" />
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Corporate Procurement Portal</h2>
              <p className="text-primary text-xs font-bold uppercase tracking-wider mt-0.5">{user?.companyName || 'Corporate Entity'}</p>
            </div>
          </div>
        </div>

        {/* Core Stats */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="GST Savings Input"
            value={formatCurrency(totalSpend * 0.18)}
            description="Equivalent to 18% tax deduction"
            icon={<Percent className="h-4 w-4" />}
            trend={{ value: '18%', isPositive: true }}
          />
          <MetricCard
            title="Active Workspace"
            value="B2B RFQs"
            description="Negotiations in progress"
            icon={<FileSpreadsheet className="h-4 w-4" />}
          />
          <MetricCard
            title="Annual Spend"
            value={formatCurrency(totalSpend)}
            description="Based on delivered purchases"
            icon={<TrendingUp className="h-4 w-4" />}
            trend={{ value: '12%', isPositive: true }}
          />
        </div>

        {/* Corporate Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-primary" /> Corporate Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-semibold text-text-secondary">Company Name</p>
              <p className="text-sm font-bold text-text-primary mt-1">{user?.companyName || 'Corporate Entity'}</p>
            </div>
            <div>
              <p className="font-semibold text-text-secondary">GSTIN Number</p>
              <p className="text-sm font-bold text-text-primary mt-1">{user?.gstNumber || 'Unverified GST Profile'}</p>
            </div>
          </CardContent>
        </Card>
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
      case 'bookings':
        return <IndividualBookings />;
      case 'invoices':
        return <BusinessInvoices />;
      case 'projects':
        return <BusinessProjects />;
      case 'quotes':
        return (
          <Card className="text-center text-text-secondary py-12">
            <CardContent className="flex flex-col items-center">
              <Bookmark className="h-12 w-12 text-muted mb-3" />
              <p className="text-xs">Saved Quotes module coming soon in Phase 2.</p>
            </CardContent>
          </Card>
        );
      case 'team':
        return (
          <Card className="text-center text-text-secondary py-12">
            <CardContent className="flex flex-col items-center">
              <Users className="h-12 w-12 text-muted mb-3" />
              <p className="text-xs">Team Members module coming soon in Phase 2.</p>
            </CardContent>
          </Card>
        );
      case 'gst':
        return (
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider">GSTIN Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p><span className="font-semibold text-text-secondary">Verified Entity:</span> {user?.companyName}</p>
              <p><span className="font-semibold text-text-secondary">GSTIN:</span> {user?.gstNumber}</p>
              <p><span className="font-semibold text-text-secondary">Authorized Signatory:</span> {user?.name}</p>
              <p><span className="font-semibold text-text-secondary">Email:</span> {user?.email}</p>
            </CardContent>
          </Card>
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
