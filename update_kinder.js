const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

async function run() {
  await prisma.gradeLevel.deleteMany({where: {name: 'Kindergarten'}});
  await prisma.gradeLevel.create({data: {id: uuidv4(), name: 'Kindergarten 1', level: 0, keyStage: 'Key Stage 1', count: 0}});
  await prisma.gradeLevel.create({data: {id: uuidv4(), name: 'Kindergarten 2', level: 0, keyStage: 'Key Stage 1', count: 0}});
  console.log('Done replacing Kindergarten with Kindergarten 1 and 2');
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
