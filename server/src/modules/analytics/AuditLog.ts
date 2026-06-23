export interface AuditLog {
  id?: number;
  actionType: string;
  details: string;
  performedBy: string;
  timestamp?: string;
}
