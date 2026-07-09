import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { userSessionRepository } from "@/repositories/user-session.repository";
import {
  SESSION_ALREADY_ACTIVE_MESSAGE,
  getSessionMaxAgeMs,
} from "@/lib/auth/session/constants";
import { generateSessionToken, hashSessionToken } from "@/lib/auth/session/token";
import { getClientIp, parseUserAgent } from "@/lib/auth/session/user-agent";

export class SessionConflictError extends AppError {
  constructor() {
    super(SESSION_ALREADY_ACTIVE_MESSAGE, 409, "SESSION_ALREADY_ACTIVE");
  }
}

export interface CreatedUserSession {
  id: string;
  rawToken: string;
  expiresAt: Date;
}

function rollingExpiresAt(): Date {
  return new Date(Date.now() + getSessionMaxAgeMs());
}

export const userSessionService = {
  async purgeExpiredSessions(): Promise<void> {
    await userSessionRepository.deactivateExpired();
  },

  async hasActiveSession(userId: string): Promise<boolean> {
    await this.purgeExpiredSessions();
    const active = await userSessionRepository.findActiveByUserId(userId);
    return active !== null;
  },

  async createSession(input: {
    userId: string;
    headers: Headers;
  }): Promise<CreatedUserSession> {
    await this.purgeExpiredSessions();

    const rawToken = generateSessionToken();
    const sessionTokenHash = hashSessionToken(rawToken);
    const expiresAt = rollingExpiresAt();
    const userAgent = input.headers.get("user-agent");
    const client = parseUserAgent(userAgent);

    const session = await prisma.$transaction(async (tx) => {
      const active = await tx.userSession.findFirst({
        where: {
          userId: input.userId,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
      });
      if (active) {
        throw new SessionConflictError();
      }

      return tx.userSession.create({
        data: {
          userId: input.userId,
          sessionTokenHash,
          deviceName: client.deviceName,
          browser: client.browser,
          operatingSystem: client.operatingSystem,
          ipAddress: getClientIp(input.headers),
          userAgent,
          expiresAt,
        },
      });
    });

    return { id: session.id, rawToken, expiresAt };
  },

  async validateSession(sessionId: string, rawToken: string): Promise<boolean> {
    await this.purgeExpiredSessions();

    const hash = hashSessionToken(rawToken);
    const session = await userSessionRepository.findValidByIdAndHash(sessionId, hash);
    if (!session) return false;

    await userSessionRepository.touchSession(session.id, rollingExpiresAt());
    return true;
  },

  async revokeSession(sessionId: string): Promise<void> {
    await userSessionRepository.deactivate(sessionId);
  },

  async revokeByToken(userId: string, rawToken: string): Promise<void> {
    const hash = hashSessionToken(rawToken);
    const session = await userSessionRepository.findByTokenHash(hash);
    if (session && session.userId === userId) {
      await userSessionRepository.deactivate(session.id);
    }
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await userSessionRepository.deactivateAllForUser(userId);
  },

  async listActiveSessions() {
    await this.purgeExpiredSessions();
    return userSessionRepository.listActive();
  },

  async adminForceLogout(sessionId: string): Promise<void> {
    await userSessionRepository.deactivate(sessionId);
  },
};
