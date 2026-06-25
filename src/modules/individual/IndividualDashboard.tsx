import React, { useState, useEffect } from 'react';
import { IndividualLayout } from './layouts/IndividualLayout';
import { IndividualOrders } from './IndividualOrders';
import { IndividualAddresses } from './IndividualAddresses';
import { IndividualProfile } from './IndividualProfile';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../core/hooks/useOrders';
import { formatCurrency, formatDate } from '../../core/config/format';
import { MetricCard, Card, CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import { Button } from '../../components/ui/Button';
import { Award, TrendingUp, Sparkles, Heart } from 'lucide-react';

export const IndividualDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Rewards states
  const [challengesClaimed, setChallengesClaimed] = useState<string[]>([]);
  const [redeemedPoints, setRedeemedPoints] = useState(0);

  useEffect(() => {
    if (user) {
      const savedPoints = localStorage.getItem(`arcus-user-redeemed-points-${user.id}`);
      setRedeemedPoints(savedPoints ? Number(savedPoints) : 0);
    }
  }, [user]);

  // Calculate monthly spend dynamically
  const parseAmount = (amtStr: any) => {
    if (typeof amtStr === 'number') return amtStr;
    if (!amtStr) return 0;
    return parseFloat(String(amtStr).replace(/[^\d.]/g, '')) || 0;
  };

  const calculatedMonthlySpend = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + parseAmount(o.amount), 0);

  // BuildPoints dynamic calculations
  const basePoints = Math.floor(calculatedMonthlySpend / 500) * 2;
  const challengeBonus = (challengesClaimed.includes('challenge_profile') ? 100 : 0) +
    (challengesClaimed.includes('challenge_orders') ? 100 : 0);
  const totalPoints = Math.max(0, basePoints + challengeBonus - redeemedPoints);

  const activeTier = calculatedMonthlySpend >= 100000 ? 'Architect' :
    calculatedMonthlySpend >= 50000 ? 'Builder' :
    calculatedMonthlySpend >= 25000 ? 'Creator' : 'Explorer';

  const renderOverview = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Banner */}
        <div className="bg-slate-900 text-white p-6 rounded relative overflow-hidden flex flex-col justify-center min-h-[140px] shadow-sm">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/10 skew-x-12 translate-x-1/3 pointer-events-none"></div>
          <div className="flex items-center gap-3">
            <Award className="text-primary h-10 w-10" />
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Welcome, {user?.name}!</h2>
              <p className="text-primary text-xs font-bold uppercase tracking-wider mt-0.5">Build More, Earn More with ARCUS BuildPoints™</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="BuildPoints Balance"
            value={totalPoints.toLocaleString()}
            description={`Equivalent to ₹${(totalPoints * 0.5).toLocaleString()} Credit`}
            icon={<Award className="h-4 w-4 text-text-secondary" />}
          />
          <MetricCard
            title="Total Monthly Spend"
            value={formatCurrency(calculatedMonthlySpend)}
            description="Rate: ₹500 spend = 2 BuildPoints"
            icon={<TrendingUp className="h-4 w-4 text-text-secondary" />}
          />
          <MetricCard
            title="Loyalty Tier Status"
            value={`🏗️ ${activeTier}`}
            description="Progressing to next reward level"
            icon={<Sparkles className="h-4 w-4 text-text-secondary" />}
          />
        </div>

        {/* Recent Orders Short-list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm uppercase tracking-wider">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')} className="text-primary font-bold">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {orders.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-4">No orders placed yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {orders.slice(0, 3).map((o: any) => (
                  <div key={o.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-text-primary">{o.id}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">{formatDate(o.timestamp || o.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-primary">{formatCurrency(o.amount)}</p>
                      <span className="text-[9px] font-bold text-text-secondary uppercase">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'orders':
        return <IndividualOrders />;
      case 'addresses':
        return <IndividualAddresses />;
      case 'wishlist':
        return (
          <Card className="text-center text-text-secondary py-12">
            <CardContent className="flex flex-col items-center">
              <Heart className="h-12 w-12 text-muted mb-3" />
              <p className="text-xs">Wishlist module coming soon in Phase 2.</p>
            </CardContent>
          </Card>
        );
      case 'rewards':
        return (
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider">Rewards Challenges</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-secondary/50 p-4 rounded border border-border flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-text-primary">Complete Profile Details</h4>
                  <p className="text-text-secondary text-[10px] mt-1">Earn bonus points for setting up your account profile.</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={challengesClaimed.includes('challenge_profile')}
                  onClick={() => {
                    setChallengesClaimed([...challengesClaimed, 'challenge_profile']);
                    alert('Claimed 100 BuildPoints!');
                  }}
                >
                  {challengesClaimed.includes('challenge_profile') ? 'Claimed' : 'Claim 100 Pts'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'profile':
        return <IndividualProfile />;
      default:
        return renderOverview();
    }
  };

  return (
    <IndividualLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </IndividualLayout>
  );
};
export default IndividualDashboard;
