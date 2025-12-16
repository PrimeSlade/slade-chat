import 'dotenv/config';

import { betterAuth, config } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '../../generated/prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      bio: {
        type: 'string',
        required: false,
      },
      username: {
        type: 'string',
        required: false,
        unique: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    disableOriginCheck: true, //Only use this during development!
  },
  trustedOrigins: ['http://localhost:3000'],
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: 'select_account consent',
    },
  },
});
