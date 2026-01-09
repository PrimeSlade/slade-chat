import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const users = [
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      username: 'alice_j',
      bio: 'Software engineer passionate about web development',
      image: 'https://i.pravatar.cc/150?img=1',
      password: 'password123',
    },
    {
      name: 'Bob Smith',
      email: 'bob@example.com',
      username: 'bob_smith',
      bio: 'Full-stack developer and tech enthusiast',
      image: 'https://i.pravatar.cc/150?img=2',
      password: 'password123',
    },
    {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      username: 'charlie_b',
      bio: 'Frontend developer specializing in React',
      image: 'https://i.pravatar.cc/150?img=3',
      password: 'password123',
    },
    {
      name: 'Diana Prince',
      email: 'diana@example.com',
      username: 'diana_p',
      bio: 'UX designer with a love for clean interfaces',
      image: 'https://i.pravatar.cc/150?img=4',
      password: 'password123',
    },
    {
      name: 'Ethan Hunt',
      email: 'ethan@example.com',
      username: 'ethan_h',
      bio: 'Backend developer focused on scalable systems',
      image: 'https://i.pravatar.cc/150?img=5',
      password: 'password123',
    },
    {
      name: 'Fiona Green',
      email: 'fiona@example.com',
      username: 'fiona_g',
      bio: 'DevOps engineer and cloud enthusiast',
      image: 'https://i.pravatar.cc/150?img=6',
      password: 'password123',
    },
    {
      name: 'George Wilson',
      email: 'george@example.com',
      username: 'george_w',
      bio: 'Mobile app developer for iOS and Android',
      image: 'https://i.pravatar.cc/150?img=7',
      password: 'password123',
    },
    {
      name: 'Hannah Lee',
      email: 'hannah@example.com',
      username: 'hannah_l',
      bio: 'Data scientist exploring machine learning',
      image: 'https://i.pravatar.cc/150?img=8',
      password: 'password123',
    },
    {
      name: 'Ian Wright',
      email: 'ian@example.com',
      username: 'ian_w',
      bio: 'Game developer and Unity expert',
      image: 'https://i.pravatar.cc/150?img=9',
      password: 'password123',
    },
    {
      name: 'Julia Roberts',
      email: 'julia@example.com',
      username: 'julia_r',
      bio: 'Product manager with technical background',
      image: 'https://i.pravatar.cc/150?img=10',
      password: 'password123',
    },
  ];

  for (const userData of users) {
    const { password, ...userWithoutPassword } = userData;

    // Generate unique ID for better-auth compatibility
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: userId,
        ...userWithoutPassword,
        emailVerified: false,
        accounts: {
          create: {
            id: `account_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            accountId: userWithoutPassword.email,
            providerId: 'credential',
            password: hashedPassword,
          },
        },
      },
    });

    console.log(`Created user: ${user.name} (${user.email})`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
