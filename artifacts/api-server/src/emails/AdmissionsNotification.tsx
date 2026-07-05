import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface AdmissionsNotificationProps {
  applicationId: string;
  email: string;
  visitorType: string;
  fitScore: number;
  fitRationale: string;
  background: string;
  motivations: string;
  concernsExpressed: string;
  keyQuotes: string[];
  recommendedFollowUpQuestion: string;
  portfolioUrl?: string;
  applicationTurns: number;
  submittedAt: string;
}

const FIT_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
  5: "#8b5cf6",
};

export default function AdmissionsNotification({
  applicationId,
  email,
  visitorType,
  fitScore,
  fitRationale,
  background,
  motivations,
  concernsExpressed,
  keyQuotes,
  recommendedFollowUpQuestion,
  portfolioUrl,
  applicationTurns,
  submittedAt,
}: AdmissionsNotificationProps) {
  const badgeColor = FIT_COLORS[fitScore] ?? "#6b7280";
  const badgeText = fitScore <= 2 ? "#ffffff" : fitScore === 3 ? "#000000" : "#ffffff";

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        {`New MIAW application — fit ${fitScore}/5 — ${email}`}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Text style={styles.wordmark}>miaw</Text>
          <Text style={styles.headerSub}>New application</Text>

          {/* Fit score badge + rationale */}
          <Section style={styles.badgeRow}>
            <Text
              style={{
                ...styles.badge,
                backgroundColor: badgeColor,
                color: badgeText,
              }}
            >
              Fit {fitScore}/5
            </Text>
            <Text style={styles.badgeRationale}>{fitRationale}</Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Applicant details */}
          <Section style={styles.card}>
            <Text style={styles.cardLabel}>Applicant</Text>
            <Link href={`mailto:${email}`} style={styles.emailLink}>
              {email}
            </Link>
            <Text style={styles.meta}>
              {visitorType} · {applicationTurns} application turn
              {applicationTurns !== 1 ? "s" : ""} · submitted {submittedAt}
            </Text>
            {portfolioUrl && (
              <Link href={portfolioUrl} style={styles.portfolioLink}>
                {portfolioUrl}
              </Link>
            )}
          </Section>

          <Hr style={styles.hr} />

          {/* Extracted profile */}
          <Section style={styles.card}>
            <Text style={styles.cardLabel}>Extracted profile</Text>

            <Text style={styles.fieldLabel}>Background</Text>
            <Text style={styles.fieldValue}>{background}</Text>

            <Hr style={styles.innerHr} />
            <Text style={styles.fieldLabel}>Motivations</Text>
            <Text style={styles.fieldValue}>{motivations}</Text>

            <Hr style={styles.innerHr} />
            <Text style={styles.fieldLabel}>Concerns expressed</Text>
            <Text style={styles.fieldValue}>{concernsExpressed}</Text>

            {keyQuotes.length > 0 && (
              <>
                <Hr style={styles.innerHr} />
                <Text style={styles.fieldLabel}>Key quotes</Text>
                {keyQuotes.map((q, i) => (
                  <Text key={i} style={styles.quote}>
                    &ldquo;{q}&rdquo;
                  </Text>
                ))}
              </>
            )}
          </Section>

          <Hr style={styles.hr} />

          {/* Follow-up recommendation */}
          <Section style={styles.followUpCard}>
            <Text style={styles.followUpLabel}>
              Recommended follow-up question
            </Text>
            <Text style={styles.followUpText}>
              {recommendedFollowUpQuestion}
            </Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Text style={styles.footer}>
            Application ID:{" "}
            <span style={styles.mono}>{applicationId}</span>
            <br />
            MIAW Admissions ·{" "}
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
    maxWidth: "600px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  wordmark: {
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: "20px",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "0.12em",
    marginBottom: "4px",
    marginTop: "0",
  },
  headerSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "13px",
    marginTop: "0",
    marginBottom: "20px",
  },
  badgeRow: {
    marginBottom: "8px",
  },
  badge: {
    display: "inline-block",
    borderRadius: "6px",
    padding: "4px 12px",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "8px",
    marginTop: "0",
  },
  badgeRationale: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "13px",
    marginTop: "0",
    marginBottom: "0",
  },
  hr: {
    borderColor: "rgba(255,255,255,0.10)",
    margin: "20px 0",
  },
  innerHr: {
    borderColor: "rgba(255,255,255,0.06)",
    margin: "10px 0",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: "10px",
    padding: "20px 24px",
  },
  cardLabel: {
    color: "rgba(255,255,255,0.40)",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.10em",
    marginBottom: "10px",
    marginTop: "0",
  },
  emailLink: {
    color: "#a78bfa",
    fontSize: "15px",
    textDecoration: "none",
  },
  meta: {
    color: "rgba(255,255,255,0.55)",
    fontSize: "13px",
    marginTop: "6px",
    marginBottom: "0",
  },
  portfolioLink: {
    color: "#7ab2f8",
    fontSize: "13px",
    textDecoration: "underline",
    marginTop: "4px",
  },
  fieldLabel: {
    color: "rgba(255,255,255,0.40)",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "4px",
    marginTop: "0",
  },
  fieldValue: {
    color: "#e8e4f8",
    fontSize: "14px",
    lineHeight: "1.55",
    marginTop: "0",
    marginBottom: "0",
  },
  quote: {
    color: "#c4b8e8",
    fontSize: "13px",
    lineHeight: "1.5",
    fontStyle: "italic",
    marginTop: "6px",
    marginBottom: "0",
  },
  followUpCard: {
    backgroundColor: "rgba(142,114,213,0.10)",
    borderLeft: "3px solid #8e72d5",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "14px",
    paddingBottom: "14px",
    borderRadius: "0 8px 8px 0",
  },
  followUpLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.10em",
    marginBottom: "6px",
    marginTop: "0",
  },
  followUpText: {
    color: "#c4b8e8",
    fontSize: "14px",
    lineHeight: "1.55",
    fontStyle: "italic",
    marginTop: "0",
    marginBottom: "0",
  },
  footer: {
    color: "rgba(255,255,255,0.35)",
    fontSize: "12px",
    lineHeight: "1.6",
    marginTop: "0",
    marginBottom: "0",
  },
  mono: {
    fontFamily: "'Courier New', Courier, monospace",
    color: "rgba(255,255,255,0.50)",
  },
  footerLink: {
    color: "rgba(255,255,255,0.40)",
    textDecoration: "underline",
  },
};
