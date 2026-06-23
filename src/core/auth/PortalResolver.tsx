import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const PortalResolver: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.hash = '#/auth?tab=login';
      return;
    }

    const role = user.role;
    const customerType = user.customerType;

    if (role === 'ADMIN' || role === 'Admin') {
      window.location.hash = '#/portal/admin';
    } else {
      if (customerType === 'INDIVIDUAL') {
        window.location.hash = '#/dashboard/individual';
      } else if (customerType === 'BUSINESS') {
        window.location.hash = '#/dashboard/business';
      } else if (customerType === 'PROFESSIONAL') {
        window.location.hash = '#/dashboard/professional';
      } else {
        // Fallback checks for safety
        window.location.hash = '#/dashboard/individual';
      }
    }
  }, [user, loading]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FFC107]"></div>
    </div>
  );
};
export default PortalResolver;
