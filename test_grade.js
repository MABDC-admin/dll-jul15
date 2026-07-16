const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const g = await prisma.gradeLevel.findFirst({where: {name: 'Kindergarten 1'}});
  console.log(g);
}

main().finally(() => prisma.$disconnect());
