const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteMockups() {
  console.log('Deleting mockup teachers...');
  
  // Find all mock teachers
  const mockTeachers = await prisma.user.findMany({
    where: {
      role: 'TEACHER',
      name: {
        startsWith: 'Teacher '
      }
    }
  });

  for (const t of mockTeachers) {
    // Delete their teacher profile and user account.
    // Prisma will cascade delete lessonLogs if we configured it, otherwise we manually delete them.
    const profile = await prisma.teacherProfile.findUnique({ where: { userId: t.id } });
    
    if (profile) {
      await prisma.lessonLog.deleteMany({ where: { teacherProfileId: profile.id } });
      await prisma.teacherProfile.delete({ where: { id: profile.id } });
    }
    
    await prisma.user.delete({ where: { id: t.id } });
    console.log(`Deleted ${t.name}`);
  }

  console.log('Finished deleting mockups!');
}

deleteMockups()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
