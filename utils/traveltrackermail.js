const { sendEmail } = require("./emailService");

const generateFormLink = (name, empId) => {
  const baseUrl = `${process.env.BASE_URL2.replace(/\/+$/, '')}/travel_details_form`;

  const now = new Date();
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 2,
    1,
    0, 0, 0
  );

  const expires = endOfMonth.toISOString();

  return {
    formUrl: `${baseUrl}/${encodeURIComponent(name)}/${empId}/${encodeURIComponent(expires)}`,
    expires
  };
};

const generateFormLinkforRemarks = (name, empId, res_id) => {
  const baseUrl = `${process.env.BASE_URL2.replace(/\/+$/, '')}/travel_remarks_form`;

  // Get current IST time
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET);

  // Add 4 days
  const expiresDate = new Date(nowIST);
  expiresDate.setDate(expiresDate.getDate() + 4);

  // Set expiry time to 00:00:00
  expiresDate.setHours(0, 0, 0, 0);

  const expiresISO = expiresDate.toISOString();

  return {
    formUrl: `${baseUrl}/${encodeURIComponent(name)}/${empId}/${res_id}/${encodeURIComponent(expiresISO)}`,
    expires: expiresISO
  };
};

const generateFormOtherLinkforRemarks = (name, empId, res_id) => {
  const baseUrl = `${process.env.BASE_URL2.replace(/\/+$/, '')}/travel_remarks_form`;

  // Get current IST time
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET);

  // Add 4 days
  const expiresDate = new Date(nowIST);
  expiresDate.setDate(expiresDate.getDate() + 4);

  // Set expiry time to 00:00:00
  expiresDate.setHours(0, 0, 0, 0);

  const expiresISO = expiresDate.toISOString();

  return {
    formUrl: `${baseUrl}/${encodeURIComponent(name)}/${empId}/${res_id}/${encodeURIComponent(expiresISO)}`,
    expires: expiresISO
  };
};

const sendQuaterlyMail = async (name, email, hrId, ccEmails = []) => {
  const { formUrl, expires } = generateFormLink(name, hrId);

  const readableExpiry = new Date(decodeURIComponent(expires)).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const htmlBody = `
    <p>Dear ${name},</p>
    <p>Please fill out your Travelling Report by clicking the link below:</p>
    <p><a href="${formUrl}">Click here to open the form</a></p>
    <p><strong>Note:</strong> This form will expire on <strong>${readableExpiry} IST</strong>.</p>
  `;

  const emailData = {
    to: email,
    cc: ccEmails,
    subject: `Travel Details Form Submission`,
    htmlBody: htmlBody
  };

  await sendEmail(emailData);
};

const sendQuaterlyReminderMail = async (name, email, hrId, ccEmails = []) => {
  const { formUrl, expires } = generateFormLink(name, hrId);

  const readableExpiry = new Date(decodeURIComponent(expires)).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const htmlBody = `
    <p>Dear ${name},</p>
    <p>Reminder to please fill out your Travelling Report by clicking the link below:</p>
    <p><a href="${formUrl}">Click here to open the form</a></p>
    <p><strong>Note:</strong> This form will expire on <strong>${readableExpiry} IST</strong>.</p>
  `;

  const emailData = {
    to: email,
    cc: ccEmails,
    subject: `Travel Details Form Submission Reminder`,
    htmlBody: htmlBody
  };

  await sendEmail(emailData);
};

const sendTenReminderMail = async (empName, email, fromDate, destination, ccEmails = []) => {
  const subject = `Travel Reminder: Upcoming Trip to ${destination}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p>Dear <strong>${empName}</strong>,</p>
      <p>This is a gentle reminder that you have a scheduled travel plan in <strong>10 days</strong>.</p>

      <table style="border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Destination</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${destination}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Travel Date</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date(fromDate).toLocaleDateString('en-IN')}</td>
        </tr>
      </table>

      <p>Please make necessary preparations for your journey.</p>

      <p>Best regards,<br/>Travel Tracker System</p>
    </div>
  `;

  await sendEmail({
    to: email,
    cc: ccEmails.length ? ccEmails : '',
    subject: subject,
    htmlBody: htmlBody
  });
};

const sendSixReminderMail = async (empName, email, fromDate, destination, ccEmails = []) => {
  const subject = `Travel Reminder: Upcoming Trip to ${destination}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p>Dear <strong>${empName}</strong>,</p>
      <p>This is a gentle reminder that you have a scheduled travel plan in <strong>10 days</strong>.</p>

      <table style="border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Destination</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${destination}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Travel Date</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date(fromDate).toLocaleDateString('en-IN')}</td>
        </tr>
      </table>

      <p>Please make necessary preparations for your journey.</p>

      <p>Best regards,<br/>Travel Tracker System</p>
    </div>
  `;

  await sendEmail({
    to: email,
    cc: ccEmails.length ? ccEmails : '',
    subject: subject,
    htmlBody: htmlBody
  });
};

const sendTwoReminderMail = async (empName, email, fromDate, destination, ccEmails = []) => {
  const subject = `Travel Reminder: Upcoming Trip to ${destination}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p>Dear <strong>${empName}</strong>,</p>
      <p>This is a gentle reminder that you have a scheduled travel plan in <strong>10 days</strong>.</p>

      <table style="border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Destination</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${destination}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Travel Date</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date(fromDate).toLocaleDateString('en-IN')}</td>
        </tr>
      </table>

      <p>Please make necessary preparations for your journey.</p>

      <p>Best regards,<br/>Travel Tracker System</p>
    </div>
  `;

  await sendEmail({
    to: email,
    cc: ccEmails.length ? ccEmails : '',
    subject: subject,
    htmlBody: htmlBody
  });
};

