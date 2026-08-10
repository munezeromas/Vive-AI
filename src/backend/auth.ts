import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db/schema";
import nodemailer from "nodemailer";

/* ─── Nodemailer transporter using Gmail SMTP ─── */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

/* ─── Branded Vive email template ─── */
function buildOtpEmail(otp: string): { subject: string; html: string } {
    const digits = otp.split("");
    const digitBoxes = digits
        .map(
            (d) =>
                `<span style="display:inline-block;width:44px;height:56px;line-height:56px;text-align:center;font-size:26px;font-weight:900;background:#f3f6f9;border-radius:10px;margin:0 4px;color:#111;letter-spacing:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${d}</span>`
        )
        .join("");

    return {
        subject: "Your Vive AI Verification Code",
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#000;padding:28px 40px;text-align:center;">
            <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:3px;text-transform:uppercase;">VIVE AI</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;text-align:center;">
            <h1 style="margin:0 0 10px;font-size:22px;font-weight:800;color:#111;letter-spacing:-0.5px;">Verify your email</h1>
            <p style="margin:0 0 32px;color:#666;font-size:14px;line-height:1.6;">
              Use the code below to complete your Vive AI registration.<br>
              <strong>This code expires in 10 minutes.</strong>
            </p>
            <!-- OTP Boxes -->
            <div style="margin:0 auto 32px;text-align:center;">
              ${digitBoxes}
            </div>
            <p style="margin:0;color:#999;font-size:12px;line-height:1.6;">
              If you didn't request this, you can safely ignore this email.<br>
              Never share this code with anyone.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;background:#f9fafb;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;color:#bbb;font-size:11px;">
              &copy; 2025 Vive AI &mdash; Learning for Every African Student
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    };
}

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
    trustedOrigins: (process.env.TRUSTED_ORIGINS || "http://localhost:5173,http://localhost:5174,http://localhost:5175")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        resetPasswordTokenExpiresIn: 3600,
        async sendResetPassword({ user, url }) {
            await transporter.sendMail({
                from: `"Vive AI" <${process.env.SMTP_FROM_EMAIL}>`,
                to: user.email,
                subject: "Reset your Vive AI password",
                html: `
                <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
                    <h1 style="font-size:22px;margin:0 0 12px;">Reset your password</h1>
                    <p style="line-height:1.6;color:#555;">Use the secure link below to set a new password for your Vive AI account. This link expires in 1 hour.</p>
                    <p style="margin:28px 0;">
                        <a href="${url}" style="background:#000;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;display:inline-block;">Reset password</a>
                    </p>
                    <p style="font-size:12px;color:#777;line-height:1.6;">If you did not request this, you can ignore this email. Your password will not change.</p>
                </div>
                `,
            });
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "student",
            },
            grade: {
                type: "string",
                required: false,
            },
            schoolId: {
                type: "string",
                required: false,
            },
            xp: {
                type: "number",
                required: false,
                defaultValue: 0,
            },
            level: {
                type: "number",
                required: false,
                defaultValue: 1,
            }
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const schoolNum = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
                    const studentNum = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
                    const viveId = `VIVE-${schoolNum}-${studentNum}`;
                    return {
                        data: {
                            ...user,
                            schoolId: viveId,
                        }
                    };
                },
                after: async (user) => {
                    if (user.schoolId) {
                        await transporter.sendMail({
                            from: `"Vive AI" <${process.env.SMTP_FROM_EMAIL}>`,
                            to: user.email,
                            subject: "Welcome to Vive AI! Here is your Vive Access Code",
                            html: `
                            <div style="font-family:sans-serif;padding:20px;max-width:600px;margin:0 auto;">
                                <h2 style="color:#000;">Welcome to Vive AI, ${user.name}!</h2>
                                <p style="color:#555;">We're excited to have you on board. Here is your automatically generated Vive Access Code:</p>
                                <div style="background:#f3f6f9;padding:15px;border-radius:10px;text-align:center;margin:20px 0;">
                                    <span style="font-size:24px;font-weight:900;color:#000;letter-spacing:2px;">${user.schoolId}</span>
                                </div>
                                <p style="color:#555;">You can use your email or this code to sign in anytime.</p>
                                <br>
                                <p style="color:#aaa;font-size:12px;">© 2026 Vive AI</p>
                            </div>
                            `,
                        });
                    }
                }
            }
        }
    },
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                console.log(`Sending OTP email to ${email} with type ${type} and otp ${otp}`);
                try {
                    const { subject, html } = buildOtpEmail(otp);
                    await transporter.sendMail({
                        from: `"Vive AI" <${process.env.SMTP_FROM_EMAIL}>`,
                        to: email,
                        subject,
                        html,
                    });
                    console.log(`Successfully sent OTP to ${email}`);
                } catch (err) {
                    console.error("Error sending OTP email:", err);
                }
            },
            expiresIn: 600, // 10 minutes
            sendVerificationOnSignUp: true, // We automatically trigger it on sign up
        }),
    ],
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
});

/* ─── Validate Google OAuth Configuration ─── */
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn(
        "⚠️  Google OAuth not configured. 'Continue with Google' button will not work.\n" +
        "   To enable Google sign-in:\n" +
        "   1. Go to https://console.cloud.google.com/\n" +
        "   2. Create an OAuth 2.0 Client ID (Web Application)\n" +
        "   3. Add authorized redirect URIs: http://localhost:3001/api/auth/callback/google\n" +
        "   4. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env\n" +
        "   5. Restart the dev server"
    );
}
