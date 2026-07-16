const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mapping = [
  // Kindergarten
  { code: 'K-SOC', grades: ['Kindergarten 1', 'Kindergarten 2'] },
  { code: 'K-VAL', grades: ['Kindergarten 1', 'Kindergarten 2'] },
  { code: 'K-AES', grades: ['Kindergarten 1', 'Kindergarten 2'] },
  { code: 'K-PHYS', grades: ['Kindergarten 1', 'Kindergarten 2'] },
  { code: 'K-LANG', grades: ['Kindergarten 1', 'Kindergarten 2'] },
  { code: 'K-ENV', grades: ['Kindergarten 1', 'Kindergarten 2'] },
  { code: 'K-MATH', grades: ['Kindergarten 1', 'Kindergarten 2'] },

  // Grades 1-3
  { code: 'READ', grades: ['Grade 1', 'Grade 2', 'Grade 3'] },
  { code: 'LANG', grades: ['Grade 1', 'Grade 2', 'Grade 3'] },
  { code: 'MAKA', grades: ['Grade 1', 'Grade 2', 'Grade 3'] },
  { code: 'GMRC', grades: ['Grade 1', 'Grade 2', 'Grade 3'] },

  // Shared 1-10 (For Math, Eng, Fil, AP, Science, MAPEH)
  { code: 'FIL', grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'] },
  { code: 'ENG', grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'] },
  { code: 'MATH', grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'] },
  
  // Science starts grade 3 or 4? Usually Grade 3. I will add 3-10
  { code: 'SCI', grades: ['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'] },
  { code: 'AP', grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'] },
  { code: 'MAPEH', grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'] },
  { code: 'TLE', grades: ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'] },
  { code: 'VAL', grades: ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'] }
];

async function main() {
  for (const m of mapping) {
    const subj = await prisma.subject.findFirst({ where: { code: m.code } });
    if (subj) {
      await prisma.subject.update({
        where: { id: subj.id },
        data: { gradeLevels: JSON.stringify(m.grades) }
      });
      console.log(`Updated Subject mappings for ${m.code}`);
    }
  }

  const allGrades = await prisma.gradeLevel.findMany();
  for (const g of allGrades) {
    const matchedSubjects = mapping.filter(m => m.grades.includes(g.name)).map(m => m.code);
    const names = [];
    for (const c of matchedSubjects) {
      const s = await prisma.subject.findFirst({ where: { code: c } });
      if (s) names.push(s.name);
    }
    
    const uniqueNames = [...new Set(names)];
    
    await prisma.gradeLevel.update({
      where: { id: g.id },
      data: { subjects: JSON.stringify(uniqueNames) }
    });
    console.log(`Updated GradeLevel ${g.name} with subjects:`, uniqueNames);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
