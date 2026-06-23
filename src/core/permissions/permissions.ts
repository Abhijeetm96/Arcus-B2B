export type AdminRole = 'SUPER_ADMIN' | 'OPERATIONS_MANAGER' | 'INVENTORY_MANAGER' | 'SALES_MANAGER' | 'CUSTOMER_SUPPORT';

export function isAdmin(user: any): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'Admin';
}

export function canViewInventory(user: any): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN';
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER', 'CUSTOMER_SUPPORT'].includes(role);
}

export function canEditInventory(user: any): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN';
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER'].includes(role);
}

export function canManageProducts(user: any): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN';
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER'].includes(role);
}

export function canManageAdmins(user: any): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN';
  return role === 'SUPER_ADMIN';
}

export function canApproveRFQs(user: any): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN';
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'SALES_MANAGER', 'CUSTOMER_SUPPORT'].includes(role);
}

export function canViewReports(user: any): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN';
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'SALES_MANAGER'].includes(role);
}

export function canManageSettings(user: any): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN';
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER'].includes(role);
}

export function canManageCustomers(user: any): boolean {
  if (!isAdmin(user)) return false;
  const role = user.adminRole || 'SUPER_ADMIN';
  return ['SUPER_ADMIN', 'OPERATIONS_MANAGER', 'SALES_MANAGER'].includes(role);
}
