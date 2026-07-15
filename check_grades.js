const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const g = await prisma.gradeLevel.findMany();
  console.log('Grades:', g.map(x => x.name));
}

main().finally(() => prisma.$disconnect());
