import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

export interface WaitlistConfirmationProps {
  visitorType?: string;
}

export default function WaitlistConfirmation({}: WaitlistConfirmationProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You&apos;re on the MIAW waitlist. We&apos;ll be in touch.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.wordmark}>miaw</Text>
          <Hr style={styles.hr} />
          <Text style={styles.heading}>You&apos;re on the list.</Text>
          <Text style={styles.paragraph}>
            The first MIAW cohort — 30 AEC+AI practitioners — is taking shape.
            We&apos;ll reach out directly when applications open, before any public
            announcement.
          </Text>
          <Text style={styles.paragraph}>
            If you have questions in the meantime, or know someone who should be
            in the room, reply directly to this email.
          </Text>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            Master In Intelligent Artificial Worlds — postgraduate AEC+AI
            program.{" "}
            <Link href="https://miaw.ai" style={styles.footerLink}>
              miaw.ai
            </Link>
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
    fontWeight: "600",
    marginBottom: "16px",
    marginTop: "0",
  },
  paragraph: {
    color: "#c4b8e8",
    fontSize: "15px",
    lineHeight: "1.65",
    marginBottom: "16px",
    marginTop: "0",
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
