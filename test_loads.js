const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const loads = await prisma.teacherSubjectLoad.findMany({take: 10});
  console.log(loads);
}

main().finally(() => prisma.$disconnect());
