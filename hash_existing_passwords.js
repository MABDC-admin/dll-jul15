const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Fetching all users...');
  const users = await prisma.user.findMany();
  
  console.log(`Found ${users.length} users. Migrating passwords...`);
  
  for (const u of users) {
    if (!u.passwordHash.startsWith('$2a$') && !u.passwordHash.startsWith('$2b$')) {
      console.log(`Hashing password for user: ${u.email}`);
      const hashed = await bcrypt.hash(u.passwordHash, 10);
      
      await prisma.user.update({
        where: { id: u.id },
        data: { passwordHash: hashed }
      });
    } else {
      console.log(`User ${u.email} already has a hashed password.`);
    }
  }
  
  console.log('Successfully secured all user passwords!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
