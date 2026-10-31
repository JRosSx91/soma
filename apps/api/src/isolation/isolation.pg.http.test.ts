/**
 * Live HTTP isolation between two disposable users (A and B).
 *
 * Uses a real NestJS app, JwtAuthGuard, JwtStrategy, Prisma, and local
 * PostgreSQL. Auth guards are not mocked. The password-reset mailer is
 * replaced with an in-memory capture so no outbound mail is sent.
 *
 * A valid Bearer JWT authorizes its subject until expiry. This suite does
 * not simulate token theft; after A is deleted, A's previous JWT must 401
 * because JwtStrategy reloads the user row.
 *
 * Skips when DATABASE_URL is unset, unreachable, or not local Postgres.
 * Never truncates tables or deletes pre-existing users.
 */
import "reflect-metadata";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { after, before, describe, test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";
import request from "supertest";
import { REFRESH_COOKIE_NAME } from "../auth/refresh-cookie.js";
import { createId } from "../auth/create-id.js";
import {
  generateRegistrationInvitePlaintext,
  hashRegistrationInviteToken,
  registrationInviteTtlMs,
} from "../auth/invite-token.crypto.js";
import { currentRegisterClientFields } from "@soma/shared-types";
import { persistSpecialCategoryGrant } from "../auth/special-category-consent.js";
import { PrismaService } from "../prisma/prisma.service.js";

const ORIGIN = "http://localhost:5173";
const PASSWORD_A = "iso-pass-A-9f3k2m";
const PASSWORD_A_AFTER_RESET = "iso-pass-A2-7q1n8p";
const PASSWORD_B = "iso-pass-B-4h6w0d";
const RUN_ID = createId();

type HttpApp = INestApplication;
type SuperAgent = ReturnType<typeof request>;

interface Session {
  id: string;
  email: string;
  displayName: string;
  accessToken: string;
  refresh: string;
}

interface ProfileBody {
  onboardingStatus: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    birthYear: number;
    weightKg: number | null;
  };
  usages: Array<{
    id: string;
    userId: string;
    substanceId: string;
    yearStarted: number;
    frequency: string;
    status: string;
    lastUseDate: string | null;
  }>;
}

interface AchievementBody {
  id: string;
  unlocked: boolean;
  unlockedAt: string | null;
  notifiedAt: string | null;
  triggerSubstanceId: string;
}

interface PeerSnapshot {
  email: string;
  displayName: string;
  birthYear: number;
  weightKg: number | null;
  onboardingStatus: string;
  usageFingerprint: string;
  unlockedIds: string[];
  notifiedIds: string[];
  refreshActiveCount: number;
  inviteUsedByUserId: string | null;
}

let skipReason: string | null = null;
let app: HttpApp | undefined;
let prisma: PrismaClient | undefined;
let mailer: { sent: Array<{ resetUrl: string }>; last: () => { resetUrl: string } | undefined; clear: () => void };
const inviteIds: string[] = [];
const createdUserIds: string[] = [];
let sessionA: Session | undefined;
let sessionB: Session | undefined;
let inviteBId: string | undefined;
let substanceA: string | undefined;
let substanceB: string | undefined;
let snapshotB: PeerSnapshot | undefined;

function loadLocalEnvFile(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(process.cwd(), ".env"), join(here, "../../.env")];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
    break;
  }
}

function isLocalPostgresUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    return false;
  }
  const host = url.hostname.toLowerCase();
  const allowed = new Set([
    "localhost",
    "127.0.0.1",
    "::1",
    "host.docker.internal",
  ]);
  if (!allowed.has(host)) return false;
  const blocked =
    /prod|staging|amazonaws|neon\.tech|supabase|railway|render\.com|heroku|fly\.io/;
  return !blocked.test(raw.toLowerCase());
}

function applyIsolatedProcessEnv(): void {
  process.env.AUTH_REGISTRATION_MODE = "invite";
  process.env.AUTH_REGISTER_THROTTLE_LIMIT = "50";
  process.env.AUTH_LOGIN_THROTTLE_LIMIT = "50";
  process.env.AUTH_REFRESH_THROTTLE_LIMIT = "80";
  process.env.AUTH_FORGOT_PASSWORD_THROTTLE_LIMIT = "20";
  process.env.AUTH_RESET_PASSWORD_THROTTLE_LIMIT = "20";
  process.env.AUTH_DELETE_ACCOUNT_THROTTLE_LIMIT = "20";
  process.env.AUTH_PASSWORD_RESET_MIN_MS = "0";
  process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? ORIGIN;
  process.env.APP_PUBLIC_URL = process.env.APP_PUBLIC_URL ?? ORIGIN;
}

