// Email service for sending HIPAA-compliant transactional emails
// Uses Replit SendGrid Integration
import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email };
}

async function getUncachableSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const msg = {
      to: options.to,
      from: options.from || fromEmail,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };
    
    await client.send(msg);
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
}

// HIPAA-Compliant Red Flag Alert - No PHI in subject lines
export async function sendRedFlagAlert(options: {
  motherName: string;
  providerEmail: string;
  providerName: string;
  alert: string;
  details: string;
  pregnancyWeek?: number | null;
  isPostpartum?: boolean;
}): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">The Heart Next Door</h1>
        <p style="color: white; margin: 5px 0 0 0;">Care Team Alert</p>
      </div>
      
      <div style="padding: 30px; background: #fff;">
        <p style="color: #374151; font-size: 16px;">Dear ${options.providerName},</p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-weight: bold;">
            A patient check-in requires your attention
          </p>
        </div>
        
        <p style="color: #374151; font-size: 14px;">
          <strong>Patient:</strong> ${options.motherName}<br>
          <strong>Status:</strong> ${options.isPostpartum ? 'Postpartum' : `Week ${options.pregnancyWeek || 'N/A'}`}
        </p>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="color: #991b1b; margin: 0 0 10px 0; font-weight: bold;">Alert: ${options.alert}</p>
          <p style="color: #374151; margin: 0;">${options.details}</p>
        </div>
        
        <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">
          This notification was generated because the patient reported concerning symptoms. 
          Please follow up at your earliest convenience.
        </p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          This message contains protected health information (PHI) and is intended only for the named recipient.
          If you received this in error, please delete it immediately and notify the sender.
        </p>
        <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
          The Heart Next Door - Maternal Wellness Support
        </p>
      </div>
    </div>
  `;

  const text = `
The Heart Next Door - Care Team Alert

Dear ${options.providerName},

A patient check-in requires your attention.

Patient: ${options.motherName}
Status: ${options.isPostpartum ? 'Postpartum' : `Week ${options.pregnancyWeek || 'N/A'}`}

Alert: ${options.alert}
${options.details}

This notification was generated because the patient reported concerning symptoms.
Please follow up at your earliest convenience.

---
This message contains protected health information (PHI) and is intended only for the named recipient.
If you received this in error, please delete it immediately and notify the sender.

The Heart Next Door - Maternal Wellness Support
  `;

  // HIPAA: No PHI in subject lines
  return sendEmail({
    to: options.providerEmail,
    subject: 'The Heart Next Door - Patient Check-In Alert',
    html,
    text,
  });
}

// Immediate "In Pain" alert - triggered when mom reports pain
export async function sendImmediatePainAlert(options: {
  motherName: string;
  motherLastName: string;
  providerEmail: string;
  providerName: string;
  feeling: string;
  bodyCare: string;
  feelingSupported: string;
  pregnancyWeek?: number | null;
  isPostpartum?: boolean;
}): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">⚠️ URGENT: Patient Alert</h1>
        <p style="color: white; margin: 5px 0 0 0;">The Heart Next Door</p>
      </div>
      
      <div style="padding: 30px; background: #fff;">
        <p style="color: #374151; font-size: 16px;">Dear ${options.providerName},</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <p style="color: #991b1b; margin: 0; font-weight: bold; font-size: 16px;">
            Patient has reported being in pain during check-in
          </p>
        </div>
        
        <div style="background: #f9fafb; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="color: #374151; margin: 0;">
            <strong>Patient:</strong> ${options.motherName} ${options.motherLastName}<br>
            <strong>Date/Time:</strong> ${new Date().toLocaleString()}<br>
            <strong>Status:</strong> ${options.isPostpartum ? 'Postpartum' : `Week ${options.pregnancyWeek || 'N/A'}`}
          </p>
        </div>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="color: #991b1b; margin: 0 0 10px 0; font-weight: bold;">Check-In Details:</p>
          <ul style="color: #374151; margin: 0; padding-left: 20px;">
            <li><strong>Current Feeling:</strong> ${options.feeling}</li>
            <li><strong>Body Care Today:</strong> ${options.bodyCare}</li>
            <li><strong>Support Level:</strong> ${options.feelingSupported}</li>
          </ul>
        </div>
        
        <p style="color: #dc2626; font-size: 14px; font-weight: bold; margin-top: 20px;">
          Recommended Action: Please follow up with this patient as soon as possible.
        </p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          This message contains protected health information (PHI) and is intended only for the named recipient.
          If you received this in error, please delete it immediately and notify the sender.
        </p>
        <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
          The Heart Next Door - Maternal Wellness Support
        </p>
      </div>
    </div>
  `;

  const text = `
URGENT: The Heart Next Door - Patient Alert

Dear ${options.providerName},

Patient has reported being in pain during check-in.

Patient: ${options.motherName} ${options.motherLastName}
Date/Time: ${new Date().toLocaleString()}
Status: ${options.isPostpartum ? 'Postpartum' : `Week ${options.pregnancyWeek || 'N/A'}`}

Check-In Details:
- Current Feeling: ${options.feeling}
- Body Care Today: ${options.bodyCare}
- Support Level: ${options.feelingSupported}

Recommended Action: Please follow up with this patient as soon as possible.

---
This message contains protected health information (PHI) and is intended only for the named recipient.
If you received this in error, please delete it immediately and notify the sender.

The Heart Next Door - Maternal Wellness Support
  `;

  // HIPAA: No PHI in subject lines
  return sendEmail({
    to: options.providerEmail,
    subject: 'The Heart Next Door - Urgent Patient Alert',
    html,
    text,
  });
}

