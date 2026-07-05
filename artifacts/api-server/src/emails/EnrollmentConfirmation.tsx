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

export interface EnrollmentConfirmationProps {
  /** Applicant portal URL — links to the portal where they can see their status */
  portalUrl: string;
}

export default function EnrollmentConfirmation({ portalUrl }: EnrollmentConfirmationProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>MIAW — enrollment confirmed. Welcome.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.wordmark}>miaw</Text>
          <Hr style={styles.hr} />

          <Text style={styles.heading}>You are enrolled.</Text>

          <Text style={styles.paragraph}>
            Your enrollment fee has been received and your place in the MIAW cohort is confirmed.
          </Text>

          <Text style={styles.paragraph}>
            We will reach out shortly with the program schedule, onboarding materials, and the
            details you need to prepare. The cohort starts Q4 2026.
          </Text>

          <Text style={styles.paragraph}>
            If you have any questions before then, reply directly to this email — the admissions
            team reads every reply.
          </Text>

          <Hr style={styles.hr} />

          <Button href={portalUrl} style={styles.button}>
            View your application status →
          </Button>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            Master In Intelligent Artificial Worlds — postgraduate AEC+AI program.{" "}
            <Link href="https://miaw.ai" style={styles.footerLink}>
              miaw.ai
            </Link>
            <br />
            This is your enrollment confirmation. Keep this email — your portal link is above.
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
    fontSize: "20px",
    fontWeight: "700",
    lineHeight: "1.3",
    marginBottom: "20px",
    marginTop: "0",
    letterSpacing: "-0.01em",
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
    backgroundColor: "rgba(38,180,90,0.15)",
    border: "1px solid rgba(38,180,90,0.4)",
    borderRadius: "8px",
    color: "#5de893",
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
