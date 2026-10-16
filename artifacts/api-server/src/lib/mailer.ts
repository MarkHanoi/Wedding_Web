import nodemailer from "nodemailer";
import type { RSVP } from "../routes/rsvp";

const ADMIN_EMAIL = "lookwithinjourney@gmail.com";
const SMTP_USER = "lookwithinjourney@gmail.com";

function createTransporter(appPassword: string) {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: appPassword.replace(/\s/g, ""),
    },
  });
}

export async function verifyGmailSmtp(): Promise<boolean> {
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!appPassword) return false;
  await createTransporter(appPassword).verify();
  return true;
}

export async function sendRsvpNotification(entry: RSVP): Promise<"sent" | "not_configured"> {
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!appPassword) return "not_configured";

  await createTransporter(appPassword).sendMail({
    from: `"Clémence & Antonio — Wedding RSVP" <${SMTP_USER}>`,
    to: ADMIN_EMAIL,
    subject: "New wedding RSVP received",
    text: [
      `Name: ${entry.name}`,
      `Attendance: ${entry.attending === "yes" ? "Accepts" : "Declines"}`,
      ...(entry.attending === "yes" ? [`Additional guests: ${entry.guests}`, `Shuttle: ${entry.shuttle ? "Yes" : "No"}`] : []),
      `Dietary requirements: ${entry.dietary || "None provided"}`,
      `Note: ${entry.message || "None provided"}`,
      `Received: ${entry.receivedAt}`,
    ].join("\n"),
  });

  return "sent";
}
