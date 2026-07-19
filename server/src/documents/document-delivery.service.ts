import { getOrderById, getAllBookings } from '../db';
import { DocumentService } from './document.service';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export interface DeliveryOptions {
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
}

export interface DeliveryResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string; // For Ethereal Mail preview in dev
  error?: string;
}

export class DocumentDeliveryService {
  /**
   * Generates PDF for a document type and ID.
   */
  public static async generateDocument(
    type: 'invoice' | 'booking' | 'quotation',
    id: string
  ): Promise<{ filename: string; pdfBuffer: Buffer; htmlContent: string }> {
    let htmlContent = '';
    let filename = `document_${id}.pdf`;

    if (type === 'invoice') {
      const order = await getOrderById(id);
      if (!order) {
        throw new Error(`Order not found for ID: ${id}`);
      }
      htmlContent = await DocumentService.renderDocumentHtml('invoice', order);
      filename = `Invoice-${order.id.slice(-6).toUpperCase()}.pdf`;
    } else if (type === 'booking') {
      const bookings = await getAllBookings();
      const booking = bookings.find((b: any) => b.id === id) as any;
      if (!booking) {
        throw new Error(`Booking not found for ID: ${id}`);
      }
      const bookingIdSuffix = booking.id.slice(-6).toUpperCase();
      const dateLogged = booking.timestamp ? new Date(booking.timestamp).toLocaleDateString('en-IN') : 'N/A';
      const serviceRate = 1499;
      const gstAmount = serviceRate * 0.18;
      const subtotal = serviceRate - gstAmount;

      htmlContent = `
<html>
<head>
  <style>
    body { font-family: sans-serif; color: #333; margin: 40px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; }
    .title { font-size: 20px; text-transform: uppercase; color: #666; text-align: right; }
    .meta { margin-top: 5px; font-size: 12px; color: #888; }
    .details { display: flex; justify-content: space-between; margin-top: 30px; font-size: 13px; }
    .details-block { width: 45%; }
    .details-title { font-size: 11px; color: #999; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 40px; font-size: 13px; }
    th { background: #f9f9f9; border-bottom: 2px solid #eee; padding: 10px; text-align: left; color: #555; }
    td { padding: 12px 10px; border-bottom: 1px solid #eee; }
    .total-section { display: flex; justify-content: flex-end; margin-top: 30px; font-size: 13px; }
    .total-table { width: 250px; }
    .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
    .grand-total { font-size: 16px; font-weight: bold; border-top: 1px solid #eee; padding-top: 10px; color: #000; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">ARCUS SERVICES</div>
      <div class="meta" style="margin-top: 5px; line-height: 1.4;">
        Contractor Placement & Site Maintenance Hub<br/>
        MG Road, Industrial Area Phase 2<br/>
        Bangalore, Karnataka - 560025<br/>
        services@arcus.com | Support: +91 80 4912 3456
      </div>
    </div>
    <div style="text-align: right;">
      <div class="title" style="font-size: 20px; font-weight: bold; color: #1e293b;">Service Tax Invoice</div>
      <div class="meta" style="margin-top: 10px; line-height: 1.4;">
        <strong>Invoice No:</strong> INV-SRV-${bookingIdSuffix}<br/>
        <strong>Date Logged:</strong> ${dateLogged}<br/>
        <strong>Booking ID:</strong> ${booking.id}
      </div>
    </div>
  </div>

  <div class="details" style="margin-top: 30px;">
    <div class="details-block">
      <div class="details-title">Billed To (Client)</div>
      <strong>${booking.name}</strong><br/>
      Phone: ${booking.phone}
    </div>
    <div class="details-block" style="text-align: right;">
      <div class="details-title">Service Schedule</div>
      <strong>Appointment Date & Time</strong><br/>
      ${booking.date}
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-top: 45px;">
    <thead>
      <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
        <th style="padding: 12px; text-align: left;">Service Description / Code</th>
        <th style="padding: 12px; text-align: right;">Visitation & Consulting Fee</th>
        <th style="padding: 12px; text-align: center;">Qty</th>
        <th style="padding: 12px; text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <strong>${booking.service_name}</strong>
          ${booking.notes ? '<div style="font-size: 11px; color: #64748b; margin-top: 5px;">Instructions: ' + booking.notes + '</div>' : ''}
        </td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">₹1,499.00</td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">1</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">₹1,499.00</td>
      </tr>
    </tbody>
  </table>

  <div class="total-section" style="margin-top: 35px; display: flex; justify-content: flex-end;">
    <table style="width: 250px; margin-top: 0; font-size: 13px;">
      <tr>
        <td style="padding: 6px 0; border: none;">Subtotal</td>
        <td style="padding: 6px 0; text-align: right; border: none;">₹${subtotal.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; border: none;">GST (18%)</td>
        <td style="padding: 6px 0; text-align: right; border: none;">₹${gstAmount.toLocaleString('en-IN')}</td>
      </tr>
      <tr style="font-size: 15px; font-weight: bold; border-top: 2px solid #e2e8f0;">
        <td style="padding: 10px 0; border: none;">Total Service Amount</td>
        <td style="padding: 10px 0; text-align: right; border: none; color: #10b981;">₹${serviceRate.toLocaleString('en-IN')}</td>
      </tr>
    </table>
  </div>
</body>
</html>
      `;
      filename = `Service-Invoice-${bookingIdSuffix}.pdf`;
    } else {
      throw new Error(`Unsupported document type: ${type}`);
    }

    const pdfBuffer = await DocumentService.generatePdf(htmlContent);
    return { filename, pdfBuffer, htmlContent };
  }

