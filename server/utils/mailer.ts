import nodemailer from 'nodemailer';

// Create reusable transporter
const getTransporter = () => {
  const config = useRuntimeConfig();
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: 587,
    secure: false,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
};

const getTemplate = async (template: string): Promise<string> => {
  const isDev = process.env.NODE_ENV === 'development';
  const baseUrl = isDev ? 'http://localhost:3000' : process.env.APP_URL;
  
  try {
    const response = await fetch(`${baseUrl}/email-templates/${template}.html`);
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Template fetch error:', error);
    throw error;
  }
}

interface SendMailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, string>;
}

export async function sendMail({ to, subject, template, context }: SendMailOptions) {
  try {
    const config = useRuntimeConfig();
    // Fetch template
    let html = await getTemplate(template);

    // Replace placeholders with context values
    Object.entries(context).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    const transporter = getTransporter();

    // Send mail
    const info = await transporter.sendMail({
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.error('Send mail error:', error);
    throw error;
  }
}