// Weekly Summary Email to Care Team
export interface WeeklyCheckIn {
  feeling: string;
  bodyCare: string;
  feelingSupported: string;
  createdAt: Date;
}

export async function sendWeeklySummaryEmail(options: {
  motherName: string;
  motherLastName: string;
  providerEmail: string;
  providerName: string;
  providerRole: 'ob-midwife' | 'doula';
  weeklyCheckIns: WeeklyCheckIn[];
  pregnancyWeek?: number | null;
  isPostpartum?: boolean;
}): Promise<boolean> {
  if (options.weeklyCheckIns.length === 0) {
    console.log('No check-ins to summarize for', options.motherName);
    return false;
  }

  const concerningEmotions = ['in-pain', 'disconnected', 'overwhelmed', 'anxious'];
  const hasConcerns = options.weeklyCheckIns.some(c => concerningEmotions.includes(c.feeling));
  
  // Calculate summary statistics
  const feelingCounts: Record<string, number> = {};
  options.weeklyCheckIns.forEach(checkIn => {
    feelingCounts[checkIn.feeling] = (feelingCounts[checkIn.feeling] || 0) + 1;
  });
  
  const feelingSummary = Object.entries(feelingCounts)
    .map(([feeling, count]) => `${feeling}: ${count} day(s)`)
    .join(', ');

  const checkInRows = options.weeklyCheckIns.map(c => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${new Date(c.createdAt).toLocaleDateString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; ${concerningEmotions.includes(c.feeling) ? 'color: #dc2626; font-weight: bold;' : ''}">${c.feeling}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${c.bodyCare}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${c.feelingSupported}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">The Heart Next Door</h1>
        <p style="color: white; margin: 5px 0 0 0;">Weekly Wellness Summary</p>
      </div>
      
      <div style="padding: 30px; background: #fff;">
        <p style="color: #374151; font-size: 16px;">Dear ${options.providerName},</p>
        
        <p style="color: #374151; font-size: 14px;">
          Here is the weekly wellness summary for your patient:
        </p>
        
        <div style="background: #f3f4f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="color: #374151; margin: 0;">
            <strong>Patient:</strong> ${options.motherName} ${options.motherLastName}<br>
            <strong>Status:</strong> ${options.isPostpartum ? 'Postpartum' : `Week ${options.pregnancyWeek || 'N/A'}`}<br>
            <strong>Check-ins this week:</strong> ${options.weeklyCheckIns.length}
          </p>
        </div>
        
        ${hasConcerns ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-weight: bold;">
            Note: Some concerning feelings were reported this week
          </p>
        </div>
        ` : ''}
        
        <div style="background: #fdf2f8; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h3 style="color: #be185d; margin: 0 0 15px 0;">Weekly Mood Summary</h3>
          <p style="color: #374151; margin: 0;">${feelingSummary}</p>
        </div>
        
        <h3 style="color: #374151; margin: 20px 0 15px 0;">Daily Check-In Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Date</th>
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Feeling</th>
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Body Care</th>
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Support</th>
            </tr>
          </thead>
          <tbody>
            ${checkInRows}
          </tbody>
        </table>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          This message contains protected health information (PHI) and is intended only for the named recipient.
          If you received this in error, please delete it immediately and notify the sender.
        </p>
        <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
          The Heart Next Door - Maternal Wellness Support
        </p>
      </div>
    </div>
  `;

  const text = `
The Heart Next Door - Weekly Wellness Summary

Dear ${options.providerName},

Here is the weekly wellness summary for your patient:

Patient: ${options.motherName} ${options.motherLastName}
Status: ${options.isPostpartum ? 'Postpartum' : `Week ${options.pregnancyWeek || 'N/A'}`}
Check-ins this week: ${options.weeklyCheckIns.length}

Weekly Mood Summary:
${feelingSummary}

${hasConcerns ? 'Note: Some concerning feelings were reported this week.\n' : ''}

Daily Check-In Details:
${options.weeklyCheckIns.map(c => `- ${new Date(c.createdAt).toLocaleDateString()}: ${c.feeling}, Body Care: ${c.bodyCare}, Support: ${c.feelingSupported}`).join('\n')}

---
This message contains protected health information (PHI) and is intended only for the named recipient.
If you received this in error, please delete it immediately and notify the sender.

The Heart Next Door - Maternal Wellness Support
  `;

  // HIPAA: No PHI in subject lines
  return sendEmail({
    to: options.providerEmail,
    subject: 'The Heart Next Door - Weekly Patient Summary',
    html,
    text,
  });
}

export async function sendNotificationEmail(options: {
  recipientEmail: string;
  recipientName: string;
  title: string;
  message: string;
}): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">The Heart Next Door</h1>
      </div>
      
      <div style="padding: 30px; background: #fff;">
        <p style="color: #374151; font-size: 16px;">Hi ${options.recipientName},</p>
        <p style="color: #374151; font-weight: bold;">${options.title}</p>
        <p style="color: #374151;">${options.message}</p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 11px; margin: 0;">
          The Heart Next Door - Maternal Wellness Support
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: options.recipientEmail,
    subject: options.title,
    html,
  });
}
