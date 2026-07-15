const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

const grades = [
  { name: 'Kindergarten 1', level: 0, keyStage: 'Key Stage 1', count: 0 },
  { name: 'Kindergarten 2', level: 0, keyStage: 'Key Stage 1', count: 0 },
  { name: 'Grade 1', level: 1, keyStage: 'Key Stage 1', count: 0 },
  { name: 'Grade 2', level: 2, keyStage: 'Key Stage 1', count: 0 },
  { name: 'Grade 3', level: 3, keyStage: 'Key Stage 1', count: 0 },
  { name: 'Grade 4', level: 4, keyStage: 'Key Stage 2', count: 0 },
  { name: 'Grade 5', level: 5, keyStage: 'Key Stage 2', count: 0 },
  { name: 'Grade 6', level: 6, keyStage: 'Key Stage 2', count: 0 },
  { name: 'Grade 7', level: 7, keyStage: 'Key Stage 3', count: 0 },
  { name: 'Grade 8', level: 8, keyStage: 'Key Stage 3', count: 0 },
  { name: 'Grade 9', level: 9, keyStage: 'Key Stage 3', count: 0 },
  { name: 'Grade 10', level: 10, keyStage: 'Key Stage 3', count: 0 },
];

async function main() {
  console.log('Seeding Grade Levels...');
  for (const g of grades) {
    const existing = await prisma.gradeLevel.findFirst({ where: { name: g.name } });
    if (existing) {
      await prisma.gradeLevel.update({
        where: { id: existing.id },
        data: g
      });
    } else {
      await prisma.gradeLevel.create({
        data: {
          id: uuidv4(),
          ...g
        }
      });
    }
  }
  console.log('Successfully seeded all grades!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
