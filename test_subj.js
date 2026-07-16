const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const s = await prisma.subject.findMany();
  console.log(s.map(x => ({name: x.name, grades: x.gradeLevels})));
}

main().finally(() => prisma.$disconnect());
