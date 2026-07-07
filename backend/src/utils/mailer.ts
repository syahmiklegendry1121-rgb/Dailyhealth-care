import nodemailer from 'nodemailer';

// Configure transporter
// In a production environment, you would supply actual SMTP details.
// For local testing, we fall back to nodemailer ethereal SMTP.
let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    console.log('SMTP mail transporter initialized with custom credentials.');
  } else {
    // Local development fallback using ethereal.email
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`Mock Ethereal SMTP mail transporter initialized:`);
      console.log(`User: ${testAccount.user}`);
      console.log(`Pass: ${testAccount.pass}`);
    } catch (err) {
      console.error('Failed to create Ethereal SMTP test account. Falling back to console logging.', err);
      // Stub transporter
      transporter = {
        sendMail: async (options: any) => {
          console.log('\n--- EMAIL REPORT SENT (MOCK/STUB) ---');
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Content:\n${options.text || options.html}`);
          console.log('-------------------------------------\n');
          return { messageId: 'stub-message-id' };
        }
      } as any;
    }
  }

  return transporter!;
}

export interface EmailReportData {
  name: string;
  email: string;
  date: string;
  score: number;
  rating: string;
  sleep: { duration: number; quality: number };
  stress: number;
  water: number;
  steps: number;
  calories: number;
  mood: string;
  insights: string[];
}

export async function sendDailyHealthReport(data: EmailReportData) {
  const mailTransporter = await getTransporter();

  const insightsHtml = data.insights.map(ins => `<li style="margin-bottom: 8px; color: #4b5563;">✨ ${ins}</li>`).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Daily Health Report Summary</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Daily Health Summary</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">${data.date}</p>
          </div>

          <!-- Content Body -->
          <div style="padding: 24px;">
            <p style="font-size: 16px; color: #1f2937; margin-bottom: 24px;">Hello <strong>${data.name}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">Here is your personalized health assessment for today. Keeping track of your habits is the first step toward a healthier life!</p>

            <!-- Score Widget -->
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Overall Wellness Score</span>
              <div style="font-size: 48px; font-weight: 800; color: #3b82f6; margin: 8px 0;">${data.score}/100</div>
              <span style="display: inline-block; background-color: ${data.score >= 70 ? '#dcfce7' : '#fee2e2'}; color: ${data.score >= 70 ? '#15803d' : '#b91c1c'}; font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">
                ${data.rating}
              </span>
            </div>

            <!-- Health Metrics Grid -->
            <h3 style="font-size: 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px;">Key Metrics</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Sleep</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #1e293b;">${data.sleep.duration} hrs (Quality: ${data.sleep.quality}/10)</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Stress Level</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #1e293b;">${data.stress}/10</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Water Intake</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #1e293b;">${data.water} glasses</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Steps Walked</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #1e293b;">${data.steps.toLocaleString()} steps</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Calories Consumed</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #1e293b;">${data.calories} kcal</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Mood Today</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #1e293b; font-size: 18px;">${data.mood}</td>
              </tr>
            </table>

            <!-- AI Insights -->
            <h3 style="font-size: 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px;">AI Personalized Insights</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              ${insightsHtml}
            </ul>

          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0 0 8px 0;">Daily Healthcare Portal © 2026. All rights reserved.</p>
            <p style="margin: 0;">You received this email because you opted in to receive daily health updates from your dashboard settings.</p>
          </div>

        </div>
      </body>
    </html>
  `;

  const info = await mailTransporter.sendMail({
    from: `"Daily Healthcare Portal" <${process.env.SMTP_FROM || 'no-reply@dailyhealth.com'}>`,
    to: data.email,
    subject: `Daily Health Summary - ${data.date} (${data.rating}: ${data.score}/100)`,
    html: htmlContent,
  });

  return info;
}
