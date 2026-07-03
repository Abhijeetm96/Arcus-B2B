import { EventBus } from '../domain/shared/EventBus';
import { DashboardRepository } from '../database/repositories/dashboard.repository';
import { NotificationProvider } from '../domain/shared/NotificationProvider';

export function registerEventHandlers(
  dashboardRepo: DashboardRepository,
  notificationProvider: NotificationProvider
) {
  const eventBus = EventBus.getInstance();

  const evictMetrics = (payload: any) => {
    console.log(`[EventBus Handler] Evicting dashboard cache for event:`, JSON.stringify(payload));
    dashboardRepo.evictCache();
  };

  eventBus.subscribe('RFQ_CREATED', evictMetrics);
  eventBus.subscribe('RFQ_UPDATED', evictMetrics);
  eventBus.subscribe('RFQ_DELETED', evictMetrics);
  eventBus.subscribe('RFQ_ASSIGNMENT_CHANGED', evictMetrics);

  eventBus.subscribe('RFQ_ASSIGNMENT_CHANGED', async (payload: { rfqId: string; rfqNumber: string; primaryOwnerId: string; assignedById: string; notes?: string }) => {
    try {
      await notificationProvider.sendNotification(
        payload.primaryOwnerId,
        'New RFQ Assignment',
        `You have been assigned as the primary owner for RFQ ${payload.rfqNumber}.`,
        { rfqId: payload.rfqId, rfqNumber: payload.rfqNumber, type: 'ASSIGNMENT' }
      );
    } catch (err: any) {
      console.error('[EventBus Handler] Failed to dispatch assignment notification:', err.message);
    }
  });

  eventBus.subscribe('COMMENT_ADDED', async (payload: { rfqId: string; rfqNumber: string; commentId: string; authorName: string; text: string; watchers: string[] }) => {
    try {
      const { watchers, rfqNumber, authorName, text, rfqId } = payload;
      for (const watcherId of watchers) {
        await notificationProvider.sendNotification(
          watcherId,
          `New Comment on ${rfqNumber}`,
          `${authorName} commented: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`,
          { rfqId, commentId: payload.commentId, type: 'COMMENT' }
        );
      }
    } catch (err: any) {
      console.error('[EventBus Handler] Failed to dispatch comment notification:', err.message);
    }
  });

  console.log('✅ Decoupled EventBus handlers registered successfully.');
}
