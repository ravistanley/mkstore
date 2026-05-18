import { config } from "dotenv";
config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

async function test() {
    try {
        // Verify connection first
        await transporter.verify();
        console.log("✅ Gmail SMTP connection verified successfully!");

        // Send a test email to the same address
        const info = await transporter.sendMail({
            from: `"MkStore Orders" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER, // send to itself as a test
            subject: "MkStore Email Test ✅",
            html: "<h2>Email is working!</h2><p>Your MkStore Gmail SMTP setup is working correctly.</p>",
        });

        console.log("✅ Test email sent! Message ID:", info.messageId);
    } catch (err: unknown) {
        console.error("❌ Error:", err instanceof Error ? err.message : err);
    }
}

test();
