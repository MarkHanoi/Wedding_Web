export interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success: boolean;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface EmailBinding {
  send(message: {
    to: string;
    from: string;
    subject: string;
    text: string;
  }): Promise<{ messageId: string }>;
}

export interface WorkerEnv {
  DB: D1Database;
  ASSETS: { fetch(request: Request): Promise<Response> };
  EMAIL?: EmailBinding;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  EMAIL_FROM?: string;
}

export interface RsvpRow {
  id: number;
  name: string;
  attending: "yes" | "no";
  guests: number;
  shuttle: number;
  events_json: string;
  arrival: string;
  transport_email: string;
  dietary: string;
  message: string;
  received_at: string;
}