  /**
   * Central document delivery gateway.
   */
  public static async deliverDocument(payload: {
    type: 'invoice' | 'booking' | 'quotation';
    id: string;
    method: 'email' | 'whatsapp';
    recipient: string;
    options?: DeliveryOptions;
  }): Promise<DeliveryResult> {
    const { type, id, method, recipient, options } = payload;
    console.log(`[DocumentDeliveryService] Initiating delivery. type=${type}, id=${id}, method=${method}, recipient=${recipient}`);

    const { filename, pdfBuffer } = await this.generateDocument(type, id);

    if (method === 'email') {
      let subject = `Arcus Document Delivery - ${filename}`;
      let textBody = `Hello, please find attached your document: ${filename}.`;

      if (type === 'invoice') {
        subject = `Arcus Tax Invoice - INV-${id.slice(-6).toUpperCase()}`;
        textBody = `Hello, please find attached the official Tax Invoice for Order #${id}.`;
      } else if (type === 'booking') {
        subject = `Arcus Service Tax Invoice - INV-SRV-${id.slice(-6).toUpperCase()}`;
        textBody = `Hello, please find attached your Service Tax Invoice for Booking #${id}.`;
      }

      // Format professional branded html template
      const formattedHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px;">
            <h2 style="color: #0f172a; margin: 0; font-weight: 800; letter-spacing: 0.05em;">ARCUS CONSTRUCTION COMMERCE</h2>
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Professional Document Delivery</span>
          </div>
          <div style="line-height: 1.6; font-size: 14px;">
            <p>Dear Valued Partner,</p>
            <p>${textBody}</p>
            <p style="margin-top: 25px; font-size: 12px; color: #64748b; background-color: #f8fafc; padding: 12px; border-left: 4px solid #0f172a;">
              <strong>Note:</strong> This is a secure system-generated transaction document. The official PDF copy is attached directly to this email for your records.
            </p>
          </div>
          <div style="margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 15px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.4;">
            Arcus Building Materials & Logistics Hub<br/>
            MG Road, Industrial Area Phase 2, Bangalore, Karnataka - 560025<br/>
            Support: support@arcus.com | Support Hotlines: +91 80 4912 3456
          </div>
        </div>
      `;

      return await this.sendEmail(recipient, subject, formattedHtml, pdfBuffer, filename, options);
    } else if (method === 'whatsapp') {
      return await this.sendWhatsApp(recipient, `Your Arcus Document ${filename} is attached.`, pdfBuffer, filename);
    } else {
      throw new Error(`Unsupported delivery method: ${method}`);
    }
  }

  /**
   * Dispatches email via Nodemailer/SMTP with retry mechanism.
   */
  private static async sendEmail(
    to: string,
    subject: string,
    html: string,
    pdfBuffer: Buffer,
    filename: string,
    options?: DeliveryOptions
  ): Promise<DeliveryResult> {
    const maxRetries = 3;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxRetries) {
      attempt++;
      try {
        console.log(`[DocumentDeliveryService] Email delivery attempt ${attempt}/${maxRetries} to ${to}...`);

        // Resolve transporter configuration (pre-existing Ethereal test account workflow)
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const mailOptions: any = {
          from: '"Arcus Document Delivery" <noreply@arcus.com>',
          to: to,
          subject: subject,
          html: html,
          attachments: [
            {
              filename: filename,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        };

        if (options) {
          if (options.cc && options.cc.length > 0) mailOptions.cc = options.cc.join(', ');
          if (options.bcc && options.bcc.length > 0) mailOptions.bcc = options.bcc.join(', ');
          if (options.replyTo) mailOptions.replyTo = options.replyTo;
        }

        const info = await transporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

        console.log(`[DocumentDeliveryService] Email sent successfully on attempt ${attempt}. MsgId: ${info.messageId}`);
        return {
          success: true,
          messageId: info.messageId,
          previewUrl,
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[DocumentDeliveryService] Email delivery attempt ${attempt} failed:`, err.message);
        if (attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, 1000 * attempt)); // Exponential backoff
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Email delivery failed after max retries.',
    };
  }

  /**
   * Delivers WhatsApp document via Cloud API (or logs simulation in dev).
   */
  private static async sendWhatsApp(
    phone: string,
    caption: string,
    pdfBuffer: Buffer,
    filename: string
  ): Promise<DeliveryResult> {
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    // Normalize phone number (remove +, spaces)
    const normalizedPhone = phone.replace(/[+\s-]/g, '');

    if (apiToken && phoneNumberId) {
      // Production path for WhatsApp Cloud API integration
      try {
        console.log(`[DocumentDeliveryService] Dispatching actual WhatsApp Cloud API request to ${normalizedPhone}...`);
        
        // 1. Upload Media
        const formData = new FormData();
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        formData.append('file', blob, filename);
        formData.append('type', 'application/pdf');
        formData.append('messaging_product', 'whatsapp');

        const uploadRes = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`
          },
          body: formData
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(`Media upload failed: ${JSON.stringify(errData)}`);
        }

        const { id: mediaId } = await uploadRes.json() as { id: string };
        console.log(`[DocumentDeliveryService] Media uploaded successfully. Media ID: ${mediaId}`);

        // 2. Send Document Message
        const sendRes = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: normalizedPhone,
            type: 'document',
            document: {
              id: mediaId,
              caption: caption,
              filename: filename
            }
          })
        });

        if (!sendRes.ok) {
          const errData = await sendRes.json();
          throw new Error(`Message sending failed: ${JSON.stringify(errData)}`);
        }

        const sendData = await sendRes.json() as { messages?: { id: string }[] };
        const messageId = sendData.messages?.[0]?.id;

        return {
          success: true,
          messageId
        };
      } catch (err: any) {
        console.error('[DocumentDeliveryService] WhatsApp Cloud API delivery error:', err);
        return {
          success: false,
          error: err.message
        };
      }
    } else {
      // Dev/Simulation path: Log and generate mock delivery confirmation
      console.log(`\n==================================================`);
      console.log(`[WHATSAPP DELIVERY SIMULATION]`);
      console.log(`To: ${normalizedPhone}`);
      console.log(`Document: ${filename}`);
      console.log(`Buffer Size: ${pdfBuffer.length} bytes`);
      console.log(`Caption: ${caption}`);
      console.log(`Status: SIMULATED SUCCESS (WHATSAPP_API_TOKEN / WHATSAPP_PHONE_NUMBER_ID not configured)`);
      console.log(`==================================================\n`);

      const messageId = `wamid.HBgL${crypto.randomBytes(8).toString('hex')}==`;
      return {
        success: true,
        messageId
      };
    }
  }
}
export default DocumentDeliveryService;
