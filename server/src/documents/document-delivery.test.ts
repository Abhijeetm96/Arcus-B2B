import { test, describe, before, after, mock } from 'node:test';
import assert from 'node:assert';
import nodemailer from 'nodemailer';
import { DocumentDeliveryService } from './document-delivery.service';
import { DocumentService } from './document.service';
import * as orderService from '../modules/orders/OrderService';
import * as rfqService from '../modules/rfq/RFQService';

describe('Document Delivery Engine Tests', () => {
  before(() => {
    // 1. Mock Database Layers
    mock.method(orderService, 'getOrderById', async (id: string) => {
      if (id === '550e8400-e29b-41d4-a716-446655440000') {
        return {
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId: 'client@example.com',
          amount: 25000,
          gstNumber: '29ABCDE1234F1Z5',
          shippingAddress: '123 Test St, Bangalore',
          items: [
            { productId: 'prod-1', productName: 'Cement Bag', quantity: 100, price: 250 }
          ]
        };
      }
      return null;
    });

    mock.method(rfqService, 'getAllBookings', async () => {
      return [
        {
          id: '770e8400-e29b-41d4-a716-446655440000',
          name: 'John Client',
          phone: '+919999999999',
          email: 'john@example.com',
          service_name: 'Plumbing Service',
          timestamp: new Date().toISOString(),
          date: '2026-07-25 10:00 AM',
          notes: 'Fix leak in kitchen sink'
        }
      ];
    });

    // 2. Mock PDF Generation to bypass Puppeteer chromium dependency
    mock.method(DocumentService, 'generatePdf', async () => {
      return Buffer.from('%PDF-1.4 mock-pdf-buffer');
    });

    // 3. Mock Nodemailer SMTP Transporter
    mock.method(nodemailer, 'createTestAccount', async () => {
      return { user: 'mock-user', pass: 'mock-pass' };
    });

    mock.method(nodemailer, 'createTransport', () => {
      return {
        sendMail: async (options: any) => {
          return { messageId: 'mock-message-id-12345' };
        }
      };
    });
  });

  after(() => {
    mock.reset();
  });

  test('should generate correct PDF filename and buffer for an order invoice', async () => {
    const { filename, pdfBuffer } = await DocumentDeliveryService.generateDocument(
      'invoice',
      '550e8400-e29b-41d4-a716-446655440000'
    );
    
    assert.strictEqual(filename, 'Invoice-440000.pdf');
    assert.ok(pdfBuffer.length > 0);
    assert.strictEqual(pdfBuffer.toString(), '%PDF-1.4 mock-pdf-buffer');
  });

  test('should generate correct PDF filename and buffer for a booking invoice', async () => {
    const { filename, pdfBuffer } = await DocumentDeliveryService.generateDocument(
      'booking',
      '770e8400-e29b-41d4-a716-446655440000'
    );
    
    assert.strictEqual(filename, 'Service-Invoice-440000.pdf');
    assert.ok(pdfBuffer.length > 0);
    assert.strictEqual(pdfBuffer.toString(), '%PDF-1.4 mock-pdf-buffer');
  });

  test('should deliver order invoice via email successfully', async () => {
    const result = await DocumentDeliveryService.deliverDocument({
      type: 'invoice',
      id: '550e8400-e29b-41d4-a716-446655440000',
      method: 'email',
      recipient: 'client@example.com'
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.messageId, 'mock-message-id-12345');
  });

  test('should deliver booking invoice via email successfully', async () => {
    const result = await DocumentDeliveryService.deliverDocument({
      type: 'booking',
      id: '770e8400-e29b-41d4-a716-446655440000',
      method: 'email',
      recipient: 'john@example.com'
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.messageId, 'mock-message-id-12345');
  });

  test('should simulate WhatsApp delivery successfully in development context', async () => {
    const result = await DocumentDeliveryService.deliverDocument({
      type: 'invoice',
      id: '550e8400-e29b-41d4-a716-446655440000',
      method: 'whatsapp',
      recipient: '+919999999999'
    });

    assert.strictEqual(result.success, true);
    assert.ok(result.messageId?.startsWith('wamid.HBgL'));
  });
});