function cookieValue(res: request.Response, name: string): string | undefined {
  const raw = res.headers["set-cookie"];
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  for (const entry of list) {
    if (entry.startsWith(`${name}=`)) {
      return entry.split(";")[0]!.slice(name.length + 1);
    }
  }
  return undefined;
}

function jwtSub(accessToken: string): string {
  const payload = accessToken.split(".")[1];
  if (!payload) throw new Error("access token is not a JWT");
  const json = JSON.parse(
    Buffer.from(payload, "base64url").toString("utf8"),
  ) as { sub?: unknown };
  if (typeof json.sub !== "string" || json.sub.length === 0) {
    throw new Error("JWT is missing sub");
  }
  return json.sub;
}

function http(): SuperAgent {
  if (!app) throw new Error("app is not started");
  return request(app.getHttpServer());
}

function auth(session: Session) {
  return {
    Authorization: `Bearer ${session.accessToken}`,
  };
}

function originHeaders() {
  return { Origin: ORIGIN };
}

function usageFingerprint(profile: ProfileBody): string {
  return [...profile.usages]
    .map(
      (row) =>
        `${row.substanceId}|${row.yearStarted}|${row.frequency}|${row.status}|${row.lastUseDate ?? ""}`,
    )
    .sort()
    .join(";");
}

async function mintInvite(): Promise<{ id: string; plaintext: string }> {
  if (!prisma) throw new Error("prisma is not connected");
  const plaintext = generateRegistrationInvitePlaintext();
  const id = createId();
  await prisma.registrationInvite.create({
    data: {
      id,
      tokenHash: hashRegistrationInviteToken(plaintext),
      expiresAt: new Date(Date.now() + registrationInviteTtlMs()),
    },
  });
  inviteIds.push(id);
  return { id, plaintext };
}

async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
  biologicalSex: "male" | "female";
  birthYear: number;
  inviteToken: string;
}): Promise<Session> {
  const res = await http().post("/auth/register").send({
    email: input.email,
    password: input.password,
    displayName: input.displayName,
    biologicalSex: input.biologicalSex,
    inviteToken: input.inviteToken,
    ...currentRegisterClientFields(),
    birthDate: `${input.birthYear}-06-15`,
  });
  assert.equal(res.status, 201, "register must succeed with a live invite");
  const refresh = cookieValue(res, REFRESH_COOKIE_NAME);
  assert.ok(refresh, "register must set a refresh cookie");
  assert.equal(typeof res.body.accessToken, "string");
  const session: Session = {
    id: res.body.user.id,
    email: res.body.user.email,
    displayName: res.body.user.displayName,
    accessToken: res.body.accessToken,
    refresh,
  };
  createdUserIds.push(session.id);
  assert.equal(jwtSub(session.accessToken), session.id);
  if (!prisma) throw new Error("prisma is not connected");
  await persistSpecialCategoryGrant(prisma as unknown as PrismaService, session.id);
  return session;
}

async function getProfile(session: Session): Promise<ProfileBody> {
  const res = await http().get("/me/profile").set(auth(session));
  assert.equal(res.status, 200);
  return res.body as ProfileBody;
}

async function getAchievements(session: Session): Promise<AchievementBody[]> {
  const res = await http().get("/me/achievements").set(auth(session));
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  return res.body as AchievementBody[];
}

async function snapshotPeer(session: Session, inviteId: string): Promise<PeerSnapshot> {
  if (!prisma) throw new Error("prisma is not connected");
  const profile = await getProfile(session);
  const achievements = await getAchievements(session);
  const refreshActiveCount = await prisma.refreshToken.count({
    where: { userId: session.id, revokedAt: null },
  });
  const invite = await prisma.registrationInvite.findUnique({
    where: { id: inviteId },
  });
  return {
    email: profile.user.email,
    displayName: profile.user.displayName,
    birthYear: profile.user.birthYear,
    weightKg: profile.user.weightKg,
    onboardingStatus: profile.onboardingStatus,
    usageFingerprint: usageFingerprint(profile),
    unlockedIds: achievements
      .filter((row) => row.unlocked)
      .map((row) => row.id)
      .sort(),
    notifiedIds: achievements
      .filter((row) => row.notifiedAt)
      .map((row) => row.id)
      .sort(),
    refreshActiveCount,
    inviteUsedByUserId: invite?.usedByUserId ?? null,
  };
}

