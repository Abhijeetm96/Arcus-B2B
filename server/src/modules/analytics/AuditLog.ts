export interface AuditLog {
  id?: number;
  actionType: string;
  details: string;
  performedBy: string;
  timestamp?: string;
  pendingDeletion?: boolean;
  deleteScheduledAt?: string;
}
