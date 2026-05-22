import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../prisma/prisma";

// import { MailService } from "../mail/mail.service";

// const mailService = new MailService();

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
    expiresIn: 60 * 60 * 24 * 7,
  },

  emailVerification: {
    enabled: true,
    async sendVerificationEmail({ user, token }) {
      const url = `http://localhost:3000/auth/verify-email?token=${token}`;

      // await mailService.sendEmail(
      //   user.email,
      //   "Verify your email",
      //   `<a href="${url}">${url}</a>`
      // );
    },
  },

  trustedOrigins: ["http://localhost:3000"],
});