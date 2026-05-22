import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../generated/prisma";
import { MailService } from "../mail/mail.service";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ⚠️ IMPORTANT: we create mail service manually (Better Auth runs outside Nest DI)
const mailService = new MailService();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      firstName: { type: "string", required: true },
      lastName: { type: "string", required: true },
      username: { type: "string", required: true },
      birthDate: { type: "date", required: true },
      phoneNumber: { type: "string", required: true },
      role: { type: "string", defaultValue: "USER" },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },

  emailVerification: {
    enabled: true,

    async sendVerificationEmail({ user, token }) {
      const url = `http://localhost:3000/auth/verify-email?token=${token}`;

      await mailService.sendEmail(
        user.email,
        "Verify your email",
        `
          <h2>Email Verification</h2>
          <p>Click the link below to verify your account:</p>
          <a href="${url}">${url}</a>
        `
      );
    },
  },

  trustedOrigins: ["http://localhost:3000"],
});