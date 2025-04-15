import nodemailer from 'nodemailer';
import { promisify } from 'util';
import { randomBytes } from 'crypto';

// Configure email transport
const createTransport = () => {
  // For development/testing purposes
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.EMAIL_PASS || 'ethereal_pass'
      }
    });
  }

  // For production
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'noreply@foodshare.org',
      pass: process.env.EMAIL_PASS || 'email_password'
    }
  });
};

// Create email transport
const transporter = createTransport();

// Basic email template
const createEmailTemplate = (content: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }
        .header h1 {
          color: #4caf50;
          margin: 0;
        }
        .content {
          padding: 20px 0;
        }
        .button {
          display: inline-block;
          background-color: #4caf50;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #777;
          font-size: 12px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FoodShare</h1>
        <p>Connecting food with those who need it most</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} FoodShare. All rights reserved.</p>
        <p>This email was sent to you because you registered on our platform.</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send verification email to user
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const appDomain = process.env.APP_DOMAIN || 'http://localhost:5000';
  const verificationUrl = `${appDomain}/verify?token=${token}`;
  
  const content = `
    <h2>Welcome to FoodShare!</h2>
    <p>Thank you for registering. Please verify your email address to complete your registration.</p>
    <p>
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </p>
    <p>Or copy and paste this link in your browser: ${verificationUrl}</p>
    <p>This link will expire in 24 hours.</p>
  `;
  
  const mailOptions = {
    from: '"FoodShare" <noreply@foodshare.org>',
    to: email,
    subject: 'Verify Your Email Address',
    html: createEmailTemplate(content)
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send password reset email to user
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const appDomain = process.env.APP_DOMAIN || 'http://localhost:5000';
  const resetUrl = `${appDomain}/reset-password?token=${token}`;
  
  const content = `
    <h2>Reset Your Password</h2>
    <p>You requested a password reset. Click the button below to create a new password:</p>
    <p>
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    <p>Or copy and paste this link in your browser: ${resetUrl}</p>
    <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
  `;
  
  const mailOptions = {
    from: '"FoodShare" <noreply@foodshare.org>',
    to: email,
    subject: 'Reset Your Password',
    html: createEmailTemplate(content)
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send notification email to volunteer for accepted pickup
 */
export async function sendPickupConfirmationEmail(email: string, pickup: any): Promise<void> {
  const appDomain = process.env.APP_DOMAIN || 'http://localhost:5000';
  const dashboardUrl = `${appDomain}/volunteer-dashboard`;
  
  const content = `
    <h2>Pickup Confirmation</h2>
    <p>You have successfully accepted a food pickup:</p>
    <p><strong>Food:</strong> ${pickup.foodListing.title}</p>
    <p><strong>Pickup Date:</strong> ${new Date(pickup.foodListing.pickupDate).toLocaleDateString()}</p>
    <p><strong>Pickup Time:</strong> ${pickup.foodListing.pickupWindow}</p>
    <p><strong>Pickup Address:</strong> ${pickup.foodListing.pickupAddress}</p>
    <p><strong>Delivery Location:</strong> ${pickup.foodListing.deliveryLocation}</p>
    <p>
      <a href="${dashboardUrl}" class="button">View on Dashboard</a>
    </p>
    <p>Thank you for helping reduce food waste and hunger in our community!</p>
  `;
  
  const mailOptions = {
    from: '"FoodShare" <noreply@foodshare.org>',
    to: email,
    subject: 'Pickup Confirmation',
    html: createEmailTemplate(content)
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Pickup confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending pickup confirmation email:', error);
    throw new Error('Failed to send pickup confirmation email');
  }
}

/**
 * Send notification email to NGO for pickup assignment
 */
export async function sendNgoPickupAssignmentEmail(email: string, pickup: any): Promise<void> {
  const appDomain = process.env.APP_DOMAIN || 'http://localhost:5000';
  const dashboardUrl = `${appDomain}/ngo-dashboard`;
  
  const content = `
    <h2>Volunteer Assigned to Your Food Listing</h2>
    <p>A volunteer has been assigned to pick up your food donation:</p>
    <p><strong>Food:</strong> ${pickup.foodListing.title}</p>
    <p><strong>Volunteer:</strong> ${pickup.volunteer.firstName} ${pickup.volunteer.lastName}</p>
    <p><strong>Pickup Date:</strong> ${new Date(pickup.foodListing.pickupDate).toLocaleDateString()}</p>
    <p><strong>Pickup Time:</strong> ${pickup.foodListing.pickupWindow}</p>
    <p>
      <a href="${dashboardUrl}" class="button">View on Dashboard</a>
    </p>
    <p>Thank you for partnering with FoodShare to reduce food waste!</p>
  `;
  
  const mailOptions = {
    from: '"FoodShare" <noreply@foodshare.org>',
    to: email,
    subject: 'Volunteer Assigned to Your Food Donation',
    html: createEmailTemplate(content)
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`NGO pickup assignment email sent to ${email}`);
  } catch (error) {
    console.error('Error sending NGO pickup assignment email:', error);
    throw new Error('Failed to send NGO pickup assignment email');
  }
}