const sendFirstRemarksMail = async (
  name,
  email,
  from_date,
  hr_mantra_id,
  res_id,
  ccEmails = [] // ✅ default added
) => {

  const { formUrl, expires } = generateFormLinkforRemarks(name, hr_mantra_id, res_id);

  const visitDate = new Date(from_date);
  const formattedVisitDate = `${(visitDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${visitDate.getDate()
    .toString()
    .padStart(2, '0')}/${visitDate.getFullYear()}`;

  const expiresDate = new Date(decodeURIComponent(expires));
  const formattedExpiresDate = `${(expiresDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${expiresDate.getDate()
    .toString()
    .padStart(2, '0')}/${expiresDate.getFullYear()}`;

  const subject = `Submit Your Travel Remarks for Visit on ${formattedVisitDate}`;

  const htmlBody = `
    <p>Dear ${name},</p>
    <p>Please submit your travel remarks for the visit that began on <strong>${formattedVisitDate}</strong>.</p>
    <p>Click the link below to fill out the travel remarks form:</p>
    <p><a href="${formUrl}" target="_blank">Submit Travel Remarks</a></p>
    <p><strong>Note:</strong> This link will expire on <strong>${formattedExpiresDate}</strong>.</p>
    <br/>
    <p>Regards,<br/>Travel Tracker System</p>
  `;

  try {
    await sendEmail({
      to: email,
      // cc: ccEmails, // ✅ keep commented
      subject,
      htmlBody
    });

    // ✅ Safe logging (no crash now)
    console.log(
      `First remarks email sent to ${name} (${email})` +
      (ccEmails.length ? ` | CC: ${ccEmails.join(', ')}` : '')
    );

  } catch (err) {
    console.error(`Failed to send first remarks email to ${email}:`, err);
  }
};

const sendSecondRemarksMail = async (
  name,
  email,
  from_date,
  hr_mantra_id,
  res_id,
  ccEmails = [] // ✅ default added
) => {

  const { formUrl, expires } = generateFormOtherLinkforRemarks(name, hr_mantra_id, res_id);

  // Format from_date
  const visitDate = new Date(from_date);
  const formattedVisitDate = `${(visitDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${visitDate.getDate()
    .toString()
    .padStart(2, '0')}/${visitDate.getFullYear()}`;

  // Format expires date
  const expiresDate = new Date(decodeURIComponent(expires));
  const formattedExpiresDate = `${(expiresDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${expiresDate.getDate()
    .toString()
    .padStart(2, '0')}/${expiresDate.getFullYear()}`;

  const subject = `Reminder: Submit Your Travel Remarks for Visit on ${formattedVisitDate}`;

  const htmlBody = `
    <p>Dear ${name},</p>
    <p>This is a gentle reminder to submit your travel remarks for the visit that began on <strong>${formattedVisitDate}</strong>.</p>
    <p>Please click the link below to complete the travel remarks form:</p>
    <p><a href="${formUrl}" target="_blank">Submit Travel Remarks</a></p>
    <p><strong>Note:</strong> This link will expire on <strong>${formattedExpiresDate}</strong>.</p>
    <br/>
    <p>Regards,<br/>Travel Tracker System</p>
  `;

  try {
    await sendEmail({
      to: email,
      // cc: ccEmails, // ✅ keep disabled for now
      subject,
      htmlBody
    });

    // ✅ Safe logging
    console.log(
      `Reminder email sent to ${name} (${email})` +
      (ccEmails.length ? ` | CC: ${ccEmails.join(', ')}` : '')
    );

  } catch (err) {
    console.error(`Failed to send reminder email to ${email}:`, err);
  }
};


const sendPasswordResetEmail = async (email, hr_mantra_id) => {
    try {
        const currentTime = getTimeString();
        const resetLink = `${process.env.BASE_URL2}resetpassword/${hr_mantra_id}/${currentTime}`;

        const emailSubject = "Password Reset Request for Travel Tracker System";

        // Email Body (HTML format)
        const emailBody = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Password Reset Request for Travel Tracker System</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. Click the button below to reset it:</p>
                <a href="${resetLink}" 
                style="display: inline-block; padding: 10px 15px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                Reset Password
                </a>
                <p>If you didn't request a password reset, you can ignore this email.</p>
                <p>Thanks,</p>
                <p>Regards,<br/>Billing System</p>
            </div>
        `;

        // Send email using your sendEmail function
        let emailResponse = await sendEmail({
            to: email,
            // to:'dme-3@amrit.co.in',
            subject: emailSubject,
            htmlBody: emailBody
        });

        if (emailResponse.status != 200) {
            console.error("Email failed:", emailResponse.message);
            return { status: 500, message: "Email not sent, bill not updated" };
        }

        return { status: 200, message: "Email sent please check your given mail!" };
    } catch (error) {
        console.error("Error sending mail:", error);
        res.status(500).json({ status: 500, message: "Error sending mail.", });
    }
};

const getTimeString=(d)=>{
  const date=d?new Date(d):new Date();
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

module.exports = { sendQuaterlyMail, sendTenReminderMail, sendSixReminderMail, sendTwoReminderMail, sendFirstRemarksMail, sendSecondRemarksMail, sendQuaterlyReminderMail, sendPasswordResetEmail };