async function assertPeerIntact(label: string): Promise<void> {
  assert.ok(sessionB, "session B must exist");
  assert.ok(inviteBId, "invite B must exist");
  assert.ok(snapshotB, "B snapshot must exist");
  const current = await snapshotPeer(sessionB, inviteBId);
  assert.deepEqual(
    current,
    snapshotB,
    `${label}: user B personal data must stay unchanged`,
  );
}

function requireLive(t: { skip: (reason?: string) => void }): boolean {
  if (skipReason) {
    t.skip(skipReason);
    return false;
  }
  return true;
}

describe("HTTP isolation between disposable users A and B", () => {
before(async () => {
  loadLocalEnvFile();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    skipReason = "DATABASE_URL is unset";
    return;
  }
  if (!isLocalPostgresUrl(databaseUrl)) {
    skipReason = "DATABASE_URL is not local development PostgreSQL";
    return;
  }
  if (!process.env.JWT_SECRET) {
    skipReason = "JWT_SECRET is unset";
    return;
  }

  applyIsolatedProcessEnv();

  prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "tokenHash" FROM "RegistrationInvite" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    prisma = undefined;
    skipReason = "DATABASE_URL unreachable or migration not applied";
    return;
  }

  // tsx does not emit design:paramtypes. Boot the tsc build so Nest DI
  // (JwtStrategy, AuthService, …) matches production.
  const distApp = join(dirname(fileURLToPath(import.meta.url)), "../../dist/app.module.js");
  if (!existsSync(distApp)) {
    skipReason = "API dist is missing; compile with tsc -b before this suite";
    return;
  }

  try {
    const [{ AppModule }, mailerModule] = await Promise.all([
      import("../../dist/app.module.js") as Promise<{
        AppModule: new (...args: never[]) => unknown;
      }>,
      import("../../dist/auth/password-reset.mailer.js") as Promise<{
        PASSWORD_RESET_MAILER: symbol;
        MemoryPasswordResetMailer: new () => {
          sent: Array<{ resetUrl: string }>;
          last: () => { resetUrl: string } | undefined;
          clear: () => void;
        };
      }>,
    ]);
    mailer = new mailerModule.MemoryPasswordResetMailer();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(mailerModule.PASSWORD_RESET_MAILER)
      .useValue(mailer)
      .compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const catalog = await http().get("/substances");
    assert.equal(catalog.status, 200);
    const substances = catalog.body as Array<{ id: string }>;
    const catalogIds = substances.map((row) => row.id);
    substanceA = catalogIds.includes("alcohol") ? "alcohol" : catalogIds[0];
    substanceB = catalogIds.includes("nicotine")
      ? "nicotine"
      : catalogIds.find((id) => id !== substanceA);
    if (!substanceA || !substanceB) {
      skipReason = "catalog must contain at least two substances";
      return;
    }

    const inviteA = await mintInvite();
    const inviteB = await mintInvite();
    inviteBId = inviteB.id;

    sessionA = await registerUser({
      email: `iso-a-${RUN_ID}@example.test`,
      password: PASSWORD_A,
      displayName: `IsoA ${RUN_ID.slice(0, 8)}`,
      biologicalSex: "female",
      birthYear: 1988,
      inviteToken: inviteA.plaintext,
    });
    sessionB = await registerUser({
      email: `iso-b-${RUN_ID}@example.test`,
      password: PASSWORD_B,
      displayName: `IsoB ${RUN_ID.slice(0, 8)}`,
      biologicalSex: "male",
      birthYear: 1992,
      inviteToken: inviteB.plaintext,
    });

    if (sessionA.id === sessionB.id) {
      throw new Error("A and B must receive distinct user ids");
    }
    if (sessionA.accessToken === sessionB.accessToken) {
      throw new Error("A and B must receive distinct access tokens");
    }
    if (sessionA.refresh === sessionB.refresh) {
      throw new Error("A and B must receive distinct refresh cookies");
    }

    const putB = await http()
      .put("/me/profile")
      .set(auth(sessionB))
      .send({
        usages: [
          {
            substanceId: substanceB,
            yearStarted: 2018,
            frequency: "weekly",
            status: "abstinent",
            lastUseDate: "2021-06-15",
          },
        ],
      });
    assert.equal(putB.status, 200);

    snapshotB = await snapshotPeer(sessionB, inviteB.id);
    assert.equal(snapshotB.email, sessionB.email);
    assert.match(snapshotB.usageFingerprint, new RegExp(substanceB));
    assert.equal(snapshotB.inviteUsedByUserId, sessionB.id);
  } catch (err) {
    skipReason =
      err instanceof Error
        ? `isolation setup failed: ${err.message}`
        : "isolation setup failed";
  }
});

