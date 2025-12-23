// List all users
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      analysisCount: true,
      isPro: true,
    },
  });
  
  console.log('\n📊 Users in database:');
  console.log(JSON.stringify(users, null, 2));
}

main()
  .finally(() => prisma.$disconnect());
