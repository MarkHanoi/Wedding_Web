import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

export interface StatusUpdateProps {
  admissionsStatus: "accepted" | "waitlisted" | "declined";
  statusUrl: string;
}

const STATUS_CONTENT = {
  accepted: {
    preview: "MIAW — your application outcome.",
    heading: "Your application outcome",
    body: [
      "We have reviewed your application and would like to offer you a place in the MIAW cohort.",
      "We will be in touch shortly with the details you need — next steps, timing, and what to prepare.",
    ],
    cta: "View your application →",
  },
  waitlisted: {
    preview: "MIAW — an update on your application.",
    heading: "An update on your application",
    body: [
      "We have completed our initial review. Given the interest in this cohort, we have placed you on our reserve list.",
      "If a place opens up, we will reach out to you directly — you will be among the first to know.",
    ],
    cta: "View your application →",
  },
  declined: {
    preview: "MIAW — regarding your application.",
    heading: "Regarding your application",
    body: [
      "We have completed our review and, unfortunately, we are not able to offer a place in this cohort.",
      "We genuinely appreciated the conversation. We will keep your details and reach out if a future intake is a better fit.",
    ],
    cta: "View your application status →",
  },
} satisfies Record<
  string,
  { preview: string; heading: string; body: string[]; cta: string }
>;

export default function StatusUpdate({
  admissionsStatus,
  statusUrl,
}: StatusUpdateProps) {
  const content = STATUS_CONTENT[admissionsStatus];

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.wordmark}>miaw</Text>
          <Hr style={styles.hr} />
          <Text style={styles.heading}>{content.heading}</Text>
          {content.body.map((para, i) => (
            <Text key={i} style={styles.paragraph}>
              {para}
            </Text>
          ))}
          <Hr style={styles.hr} />
          <Button href={statusUrl} style={styles.button}>
            {content.cta}
          </Button>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            Master In Intelligent Artificial Worlds — postgraduate AEC+AI
            program.{" "}
            <Link href="https://miaw.ai" style={styles.footerLink}>
              miaw.ai
            </Link>
            <br />
            You received this because you submitted an application at miaw.ai.
            Questions? Reply directly to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: "#0d0b1a",
    margin: "0",
    padding: "0",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
  },
  container: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  wordmark: {
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: "22px",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "0.12em",
    marginBottom: "24px",
    marginTop: "0",
  },
  hr: {
    borderColor: "rgba(255,255,255,0.12)",
    margin: "24px 0",
  },
  heading: {
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "600",
    lineHeight: "1.4",
    marginBottom: "16px",
    marginTop: "0",
  },
  paragraph: {
    color: "#e8e4f8",
    fontSize: "15px",
    lineHeight: "1.65",
    marginBottom: "16px",
    marginTop: "0",
  },
  button: {
    display: "inline-block",
    backgroundColor: "rgba(90,120,232,0.2)",
    border: "1px solid rgba(90,120,232,0.5)",
    borderRadius: "8px",
    color: "#a0b8f8",
    fontSize: "14px",
    fontWeight: "500",
    padding: "10px 20px",
    textDecoration: "none",
    marginBottom: "8px",
  },
  footer: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "12px",
    lineHeight: "1.6",
    marginTop: "0",
    marginBottom: "0",
  },
  footerLink: {
    color: "rgba(255,255,255,0.5)",
    textDecoration: "underline",
  },
};