after(async () => {
  const leftovers: string[] = [];
  if (prisma) {
    for (const id of createdUserIds) {
      try {
        await prisma.user.delete({ where: { id } });
      } catch {
        const stillThere = await prisma.user.findUnique({ where: { id } });
        if (stillThere) leftovers.push(`user:${id}`);
      }
    }
    if (inviteIds.length > 0) {
      try {
        await prisma.registrationInvite.deleteMany({
          where: { id: { in: inviteIds } },
        });
      } catch {
        leftovers.push(`invites:${inviteIds.join(",")}`);
      }
    }
    await prisma.$disconnect().catch(() => undefined);
  }
  if (app) {
    await app.close().catch(() => undefined);
  }
  if (leftovers.length > 0) {
    throw new Error(
      `Isolation suite cleanup incomplete. Manual recovery ids: ${leftovers.join("; ")}`,
    );
  }
});

test("GET /auth/me returns only the JWT subject", async (t) => {
  if (!requireLive(t) || !sessionA || !sessionB) return;
  const meA = await http().get("/auth/me").set(auth(sessionA));
  const meB = await http().get("/auth/me").set(auth(sessionB));
  assert.equal(meA.status, 200);
  assert.equal(meB.status, 200);
  assert.equal(meA.body.id, sessionA.id);
  assert.equal(meA.body.email, sessionA.email);
  assert.equal(meB.body.id, sessionB.id);
  assert.equal(meB.body.email, sessionB.email);
  assert.notEqual(meA.body.id, meB.body.id);
  assert.equal(meA.body.email === meB.body.email, false);
});

