import type { WorkerEnv } from "./types";
import type { RSVP } from "./rsvp";

export async function sendRsvpNotification(
  env: WorkerEnv,
  entry: RSVP,
): Promise<"sent" | "not_configured"> {
  if (!env.EMAIL || !env.EMAIL_FROM) return "not_configured";

  const lines = [
    `Name: ${entry.name}`,
    `Attendance: ${entry.attending === "yes" ? "Accepts" : "Declines"}`,
    ...(entry.attending === "yes"
      ? [
          `Events: ${entry.events.join(", ") || "None selected"}`,
          `Additional guests: ${entry.guests}`,
          `Transport help: ${entry.shuttle ? "Yes" : "No"}`,
          ...(entry.shuttle
            ? [`Transport contact email: ${entry.transportEmail}`]
            : []),
        ]
      : []),
    `Arrival: ${entry.arrival || "None provided"}`,
    `Dietary requirements: ${entry.dietary || "None provided"}`,
    `Note: ${entry.message || "None provided"}`,
    `Received: ${entry.receivedAt}`,
  ];

  await env.EMAIL.send({
    to: env.ADMIN_EMAIL || "lookwithinjourney@gmail.com",
    from: env.EMAIL_FROM,
    subject: "New wedding RSVP received",
    text: lines.join("\n"),
  });
  return "sent";
}
