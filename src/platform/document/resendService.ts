/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from '../../lib/api';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded file string
    contentType: string;
  }>;
}

export interface WhatsAppPayload {
  phone: string;
  message: string;
  mediaUrl?: string;
}

export class ResendService {
  /**
   * Pushes a transaction document or email notification via the backend integration adapter.
   */
  public static async sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const token = localStorage.getItem('arcus_token');
      const response = await apiFetch('/api/compliance/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to dispatch email.');
      }

      return await response.json();
    } catch (err: any) {
      console.error('Email dispatch error:', err);
      return { success: false, error: err.message || 'Unknown network error.' };
    }
  }

  /**
   * Dispatches a WhatsApp notification with optional media invoice attachments.
   */
  public static async sendWhatsApp(payload: WhatsAppPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const token = localStorage.getItem('arcus_token');
      const response = await apiFetch('/api/compliance/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to dispatch WhatsApp message.');
      }

      return await response.json();
    } catch (err: any) {
      console.error('WhatsApp dispatch error:', err);
      return { success: false, error: err.message || 'Unknown network error.' };
    }
  }
}
