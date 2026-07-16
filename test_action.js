const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');

// I will mock getValidSubjectsForGrade
function getValidSubjectsForGrade(gradeName, allSubjects) {
  if (!gradeName) return [];
  const allowList = (names) => allSubjects.filter(s => names.includes(s.name));
  
  if (gradeName === 'Grade 2') {
    return allowList(['Filipino', 'English', 'Mathematics', 'Makabansa', 'GMRC']);
  }
  return [];
}

async function main() {
  const allSubjects = await prisma.subject.findMany();
  
  const gradeLevels = ['Grade 2'];
  const subjects = ['English', 'Filipino', 'GMRC', 'Makabansa', 'Mathematics'];
  const sections = ['Section A', 'Section B'];
  
  const newLoads = [];
  for (const grade of gradeLevels) {
    const validSubjectsForGrade = getValidSubjectsForGrade(grade, allSubjects).map(s => s.name);
    console.log(`Valid subjects for ${grade}:`, validSubjectsForGrade);
    
    for (const subject of subjects) {
      console.log(`Checking subject: ${subject}`);
      if (validSubjectsForGrade.includes(subject)) {
        console.log(`- Valid!`);
        for (const section of sections) {
          newLoads.push({
            gradeId: grade,
            sectionName: section,
            subjectName: subject
          });
        }
      }
    }
  }
  
  console.log('New Loads:', newLoads);
}

main().finally(() => prisma.$disconnect());
