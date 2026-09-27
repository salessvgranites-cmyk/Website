import nodemailer from "nodemailer";

// Retrieve the admin email and app password from environment variables
const adminEmail = process.env.ADMIN_EMAIL || "sales.svgranites@gmail.com";
const emailPass = process.env.SMTP_PASS; // The App Password you will generate for Gmail

// Create a reusable transporter using Gmail's SMTP service
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: adminEmail,
    pass: emailPass,
  },
});

export interface EnquiryEmailData {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
}

export async function sendEnquiryEmailNotification(data: EnquiryEmailData) {
  if (!emailPass) {
    console.warn("[Email] SMTP_PASS not found in environment variables. Email notification skipped.");
    return false;
  }

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #d4af37; padding: 20px; text-align: center;">
        <h2 style="color: #fff; margin: 0;">New Enquiry Received</h2>
      </div>
      <div style="padding: 20px;">
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Project Type:</strong> ${data.projectType}</p>
        <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; color: #555;">${data.message}</p>
        </div>
      </div>
      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        Sent automatically from SV Granites Website
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"SV Granites Website" <${adminEmail}>`, // sender address
      to: adminEmail, // send to the admin email
      subject: `New Lead: ${data.name} - ${data.projectType}`, // Subject line
      html: htmlContent, // HTML body
    });

    console.log("[Email] Notification sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send email notification:", error);
    return false;
  }
}
