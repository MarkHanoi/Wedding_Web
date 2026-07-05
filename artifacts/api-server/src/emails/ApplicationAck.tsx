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

export interface ApplicationAckProps {
  ackText: string;
  // P4-A: status portal URL — included when a statusToken was generated at
  // submission. Allows the applicant to check their admissions status and
  // re-read their acknowledgment without contacting the team.
  statusUrl?: string;
}

export default function ApplicationAck({ ackText, statusUrl }: ApplicationAckProps) {
  const paragraphs = ackText.split("\n\n").filter(Boolean);

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your MIAW application — a note from the admissions team.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.wordmark}>miaw</Text>
          <Hr style={styles.hr} />
          {paragraphs.map((para, i) => (
            <Text key={i} style={styles.paragraph}>
              {para}
            </Text>
          ))}
          {statusUrl && (
            <>
              <Hr style={styles.hr} />
              <Button href={statusUrl} style={styles.button}>
                Track your application status →
              </Button>
              <Text style={styles.statusNote}>
                Bookmark this link — it lets you check your application status
                at any time, without creating an account.
              </Text>
            </>
          )}
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            Master In Intelligent Artificial Worlds — postgraduate AEC+AI
            program.{" "}
            <Link href="https://miaw.ai" style={styles.footerLink}>
              miaw.ai
            </Link>
            <br />
            You received this because you submitted an application at miaw.ai.
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
  statusNote: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "12px",
    lineHeight: "1.6",
    marginTop: "8px",
    marginBottom: "0",
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
