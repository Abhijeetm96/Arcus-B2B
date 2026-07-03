export class PermissionEngine {
  /**
   * Evaluates role-based permission rules for procurement collaboration.
   */
  public static canAssign(role: string, adminRole?: string): boolean {
    return role === 'ADMIN' || adminRole === 'SUPER_ADMIN' || adminRole === 'SALES_MANAGER';
  }

  public static canApprove(role: string, adminRole?: string): boolean {
    return role === 'ADMIN' || adminRole === 'SUPER_ADMIN' || adminRole === 'OPERATIONS_MANAGER';
  }

  public static canDelete(role: string, adminRole?: string): boolean {
    return role === 'ADMIN' || adminRole === 'SUPER_ADMIN';
  }

  public static canArchive(role: string, adminRole?: string): boolean {
    return role === 'ADMIN' || adminRole === 'SUPER_ADMIN' || adminRole === 'SALES_MANAGER';
  }

  public static canUploadAttachments(role: string, adminRole?: string): boolean {
    return true; 
  }

  public static canAddComments(role: string, adminRole?: string): boolean {
    return true;
  }
}
