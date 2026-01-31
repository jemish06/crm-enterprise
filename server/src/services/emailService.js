const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    // Create reusable transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection on startup
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('✅ Email service is ready to send emails');
    } catch (error) {
      logger.error('❌ Email service connection failed:', error.message);
      logger.warn('Emails will be logged but not sent');
    }
  }

  async sendInvitationEmail({ to, name, token }) {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const invitationLink = `${frontendUrl}/accept-invitation?token=${token}`;
      
      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'CRM Enterprise'}" <${process.env.FROM_EMAIL}>`,
        to,
        subject: 'You have been invited to join the team!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to CRM Enterprise!</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>You have been invited to join our CRM platform. Click the button below to accept your invitation and set up your account.</p>
                <div style="text-align: center;">
                  <a href="${invitationLink}" class="button">Accept Invitation</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${invitationLink}</p>
                <p><strong>Note:</strong> This invitation will expire in 7 days.</p>
              </div>
              <div class="footer">
                <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} CRM Enterprise. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Hi ${name},

You have been invited to join our CRM platform.

Click this link to accept your invitation:
${invitationLink}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} CRM Enterprise. All rights reserved.
        `.trim(),
      };

      // Try to send email
      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('='.repeat(60));
      logger.info('📧 INVITATION EMAIL SENT');
      logger.info('='.repeat(60));
      logger.info(`To: ${to}`);
      logger.info(`Name: ${name}`);
      logger.info(`Message ID: ${info.messageId}`);
      logger.info(`Status: ${info.response}`);
      logger.info('='.repeat(60));

      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Send invitation email error:', error);
      
      // Fallback: Log the invitation link
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const invitationLink = `${frontendUrl}/accept-invitation?token=${token}`;
      
      logger.warn('='.repeat(60));
      logger.warn('⚠️ EMAIL NOT SENT - Using fallback logging');
      logger.warn('='.repeat(60));
      logger.warn(`To: ${to}`);
      logger.warn(`Invitation Link: ${invitationLink}`);
      logger.warn('='.repeat(60));
      
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail({ to, name, token }) {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;
      
      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'CRM Enterprise'}" <${process.env.FROM_EMAIL}>`,
        to,
        subject: 'Password Reset Request',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center;">
                  <a href="${resetLink}" class="button">Reset Password</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #ef4444;">${resetLink}</p>
                <p><strong>Note:</strong> This link will expire in 1 hour.</p>
              </div>
              <div class="footer">
                <p>If you didn't request a password reset, please ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} CRM Enterprise. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${to} - Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Send password reset email error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail({ to, name }) {
    try {
      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'CRM Enterprise'}" <${process.env.FROM_EMAIL}>`,
        to,
        subject: 'Welcome to CRM Enterprise!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome Aboard! 🎉</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>Welcome to CRM Enterprise! We're excited to have you on board.</p>
                <p>Your account has been successfully created and you're ready to start managing your leads and customers.</p>
                <p>If you have any questions, feel free to reach out to our support team.</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} CRM Enterprise. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${to} - Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Send welcome email error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
