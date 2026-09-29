const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn('Gmail credentials not set (GMAIL_USER, GMAIL_PASS). Skipping email to:', to);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Buddha College of Nursing" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`Email successfully sent to ${to}: ${subject}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

const sendApplicationSubmittedEmail = (applicant) => {
  if (!applicant || !applicant.email) return;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #0d9488; margin: 0;">Buddha College of Nursing</h2>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">Excellence in Nursing Education</p>
      </div>
      <p>Dear <strong>${applicant.full_name || 'Applicant'}</strong>,</p>
      <p>Thank you for submitting your application to <strong>Buddha College of Nursing</strong>. We have received your admission application and our admissions committee will review it shortly.</p>
      
      <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 4px 0;"><strong>Application No:</strong> ${applicant.application_number || applicant.id || 'N/A'}</p>
        <p style="margin: 4px 0;"><strong>Course Applied:</strong> ${applicant.course || 'Nursing'}</p>
        <p style="margin: 4px 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
      </div>

      <p>You can log in to your student portal anytime to track your application status, upload documents, or review fees.</p>
      <p>If you have any questions, feel free to reach out to our admissions team at <a href="mailto:${process.env.ADMIN_EMAIL || 'admissions@buddhacollege.in'}" style="color: #0d9488;">${process.env.ADMIN_EMAIL || 'admissions@buddhacollege.in'}</a> or call our helpline.</p>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
        <p style="margin: 0;">Buddha College of Nursing &bull; Patna, Bihar, India</p>
        <p style="margin: 4px 0 0;">This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    </div>
  `;
  sendEmail(applicant.email, 'Application Submitted - Buddha College of Nursing', html);
};

const sendAdmissionStatusEmail = (applicant, status) => {
  if (!applicant || !applicant.email) return;
  const statusColor = status === 'Approved' ? '#16a34a' : status === 'Rejected' ? '#dc2626' : '#d97706';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #0d9488; margin: 0;">Buddha College of Nursing</h2>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">Excellence in Nursing Education</p>
      </div>
      <p>Dear <strong>${applicant.full_name || 'Applicant'}</strong>,</p>
      <p>There is an update on your admission application status:</p>
      
      <div style="text-align: center; background-color: #f8fafc; padding: 18px; margin: 20px 0; border-radius: 6px; border: 1px solid #e2e8f0;">
        <span style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">New Status</span>
        <span style="font-size: 20px; font-weight: bold; color: ${statusColor};">${status}</span>
        <p style="margin: 10px 0 0; font-size: 14px; color: #475569;">Application No: <strong>${applicant.application_number || applicant.id || 'N/A'}</strong></p>
      </div>

      <p>Please sign in to the student portal to review detailed instructions, upload any requested documents, or proceed with next steps.</p>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
        <p style="margin: 0;">Buddha College of Nursing &bull; Patna, Bihar, India</p>
        <p style="margin: 4px 0 0;">This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    </div>
  `;
  sendEmail(applicant.email, `Admission Status Update: ${status} - Buddha College of Nursing`, html);
};

const sendAdminNewLeadEmail = (lead) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !lead) return;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <h3 style="color: #0d9488; margin-top: 0;">New Lead Notification</h3>
      <p>A new lead has been captured in the Buddha College of Nursing portal.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; color: #64748b; width: 140px;"><strong>Name:</strong></td>
          <td style="padding: 8px; color: #1e293b;">${lead.name || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; color: #64748b;"><strong>Phone:</strong></td>
          <td style="padding: 8px; color: #1e293b;">${lead.phone || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; color: #64748b;"><strong>Course:</strong></td>
          <td style="padding: 8px; color: #1e293b;">${lead.course_interested || lead.course || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; color: #64748b;"><strong>City:</strong></td>
          <td style="padding: 8px; color: #1e293b;">${lead.city || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; color: #64748b;"><strong>Source:</strong></td>
          <td style="padding: 8px; color: #1e293b;">${lead.source || 'Website'}</td>
        </tr>
      </table>
      
      <p style="font-size: 13px; color: #64748b;">Visit the Admin Leads Dashboard to assign or follow up with this candidate.</p>
    </div>
  `;
  sendEmail(adminEmail, `New Lead Received: ${lead.name || 'Candidate'} (${lead.course_interested || lead.course || 'General'})`, html);
};

const sendAdminNewApplicationEmail = (applicant) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !applicant) return;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <h3 style="color: #0d9488; margin-top: 0;">New Admission Application Submitted</h3>
      <p>A new student admission application has been received.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; color: #64748b; width: 140px;"><strong>App No:</strong></td>
          <td style="padding: 8px; color: #1e293b;">${applicant.application_number || applicant.id || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; color: #64748b;"><strong>Student Name:</strong></td>
          <td style="padding: 8px; color: #1e293b;">${applicant.full_name || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; color: #64748b;"><strong>Email:</strong></td>
          <td style="padding: 8px; color: #1e293b;">${applicant.email || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; color: #64748b;"><strong>Phone:</strong></td>
          <td style="padding: 8px; color: #1e293b;">${applicant.phone || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; color: #64748b;"><strong>Course:</strong></td>
          <td style="padding: 8px; color: #1e293b;">${applicant.course || 'N/A'}</td>
        </tr>
      </table>
      
      <p style="font-size: 13px; color: #64748b;">Visit the Admin Admissions Dashboard to review documents and update admission status.</p>
    </div>
  `;
  sendEmail(adminEmail, `New Admission Application: ${applicant.full_name || 'Student'} (${applicant.course || 'Course'})`, html);
};

module.exports = {
  sendEmail,
  sendApplicationSubmittedEmail,
  sendAdmissionStatusEmail,
  sendAdminNewLeadEmail,
  sendAdminNewApplicationEmail
};
