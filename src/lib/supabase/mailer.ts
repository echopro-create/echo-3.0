import nodemailer from "nodemailer";

export type MailJob = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

export function makeTransport() {
  const host = process.env.SMTP_HOST as string | undefined;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER as string | undefined;
  const pass = process.env.SMTP_PASS as string | undefined;
  const secure =
    String(process.env.SMTP_SECURE ?? "false").toLowerCase() === "true";

  if (!host) {
    throw new Error("SMTP_HOST is not set");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });
}

export async function sendMail(job: MailJob) {
  const from = process.env.SMTP_FROM;
  if (!from) throw new Error("SMTP_FROM is not set");

  const transport = makeTransport();
  const info = await transport.sendMail({
    from,
    to: job.to,
    subject: job.subject,
    text: job.text,
    html: job.html,
  });
  return info;
}
