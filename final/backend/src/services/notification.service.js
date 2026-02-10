const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Load from environment variables
const {
  EMAIL_USER,
  EMAIL_PASS,
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE
} = process.env;

/**
 * NotificationService handles sending alerts and updates
 * to admins, donors, and hospitals via Email, SMS, or in-app.
 */
class NotificationService {
  // Initialize email and SMS clients
  static mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });

  static smsClient = TWILIO_SID && TWILIO_AUTH_TOKEN
    ? new twilio(TWILIO_SID, TWILIO_AUTH_TOKEN)
    : null;

  /**
   * Send email notifications (for admins, hospitals, etc.)
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} message - Email body (HTML supported)
   */
  static async sendEmail(to, subject, message) {
    try {
      if (!EMAIL_USER || !EMAIL_PASS) {
        console.warn('⚠️ Email service not configured.');
        return;
      }

      await this.mailTransporter.sendMail({
        from: `"BloodVault Alerts" <${EMAIL_USER}>`,
        to,
        subject,
        html: `<div style="font-family: Arial, sans-serif;">
                <h3>${subject}</h3>
                <p>${message}</p>
                <hr />
                <small>This is an automated alert from BloodVault.</small>
              </div>`
      });

      console.log(`📧 Email sent successfully to ${to}`);
    } catch (error) {
      console.error('❌ Email send error:', error.message);
    }
  }

  /**
   * Send SMS notifications (for urgent alerts)
   * @param {string} phone - Recipient phone number (E.164 format)
   * @param {string} message - SMS text
   */
  static async sendSMS(phone, message) {
    try {
      if (!this.smsClient || !TWILIO_PHONE) {
        console.warn('⚠️ SMS service not configured.');
        return;
      }

      await this.smsClient.messages.create({
        body: message,
        from: TWILIO_PHONE,
        to: phone
      });

      console.log(`📱 SMS sent successfully to ${phone}`);
    } catch (error) {
      console.error('❌ SMS send error:', error.message);
    }
  }

  /**
   * Send system-level alerts (for logging, admin dashboards, etc.)
   * @param {string} type - 'info' | 'warning' | 'critical'
   * @param {string} message - Alert message
   * @param {object} meta - Optional metadata
   */
  static async sendSystemAlert(type, message, meta = {}) {
    console.log(`🚨 [${type.toUpperCase()} ALERT] ${message}`, meta);
    // You can extend this to store alerts in MongoDB for admin dashboards
  }

  /**
   * High-level method to notify about critical inventory or patients
   * @param {string} eventType - e.g., 'LOW_STOCK', 'CRITICAL_RECIPIENT'
   * @param {object} data - Event details
   */
  static async handleEvent(eventType, data) {
    switch (eventType) {
      case 'LOW_STOCK':
        await this.sendSystemAlert('warning', `Low inventory for ${data.bloodType} ${data.component}`, data);
        await this.sendEmail(
          data.adminEmail,
          `⚠️ Low Inventory: ${data.bloodType} ${data.component}`,
          `Only ${data.availableUnits} units remain. Immediate replenishment recommended.`
        );
        break;

      case 'CRITICAL_RECIPIENT':
        await this.sendSystemAlert('critical', `Critical patient: ${data.recipientName}`, data);
        await this.sendEmail(
          data.hospitalEmail,
          `🚨 Urgent Blood Required for ${data.recipientName}`,
          `Priority: ${data.priorityScore}<br>Blood Type: ${data.bloodType}<br>Please prepare units immediately.`
        );
        break;

      case 'NEW_DONOR':
        await this.sendEmail(
          data.donorEmail,
          '🎉 Welcome to BloodVault!',
          `Thank you ${data.donorName} for joining as a donor. You are now eligible to save lives!`
        );
        break;

      default:
        await this.sendSystemAlert('info', `Unhandled event: ${eventType}`, data);
        break;
    }
  }
}

module.exports = NotificationService;
