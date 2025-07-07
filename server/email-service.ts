import { createTransport } from 'nodemailer';

// Email service that can work with multiple providers
export class EmailService {
  private transporter: any;
  private fromEmail: string;
  private toEmail: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@replit.app';
    this.toEmail = 'tiny0.0thinker@gmail.com'; // Fixed destination email
    
    // Try to use SendGrid if available, otherwise use a fallback
    if (process.env.SENDGRID_API_KEY) {
      this.setupSendGrid();
    } else {
      this.setupFallback();
    }
  }

  private setupSendGrid() {
    this.transporter = createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  private setupFallback() {
    // Use a simple logging fallback when no email service is configured
    this.transporter = {
      sendMail: async (mailOptions: any) => {
        console.log('\n🔔 ===== NEW CONTACT MESSAGE =====');
        console.log('📧 From:', mailOptions.from);
        console.log('📨 To:', mailOptions.to);
        console.log('📋 Subject:', mailOptions.subject);
        console.log('💬 Content:', mailOptions.text || mailOptions.html);
        console.log('⏰ Timestamp:', new Date().toISOString());
        console.log('================================== 🔔\n');
        
        // Store in a simple file for backup
        const fs = await import('fs/promises');
        const emailLog = {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          content: mailOptions.text || mailOptions.html,
          timestamp: new Date().toISOString()
        };
        
        try {
          await fs.appendFile('contact-messages.log', JSON.stringify(emailLog) + '\n');
        } catch (error) {
          console.log('Could not save to log file:', error);
        }
        
        return { success: true, messageId: 'fallback-' + Date.now() };
      }
    };
  }

  async sendContactMessage(name: string, email: string, subject: string, message: string) {
    const emailSubject = subject ? `Contact Form: ${subject}` : 'New Contact Form Message';
    const emailContent = `
New contact form submission:

Name: ${name}
Email: ${email}
Subject: ${subject || 'No subject provided'}

Message:
${message}

--
Sent from AI Bullet Journal Contact Form
Time: ${new Date().toLocaleString()}
    `.trim();

    const mailOptions = {
      from: this.fromEmail,
      to: this.toEmail,
      subject: emailSubject,
      text: emailContent,
      replyTo: email
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();