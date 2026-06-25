import React, { useState } from 'react';
import { ProfessionalLayout } from './layouts/ProfessionalLayout';
import { useAuth } from '../../context/AuthContext';
import { MetricCard, Card, CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import { Wrench, Star, Briefcase, ShieldCheck, Award, FileText } from 'lucide-react';

export const ProfessionalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');

  const renderOverview = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Banner */}
        <div className="bg-slate-900 text-white p-6 rounded relative overflow-hidden flex flex-col justify-center min-h-[140px] shadow-sm">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/10 skew-x-12 translate-x-1/3 pointer-events-none"></div>
          <div className="flex items-center gap-3">
            <Wrench className="text-primary h-10 w-10" />
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Professional Service Desk</h2>
              <p className="text-primary text-xs font-bold uppercase tracking-wider mt-0.5">Manage details and work history</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Client Rating"
            value="4.9 / 5.0"
            description="Based on client feedback"
            icon={<Star className="h-4 w-4 text-text-secondary" />}
          />
          <MetricCard
            title="Experience"
            value={`${user?.experience || '10+'} Years`}
            description="Industry practice duration"
            icon={<Briefcase className="h-4 w-4 text-text-secondary" />}
          />
          <MetricCard
            title="Trust Badge"
            value="Verified Partner"
            description="Vetted by ARCUS operations"
            icon={<ShieldCheck className="h-4 w-4 text-success" />}
          />
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" /> Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-semibold text-text-secondary">Specialization</p>
              <p className="text-sm font-bold text-text-primary mt-1">{user?.serviceCategory || 'General Contractor'}</p>
            </div>
            <div>
              <p className="font-semibold text-text-secondary">Location</p>
              <p className="text-sm font-bold text-text-primary mt-1">{user?.city || 'Bengaluru'}, {user?.state || 'Karnataka'}</p>
            </div>
            <div>
              <p className="font-semibold text-text-secondary">Website</p>
              <p className="text-sm font-bold text-text-primary mt-1">{user?.website || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold text-text-secondary">Portfolio URL</p>
              <p className="text-sm font-bold text-text-primary mt-1">{user?.portfolioUrl || 'N/A'}</p>
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
      case 'profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider">Professional Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p><span className="font-semibold text-text-secondary">Name:</span> {user?.name}</p>
              <p><span className="font-semibold text-text-secondary">Email:</span> {user?.email}</p>
              <p><span className="font-semibold text-text-secondary">Phone:</span> {user?.phone}</p>
              <p><span className="font-semibold text-text-secondary">Experience:</span> {user?.experience || '10+'} Years</p>
              <p><span className="font-semibold text-text-secondary">Category:</span> {user?.serviceCategory || 'General Contractor'}</p>
            </CardContent>
          </Card>
        );
      case 'verification':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider">Verification Badge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-success/10 text-success rounded border border-success/20 flex items-center gap-3">
                <ShieldCheck className="h-10 w-10 text-success flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">Verified Service Partner</p>
                  <p className="text-[10px] text-text-secondary">Your profile has been vetted and marked as a trusted service associate on ARCUS.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'portfolio':
        return (
          <Card className="text-center text-text-secondary py-12">
            <CardContent className="flex flex-col items-center">
              <Briefcase className="h-12 w-12 text-muted mb-3" />
              <p className="text-xs">Portfolio showcase module coming soon.</p>
            </CardContent>
          </Card>
        );
      case 'projects':
        return (
          <Card className="text-center text-text-secondary py-12">
            <CardContent className="flex flex-col items-center">
              <FileText className="h-12 w-12 text-muted mb-3" />
              <p className="text-xs">Active project coordination workspace coming soon.</p>
            </CardContent>
          </Card>
        );
      case 'history':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider">Past Completed Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-surface-secondary/50 rounded border border-border space-y-1">
                <h4 className="font-bold text-text-primary text-xs">Whitefield Villa Plumbing System</h4>
                <p className="text-text-secondary text-[10px]">Completed on April 2026 • Rating: 5.0 ★</p>
              </div>
            </CardContent>
          </Card>
        );
      case 'ratings':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider">Client Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-surface-secondary/50 rounded border border-border space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-text-primary">Rahul Sen (Homeowner)</span>
                  <span className="text-primary font-bold flex items-center gap-0.5">5.0 <Star className="h-3 w-3 fill-current" /></span>
                </div>
                <p className="text-text-secondary italic text-xs">"Excellent CPVC plumbing installations. Extremely professional and fast delivery."</p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <ProfessionalLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </ProfessionalLayout>
  );
};
export default ProfessionalDashboard;
