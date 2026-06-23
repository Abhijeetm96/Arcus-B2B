import { User } from './User';

export type AdminRole = 'SUPER_ADMIN' | 'OPERATIONS_MANAGER' | 'INVENTORY_MANAGER' | 'SALES_MANAGER' | 'CUSTOMER_SUPPORT';

/**
 * Checks if a user is an Administrator.
 */
export function isAdmin(user: User | null | undefined): user is User {
  if (!user) return false;
  // Handle both mapped role "ADMIN" and legacy role "Admin"
  return user.role === 'ADMIN' || user.role === 'Admin';
}

/**
 * Checks if an administrator has permission to view inventory details.
 */
export function canViewInventory(user: User | null | undefined): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN'; // Fallback to super admin if not defined
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER', 'CUSTOMER_SUPPORT'].includes(role);
}

/**
 * Checks if an administrator has permission to edit inventory adjustments.
 */
export function canEditInventory(user: User | null | undefined): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN';
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER'].includes(role);
}

/**
 * Checks if an administrator has permission to manage (add/edit/archive) catalog products.
 */
export function canManageProducts(user: User | null | undefined): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN';
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER'].includes(role);
}

/**
 * Checks if an administrator has permission to manage other administrators and roles.
 */
export function canManageAdmins(user: User | null | undefined): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN';
  return role === 'SUPER_ADMIN';
}

/**
 * Checks if an administrator has permission to view and approve RFQs.
 */
export function canApproveRFQs(user: User | null | undefined): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN';
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'SALES_MANAGER', 'CUSTOMER_SUPPORT'].includes(role);
}

/**
 * Checks if an administrator has permission to view analytical reports.
 */
export function canViewReports(user: User | null | undefined): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN';
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'SALES_MANAGER'].includes(role);
}
