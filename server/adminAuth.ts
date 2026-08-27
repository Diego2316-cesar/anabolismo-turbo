import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { parse } from "cookie";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";
import { getSessionCookieOptions } from "./_core/cookies";
import { getAdminCredential, upsertAdminCredential } from "./supabase";

const scrypt = promisify(scryptCallback);
export const ADMIN_COOKIE = "catalog_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = { username: string; exp: number };

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", ENV.cookieSecret).update(value).digest("hex");
}

async function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return { hash: derived.toString("hex"), salt };
}

function safeCompare(left: string, right: string) {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function createToken(username: string) {
  const payload = encode(JSON.stringify({ username, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS } satisfies SessionPayload));
  return `${payload}.${sign(payload)}`;
}

export function getAdminSession(req: Request): SessionPayload | null {
  const token = parse(req.headers.cookie ?? "")[ADMIN_COOKIE];
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeCompare(signature, sign(payload))) return null;
  try {
    const session = JSON.parse(decode(payload)) as SessionPayload;
    return session.exp > Math.floor(Date.now() / 1000) && session.username ? session : null;
  } catch {
    return null;
  }
}

export function setAdminSession(res: Response, req: Request, username: string) {
  res.cookie(ADMIN_COOKIE, createToken(username), {
    ...getSessionCookieOptions(req),
    maxAge: SESSION_TTL_SECONDS * 1000,
  });
}

export function clearAdminSession(res: Response, req: Request) {
  res.clearCookie(ADMIN_COOKIE, { ...getSessionCookieOptions(req), maxAge: 0 });
}

export async function verifyAdminCredentials(username: string, password: string) {
  const configuredUsername = ENV.adminUsername;
  const configuredPassword = ENV.adminPassword;
  if (!configuredUsername || !configuredPassword) return false;

  const stored = await getAdminCredential(username);
  if (stored) {
    const computed = await hashPassword(password, stored.salt);
    return safeCompare(computed.hash, stored.password_hash);
  }

  if (username !== configuredUsername || password !== configuredPassword) return false;
  const initial = await hashPassword(password);
  await upsertAdminCredential({ username, passwordHash: initial.hash, salt: initial.salt });
  return true;
}

export async function changeAdminPassword(username: string, currentPassword: string, newPassword: string) {
  const valid = await verifyAdminCredentials(username, currentPassword);
  if (!valid) return false;
  const next = await hashPassword(newPassword);
  await upsertAdminCredential({ username, passwordHash: next.hash, salt: next.salt });
  return true;
}
