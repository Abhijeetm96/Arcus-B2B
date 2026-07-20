import nodemailer from 'nodemailer';

export async function sendEmailWithAttachment(
  to: string,
  subject: string,
  html: string,
  attachmentBuffer: Buffer,
  filename: string
): Promise<string> {
  // Generate a test account on Ethereal Mail for local testing/mocking
  const testAccount = await nodemailer.createTestAccount();
  
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Arcus Construction & Services" <noreply@arcus.com>',
    to: to,
    subject: subject,
    html: html,
    attachments: [
      {
        filename: filename,
        content: attachmentBuffer,
      }
    ]
  });

  console.log(`[Mailer] Message sent to ${to}: ${info.messageId}`);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`[Mailer] Preview URL: ${previewUrl}`);
  
  return previewUrl || '';
}

export async function sendSecurityAlertEmail(
  to: string,
  subject: string,
  html: string
): Promise<string> {
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"Arcus Security Team" <security@arcus.com>',
      to: to,
      subject: subject,
      html: html,
    });

    console.log(`[SECURITY MAILER] Lockout email sent to ${to}: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[SECURITY MAILER] Preview URL: ${previewUrl}`);
    }
    return previewUrl || '';
  } catch (err) {
    console.error('[SECURITY MAILER] Failed to dispatch alert email:', err);
    return '';
  }
}
