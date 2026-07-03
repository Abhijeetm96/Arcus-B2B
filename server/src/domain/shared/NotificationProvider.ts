export interface NotificationProvider {
  sendNotification(userId: string, title: string, body: string, metadata?: any): Promise<void>;
}

export class MockNotificationProvider implements NotificationProvider {
  public async sendNotification(userId: string, title: string, body: string, metadata?: any): Promise<void> {
    console.log(`[NotificationProvider] Sending notification to user ${userId}:`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${body}`);
    console.log(`Metadata:`, JSON.stringify(metadata || {}));
  }
}