test("refresh of A rotates only A's family", async (t) => {
  if (!requireLive(t) || !sessionA || !sessionB || !prisma) return;
  const beforeB = await prisma.refreshToken.findMany({
    where: { userId: sessionB.id, revokedAt: null },
    select: { id: true, tokenHash: true },
  });
  assert.ok(beforeB.length >= 1);

  const res = await http()
    .post("/auth/refresh")
    .set(originHeaders())
    .set("Cookie", `${REFRESH_COOKIE_NAME}=${sessionA.refresh}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.user.id, sessionA.id);
  assert.equal(jwtSub(res.body.accessToken), sessionA.id);
  const nextRefresh = cookieValue(res, REFRESH_COOKIE_NAME);
  assert.ok(nextRefresh);
  if (nextRefresh === sessionA.refresh) {
    throw new Error("A refresh cookie must rotate");
  }
  sessionA.accessToken = res.body.accessToken;
  sessionA.refresh = nextRefresh;

  const afterB = await prisma.refreshToken.findMany({
    where: { userId: sessionB.id, revokedAt: null },
    select: { id: true, tokenHash: true },
  });
  assert.deepEqual(afterB, beforeB);

  const meB = await http()
    .post("/auth/refresh")
    .set(originHeaders())
    .set("Cookie", `${REFRESH_COOKIE_NAME}=${sessionB.refresh}`);
  assert.equal(meB.status, 200);
  assert.equal(meB.body.user.id, sessionB.id);
  const nextB = cookieValue(meB, REFRESH_COOKIE_NAME);
  assert.ok(nextB);
  sessionB.accessToken = meB.body.accessToken;
  sessionB.refresh = nextB;
  snapshotB = await snapshotPeer(sessionB, inviteBId!);
});

test("GET /me/profile isolates substances and dates", async (t) => {
  if (!requireLive(t) || !sessionA || !sessionB || !substanceA || !substanceB) {
    return;
  }

  const putA = await http()
    .put("/me/profile")
    .set(auth(sessionA))
    .send({
      usages: [
        {
          substanceId: substanceA,
          yearStarted: 2016,
          frequency: "daily",
          status: "abstinent",
          lastUseDate: "2020-01-10",
        },
      ],
    });
  assert.equal(putA.status, 200);
  const profileA = putA.body as ProfileBody;
  assert.equal(profileA.user.id, sessionA.id);
  assert.equal(profileA.user.email, sessionA.email);
  assert.equal(profileA.usages.length, 1);
  assert.equal(profileA.usages[0]?.substanceId, substanceA);
  assert.equal(profileA.usages[0]?.lastUseDate?.startsWith("2020-01-10"), true);
  assert.equal(profileA.usages[0]?.userId, sessionA.id);

  const profileB = await getProfile(sessionB);
  assert.equal(profileB.user.id, sessionB.id);
  assert.equal(profileB.user.email, sessionB.email);
  assert.equal(profileB.usages.length, 1);
  assert.equal(profileB.usages[0]?.substanceId, substanceB);
  assert.equal(profileB.usages[0]?.lastUseDate?.startsWith("2021-06-15"), true);
  assert.equal(
    profileB.usages.some((row) => row.substanceId === substanceA),
    false,
  );
  assert.equal(
    profileA.usages.some((row) => row.substanceId === substanceB),
    false,
  );
  await assertPeerIntact("after A PUT /me/profile");
});

test("PUT /me/profile rejects client-controlled userId", async (t) => {
  if (!requireLive(t) || !sessionA || !sessionB || !substanceA) return;

  const root = await http()
    .put("/me/profile")
    .set(auth(sessionA))
    .send({
      userId: sessionB.id,
      usages: [
        {
          substanceId: substanceA,
          yearStarted: 2016,
          frequency: "daily",
          status: "abstinent",
          lastUseDate: "2020-01-10",
        },
      ],
    });
  assert.equal(root.status, 400);

  const nested = await http()
    .put("/me/profile")
    .set(auth(sessionA))
    .send({
      usages: [
        {
          userId: sessionB.id,
          substanceId: substanceA,
          yearStarted: 2016,
          frequency: "daily",
          status: "abstinent",
          lastUseDate: "2020-01-10",
        },
      ],
    });
  assert.equal(nested.status, 400);

  await assertPeerIntact("after forged userId on PUT /me/profile");
});

test("PATCH details and onboarding of A leave B unchanged", async (t) => {
  if (!requireLive(t) || !sessionA || !sessionB) return;

  const details = await http()
    .patch("/me/profile/details")
    .set(auth(sessionA))
    .send({ displayName: `IsoA-renamed ${RUN_ID.slice(0, 6)}`, weightKg: 61.5 });
  assert.equal(details.status, 200);
  assert.equal(details.body.user.id, sessionA.id);
  assert.match(details.body.user.displayName, /IsoA-renamed/);
  assert.equal(details.body.user.weightKg, 61.5);

  const extra = await http()
    .patch("/me/profile/details")
    .set(auth(sessionA))
    .send({ displayName: "nope", userId: sessionB.id });
  assert.equal(extra.status, 400);

  const onboarding = await http()
    .patch("/me/profile/onboarding-status")
    .set(auth(sessionA))
    .send({ status: "completed" });
  assert.equal(onboarding.status, 200);
  assert.equal(onboarding.body.onboardingStatus, "completed");

  const profileB = await getProfile(sessionB);
  assert.equal(profileB.user.displayName, sessionB.displayName);
  assert.equal(profileB.onboardingStatus, "pending");
  await assertPeerIntact("after A PATCH details and onboarding");
});

test("achievements, NT, and narratives derive from the JWT owner", async (t) => {
  if (!requireLive(t) || !sessionA || !sessionB || !substanceA || !substanceB) {
    return;
  }

  const [achA, achB] = await Promise.all([
    getAchievements(sessionA),
    getAchievements(sessionB),
  ]);
  const unlockedA = achA.filter((row) => row.unlocked);
  const unlockedB = achB.filter((row) => row.unlocked);
  assert.ok(unlockedA.length > 0, "A should unlock from long abstinence");
  assert.ok(unlockedB.length > 0, "B should unlock from long abstinence");
  assert.equal(
    unlockedA.every((row) => row.triggerSubstanceId === substanceA),
    true,
  );
  assert.equal(
    unlockedB.every((row) => row.triggerSubstanceId === substanceB),
    true,
  );

  const notifiedBeforeB = new Set(snapshotB?.notifiedIds ?? []);
  const forged = await http()
    .post("/me/achievements/mark-notified")
    .set(auth(sessionA))
    .send({
      userId: sessionB.id,
      achievementIds: unlockedB.map((row) => row.id),
    });
  assert.equal(forged.status, 400);

  const markA = await http()
    .post("/me/achievements/mark-notified")
    .set(auth(sessionA))
    .send({
      achievementIds: [
        ...unlockedA.map((row) => row.id),
        ...unlockedB.map((row) => row.id),
        "not-a-real-achievement",
      ],
    });
  assert.ok(markA.status === 200 || markA.status === 201);
  assert.equal(markA.body.updated, unlockedA.length);

  const achAAfter = await getAchievements(sessionA);
  const achBAfter = await getAchievements(sessionB);
  assert.equal(
    unlockedA.every(
      (row) => achAAfter.find((item) => item.id === row.id)?.notifiedAt,
    ),
    true,
  );
  assert.equal(
    unlockedB.every((row) => {
      const after = achBAfter.find((item) => item.id === row.id);
      return after?.unlocked && !after.notifiedAt;
    }),
    true,
  );
  assert.deepEqual(
    achBAfter.filter((row) => row.notifiedAt).map((row) => row.id).sort(),
    [...notifiedBeforeB].sort(),
  );

  const ntA = await http()
    .get("/me/neurotransmitter-state")
    .set(auth(sessionA));
  const ntB = await http()
    .get("/me/neurotransmitter-state")
    .set(auth(sessionB));
  assert.equal(ntA.status, 200);
  assert.equal(ntB.status, 200);
  const sourcesA = (ntA.body as Array<{ sources: Array<{ substanceId: string }> }>)
    .flatMap((row) => row.sources.map((source) => source.substanceId));
  const sourcesB = (ntB.body as Array<{ sources: Array<{ substanceId: string }> }>)
    .flatMap((row) => row.sources.map((source) => source.substanceId));
  assert.ok(sourcesA.length > 0, "A neurotransmitter state must have sources");
  assert.ok(sourcesB.length > 0, "B neurotransmitter state must have sources");
  assert.equal(sourcesA.every((id) => id === substanceA), true);
  assert.equal(sourcesB.every((id) => id === substanceB), true);
  assert.equal(sourcesA.includes(substanceB), false);
  assert.equal(sourcesB.includes(substanceA), false);

  const narA = await http()
    .get("/me/organ-narrative-state")
    .set(auth(sessionA));
  const narB = await http()
    .get("/me/organ-narrative-state")
    .set(auth(sessionB));
  assert.equal(narA.status, 200);
  assert.equal(narB.status, 200);
  const narSubA = (narA.body as Array<{ sourceSubstanceId: string }>).map(
    (row) => row.sourceSubstanceId,
  );
  const narSubB = (narB.body as Array<{ sourceSubstanceId: string }>).map(
    (row) => row.sourceSubstanceId,
  );
  assert.ok(narSubA.length > 0, "A organ narratives must be present");
  assert.ok(narSubB.length > 0, "B organ narratives must be present");
  assert.equal(narSubA.every((id) => id === substanceA), true);
  assert.equal(narSubB.every((id) => id === substanceB), true);

  snapshotB = await snapshotPeer(sessionB, inviteBId!);
});

test("logout of A does not revoke B", async (t) => {
  if (!requireLive(t) || !sessionA || !sessionB || !prisma) return;

  const logout = await http()
    .post("/auth/logout")
    .set(originHeaders())
    .set("Cookie", `${REFRESH_COOKIE_NAME}=${sessionA.refresh}`);
  assert.equal(logout.status, 200);

  const refreshA = await http()
    .post("/auth/refresh")
    .set(originHeaders())
    .set("Cookie", `${REFRESH_COOKIE_NAME}=${sessionA.refresh}`);
  assert.equal(refreshA.status, 401);

  const stillA = await http().get("/auth/me").set(auth(sessionA));
  assert.equal(stillA.status, 200);
  assert.equal(stillA.body.id, sessionA.id);

  const refreshB = await http()
    .post("/auth/refresh")
    .set(originHeaders())
    .set("Cookie", `${REFRESH_COOKIE_NAME}=${sessionB.refresh}`);
  assert.equal(refreshB.status, 200);
  assert.equal(refreshB.body.user.id, sessionB.id);
  const nextB = cookieValue(refreshB, REFRESH_COOKIE_NAME);
  assert.ok(nextB);
  sessionB.accessToken = refreshB.body.accessToken;
  sessionB.refresh = nextB;

  const loginA = await http().post("/auth/login").send({
    email: sessionA.email,
    password: PASSWORD_A,
  });
  assert.equal(loginA.status, 200);
  const nextA = cookieValue(loginA, REFRESH_COOKIE_NAME);
  assert.ok(nextA);
  sessionA.accessToken = loginA.body.accessToken;
  sessionA.refresh = nextA;
  snapshotB = await snapshotPeer(sessionB, inviteBId!);
});

test("password reset of A does not revoke B", async (t) => {
  if (!requireLive(t) || !sessionA || !sessionB || !prisma) return;

  mailer.clear();
  const forgot = await http()
    .post("/auth/forgot-password")
    .send({ email: sessionA.email });
  assert.equal(forgot.status, 200);
  const sent = mailer.last();
  assert.ok(sent, "memory mailer must capture A's reset URL");
  const token = new URL(sent.resetUrl).searchParams.get("token");
  assert.ok(token);

  const reset = await http()
    .post("/auth/reset-password")
    .send({ token, newPassword: PASSWORD_A_AFTER_RESET });
  assert.equal(reset.status, 200);

  const refreshA = await http()
    .post("/auth/refresh")
    .set(originHeaders())
    .set("Cookie", `${REFRESH_COOKIE_NAME}=${sessionA.refresh}`);
  assert.equal(refreshA.status, 401);

  const refreshB = await http()
    .post("/auth/refresh")
    .set(originHeaders())
    .set("Cookie", `${REFRESH_COOKIE_NAME}=${sessionB.refresh}`);
  assert.equal(refreshB.status, 200);
  assert.equal(refreshB.body.user.id, sessionB.id);
  const nextB = cookieValue(refreshB, REFRESH_COOKIE_NAME);
  assert.ok(nextB);
  sessionB.accessToken = refreshB.body.accessToken;
  sessionB.refresh = nextB;

  const loginA = await http().post("/auth/login").send({
    email: sessionA.email,
    password: PASSWORD_A_AFTER_RESET,
  });
  assert.equal(loginA.status, 200);
  const nextA = cookieValue(loginA, REFRESH_COOKIE_NAME);
  assert.ok(nextA);
  sessionA.accessToken = loginA.body.accessToken;
  sessionA.refresh = nextA;
  snapshotB = await snapshotPeer(sessionB, inviteBId!);
});

test("DELETE /me/account of A leaves B intact and rejects A's JWT", async (t) => {
  if (!requireLive(t) || !sessionA || !sessionB || !prisma || !inviteBId) {
    return;
  }

  const bBefore = await snapshotPeer(sessionB, inviteBId);
  const previousJwt = sessionA.accessToken;

  const extra = await http()
    .delete("/me/account")
    .set(auth(sessionA))
    .set(originHeaders())
    .send({ password: PASSWORD_A_AFTER_RESET, userId: sessionB.id });
  assert.equal(extra.status, 400);

  const deleted = await http()
    .delete("/me/account")
    .set(auth(sessionA))
    .set(originHeaders())
    .send({ password: PASSWORD_A_AFTER_RESET });
  assert.equal(deleted.status, 204);

  const gone = await prisma.user.findUnique({ where: { id: sessionA.id } });
  assert.equal(gone, null);
  assert.equal(
    await prisma.substanceUsage.count({ where: { userId: sessionA.id } }),
    0,
  );
  assert.equal(
    await prisma.userAchievement.count({ where: { userId: sessionA.id } }),
    0,
  );
  assert.equal(
    await prisma.refreshToken.count({ where: { userId: sessionA.id } }),
    0,
  );

  const meGone = await http()
    .get("/auth/me")
    .set({ Authorization: `Bearer ${previousJwt}` });
  assert.equal(meGone.status, 401);
  const profileGone = await http()
    .get("/me/profile")
    .set({ Authorization: `Bearer ${previousJwt}` });
  assert.equal(profileGone.status, 401);

  const bAfter = await snapshotPeer(sessionB, inviteBId);
  assert.deepEqual(bAfter, bBefore);
  const stillB = await prisma.user.findUnique({ where: { id: sessionB.id } });
  assert.ok(stillB);
  assert.equal(stillB.email, sessionB.email);

  const meB = await http().get("/auth/me").set(auth(sessionB));
  assert.equal(meB.status, 200);
  assert.equal(meB.body.id, sessionB.id);
});
});
