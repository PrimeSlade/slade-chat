import 'dotenv/config';

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '../../generated/prisma/client';
import { jwt, openAPI } from 'better-auth/plugins';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: process.env.BETTER_AUTH_SECRET,
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
  plugins: [openAPI(), jwt()],

  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    disableOriginCheck: true, //Only use this during development!
  },
  trustedOrigins: ['http://localhost:3000'],
  baseURL: process.env.BASE_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: 'select_account consent',
    },
  },
});
