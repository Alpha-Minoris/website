import nodemailer from 'nodemailer'

export interface EmailConfig {
    from: string
    to: string
}

export interface ContactFormData {
    firstName: string
    lastName: string
    jobTitle: string
    email: string
    company: string
    message?: string
}

// Create SMTP transporter using Google Workspace
export function createEmailTransporter() {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use TLS
        auth: {
            user: process.env.SMTP_USER, // e.g., contact-form@alpha-minoris.ai
            pass: process.env.SMTP_PASSWORD, // App password from Google
        },
    })
}

// Generate beautiful HTML email template with glassmorphic design
export function generateContactFormEmail(data: ContactFormData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Lead from Alpha Minoris</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%); min-height: 100vh; padding: 40px 20px;">
    
    <!-- Main Container -->
    <div style="max-width: 650px; margin: 0 auto;">
        
        <!-- Glassmorphic Card -->
        <div style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);">
            
            <!-- Header with Accent Gradient -->
            <div style="background: linear-gradient(135deg, #0c759a 0%, #10b981 35%, #0c759a 100%); padding: 32px 40px; position: relative;">
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px);"></div>
                <div style="position: relative; z-index: 1;">
                    <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                        🚀 New Lead Received
                    </h1>
                    <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; font-weight: 500;">
                        Alpha Minoris Contact Form
                    </p>
                </div>
            </div>

            <!-- Content Area -->
            <div style="padding: 40px;">
                
                <!-- Lead Badge -->
                <div style="background: rgba(12, 117, 154, 0.15); border: 1px solid rgba(12, 117, 154, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 32px; text-align: center;">
                    <div style="display: inline-flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.5 5.5L6.5 12.5L2.5 8.5" stroke="#0c759a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span style="color: #0c759a; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                            Added to CRM Database
                        </span>
                    </div>
                </div>

                <!-- Contact Information Table -->
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; overflow: hidden; margin-bottom: 24px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                            <td style="padding: 18px 24px; width: 35%; color: rgba(255, 255, 255, 0.5); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Full Name
                            </td>
                            <td style="padding: 18px 24px; color: #ffffff; font-size: 16px; font-weight: 600;">
                                ${data.firstName} ${data.lastName}
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                            <td style="padding: 18px 24px; color: rgba(255, 255, 255, 0.5); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Job Title
                            </td>
                            <td style="padding: 18px 24px; color: #ffffff; font-size: 16px; font-weight: 500;">
                                ${data.jobTitle}
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                            <td style="padding: 18px 24px; color: rgba(255, 255, 255, 0.5); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Company
                            </td>
                            <td style="padding: 18px 24px; color: #ffffff; font-size: 16px; font-weight: 500;">
                                ${data.company}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 18px 24px; color: rgba(255, 255, 255, 0.5); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Email
                            </td>
                            <td style="padding: 18px 24px;">
                                <a href="mailto:${data.email}" style="color: #0c759a; font-size: 16px; font-weight: 500; text-decoration: none;">
                                    ${data.email}
                                </a>
                            </td>
                        </tr>
                    </table>
                </div>

                ${data.message ? `
                <!-- Message Quote -->
                <div style="margin-bottom: 32px;">
                    <div style="color: rgba(255, 255, 255, 0.5); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 16px;">💬</span> Message
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-left: 4px solid #0c759a; border-radius: 12px; padding: 20px 24px;">
                        <p style="margin: 0; padding: 0; color: rgba(255, 255, 255, 0.95); font-size: 15px; line-height: 1.7; font-style: normal;">
                            ${data.message}
                        </p>
                    </div>
                </div>
                ` : ''}

                <!-- Action Button -->
                <div style="text-align: center; margin-top: 32px;">
                    <a href="mailto:${data.email}" style="display: inline-block; background: linear-gradient(135deg, #0c759a 0%, #10b981 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 16px rgba(12, 117, 154, 0.3); transition: all 0.3s;">
                        📧 Reply to ${data.firstName}
                    </a>
                </div>

            </div>

            <!-- Footer -->
            <div style="background: rgba(0, 0, 0, 0.3); padding: 24px 40px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 13px; text-align: center;">
                    Automated notification from <strong style="color: #0c759a;">Alpha Minoris</strong>
                </p>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 12px; text-align: center;">
                    This lead has been automatically added to your CRM
                </p>
            </div>

        </div>

        <!-- Bottom Spacer -->
        <div style="height: 40px;"></div>

    </div>

</body>
</html>
    `.trim()
}

// Send contact form notification email
export async function sendContactFormEmail(
    formData: ContactFormData,
    emailConfig: EmailConfig
): Promise<{ success: boolean; error?: string }> {
    try {
        const transporter = createEmailTransporter()

        const mailOptions = {
            from: `"Alpha Minoris Contact Form" <${emailConfig.from}>`,
            to: emailConfig.to,
            subject: `🚀 New Lead: ${formData.firstName} ${formData.lastName} (${formData.company}) - ${formData.jobTitle}`,
            html: generateContactFormEmail(formData),
            text: `
New Contact Form Submission

Name: ${formData.firstName} ${formData.lastName}
Job Title: ${formData.jobTitle}
Company: ${formData.company}
Email: ${formData.email}
${formData.message ? `\nMessage:\n${formData.message}` : ''}

This lead has been added to the Alpha Mind database.
            `.trim(),
        }

        await transporter.sendMail(mailOptions)

        return { success: true }
    } catch (error: any) {
        console.error('Email send error:', error)
        return {
            success: false,
            error: error.message || 'Failed to send email',
        }
    }
}
