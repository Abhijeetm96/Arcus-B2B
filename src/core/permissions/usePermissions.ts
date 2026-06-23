import { useAuth } from '../../context/AuthContext';
import * as perm from './permissions';

export function usePermissions() {
  const { user } = useAuth();
  
  return {
    isAdmin: perm.isAdmin(user),
    canViewInventory: perm.canViewInventory(user),
    canEditInventory: perm.canEditInventory(user),
    canManageProducts: perm.canManageProducts(user),
    canManageAdmins: perm.canManageAdmins(user),
    canApproveRFQs: perm.canApproveRFQs(user),
    canViewReports: perm.canViewReports(user),
    canManageSettings: perm.canManageSettings(user),
    canManageCustomers: perm.canManageCustomers(user),
  };
}
