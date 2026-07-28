import { headers } from "next/headers";
import { prisma } from "./db";

// Backed by Postgres (not in-memory) so the limit holds across serverless
// instances, not just within one warm function. Only failed attempts are
// recorded — successful logins never write a row here.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_EMAIL = 5;
const MAX_ATTEMPTS_PER_IP = 20; // looser — an office/NAT IP can be many real users

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function checkLoginRateLimit(
  email: string,
  ip: string
): Promise<{ allowed: boolean }> {
  const since = new Date(Date.now() - WINDOW_MS);
  const [emailCount, ipCount] = await Promise.all([
    prisma.loginAttempt.count({ where: { email, createdAt: { gt: since } } }),
    prisma.loginAttempt.count({ where: { ip, createdAt: { gt: since } } }),
  ]);
  return { allowed: emailCount < MAX_ATTEMPTS_PER_EMAIL && ipCount < MAX_ATTEMPTS_PER_IP };
}

export async function recordFailedLogin(email: string, ip: string): Promise<void> {
  await prisma.loginAttempt.create({ data: { email, ip } });
  // Opportunistic cleanup — piggybacks on the write that already happens on
  // every failed attempt, so the table never needs a separate cron job.
  const since = new Date(Date.now() - WINDOW_MS);
  await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: since } } }).catch(() => {});
}
