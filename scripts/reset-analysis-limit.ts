// Reset analysis count for jeevansaims@gmail.com and set as Pro
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userEmail = 'jeevansaims@gmail.com';
  
  console.log(`Updating user: ${userEmail}...`);
  
  const updated = await prisma.user.update({
    where: { email: userEmail },
    data: {
      analysisCount: 0,     // Reset to 0
      isPro: true,          // Set as Pro for unlimited analyses
    },
  });
  
  console.log('\n✅ User updated successfully!');
  console.log(`  Email: ${updated.email}`);
  console.log(`  Analysis Count: ${updated.analysisCount}`);
  console.log(`  Pro Status: ${updated.isPro ? '✓ PRO (unlimited)' : '✗ Free (5 limit)'}`);
  console.log('\n🎉 You now have UNLIMITED analyses!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
