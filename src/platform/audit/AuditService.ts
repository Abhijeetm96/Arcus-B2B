/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from '../../lib/api';

export interface AuditPayload {
  actionType: string;
  details: string;
  correlationId?: string;
  performedBy: string;
  ipAddress?: string;
  userSessionId: string;
  metadata?: Record<string, any>;
}

export class AuditService {
  private static getSessionId(): string {
    let session = sessionStorage.getItem('arcus_session_id');
    if (!session) {
      session = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('arcus_session_id', session);
    }
    return session;
  }

  /**
   * Tracks user interaction events and dispatches telemetry logs to the backend audit logs.
   */
  public static async logAction(
    actionType: string,
    details: string,
    correlationId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const token = localStorage.getItem('arcus_token');
      
      const payload: AuditPayload = {
        actionType,
        details,
        correlationId,
        performedBy: 'Current User', // Extracted from session context on backend
        userSessionId: this.getSessionId(),
        metadata: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          ...(metadata || {}),
        },
      };

      // Dispatches asynchronous telemetry log
      apiFetch('/api/compliance/audit/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }).catch((e) => console.error('Silent audit log error:', e));

    } catch (e) {
      console.error('Audit service tracking failure:', e);
    }
  }
}
