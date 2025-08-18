const nodemailer = require('nodemailer');
require('dotenv').config();
const cron = require('node-cron');

const scheduleJob = (cronTime, jobFn, jobName = "Unnamed Job") => {
    cron.schedule(cronTime, async () => {
        console.log(`Running scheduled job: ${jobName}`);
        try {
            const result = await jobFn();
        } catch (err) {
            console.error(`${jobName} Error:`, err);
        }
    });
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Use Google's SMTP server
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false,
  },
});

/**
 * Send email
 * @param {string} to - Recipient(s)
 * @param {string} subject - Email subject
 * @param {string} htmlBody - HTML content for the email
 * @param {string} [cc] - CC recipient(s) (optional)
 * @param {string} [bcc] - BCC recipient(s) (optional)
 */
const sendEmail = async ({ to, subject, htmlBody, cc = '', bcc = '' }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to,
      cc,
      bcc,
      subject,
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);
    return { status: 200, message: "Email sent successfully!", response: info.response };
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};
  
const processDataForEmail = (data) => {
  const to = data.to;
  const subject = data.subject || `Notification for ${data.name || 'User'}`;
  const htmlBody = data.htmlBody;

  const cc = Array.isArray(data.cc) ? data.cc.join(',') : data.cc || ''; 
  const bcc = Array.isArray(data.bcc) ? data.bcc.join(',') : data.bcc || '';

  return { to, subject, htmlBody, cc, bcc };
};
  
module.exports = { sendEmail,processDataForEmail, scheduleJob };
