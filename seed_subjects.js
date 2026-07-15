const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const subjects = [
  // Kindergarten
  { code: 'K-LRL', name: 'Language, Reading and Literacy', department: 'Languages', type: 'Core', targetBand: 'Kindergarten' },
  { code: 'K-MATH', name: 'Mathematics', department: 'Mathematics', type: 'Core', targetBand: 'Kindergarten' },
  { code: 'K-GMRC', name: 'Good Manners and Right Conduct (GMRC)', department: 'Values Ed', type: 'Core', targetBand: 'Kindergarten' },
  { code: 'K-MAKABANSA', name: 'Makabansa (integrated through thematic learning)', department: 'Araling Panlipunan', type: 'Core', targetBand: 'Kindergarten' },

  // Grades 1-3
  { code: 'G13-FIL', name: 'Filipino', department: 'Languages', type: 'Core', targetBand: 'Grades 1-3' },
  { code: 'G13-ENG', name: 'English', department: 'Languages', type: 'Core', targetBand: 'Grades 1-3' },
  { code: 'G13-MATH', name: 'Mathematics', department: 'Mathematics', type: 'Core', targetBand: 'Grades 1-3' },
  { code: 'G13-GMRC', name: 'GMRC', department: 'Values Ed', type: 'Core', targetBand: 'Grades 1-3' },
  { code: 'G13-MAKABANSA', name: 'Makabansa', department: 'Araling Panlipunan', type: 'Core', targetBand: 'Grades 1-3' },

  // Grades 4-6
  { code: 'G46-FIL', name: 'Filipino', department: 'Languages', type: 'Core', targetBand: 'Grades 4-6' },
  { code: 'G46-ENG', name: 'English', department: 'Languages', type: 'Core', targetBand: 'Grades 4-6' },
  { code: 'G46-MATH', name: 'Mathematics', department: 'Mathematics', type: 'Core', targetBand: 'Grades 4-6' },
  { code: 'G46-SCI', name: 'Science', department: 'Science', type: 'Core', targetBand: 'Grades 4-6' },
  { code: 'G46-AP', name: 'Araling Panlipunan', department: 'Araling Panlipunan', type: 'Core', targetBand: 'Grades 4-6' },
  { code: 'G46-MAPEH-MA', name: 'Music and Arts', department: 'MAPEH', type: 'Core', targetBand: 'Grades 4-6' },
  { code: 'G46-MAPEH-PEH', name: 'Physical Education and Health (PEH)', department: 'MAPEH', type: 'Core', targetBand: 'Grades 4-6' },
  { code: 'G45-EPP', name: 'Edukasyong Pantahanan at Pangkabuhayan (EPP)', department: 'TLE', type: 'Core', targetBand: 'Grades 4-5' },
  { code: 'G6-TLE', name: 'Technology and Livelihood Education (TLE)', department: 'TLE', type: 'Core', targetBand: 'Grade 6' },
  { code: 'G46-VE', name: 'Values Education/GMRC', department: 'Values Ed', type: 'Core', targetBand: 'Grades 4-6' },

  // Grades 7-10
  { code: 'G710-FIL', name: 'Filipino', department: 'Languages', type: 'Core', targetBand: 'Grades 7-10' },
  { code: 'G710-ENG', name: 'English', department: 'Languages', type: 'Core', targetBand: 'Grades 7-10' },
  { code: 'G710-MATH', name: 'Mathematics', department: 'Mathematics', type: 'Core', targetBand: 'Grades 7-10' },
  { code: 'G710-SCI', name: 'Science', department: 'Science', type: 'Core', targetBand: 'Grades 7-10' },
  { code: 'G710-AP', name: 'Araling Panlipunan', department: 'Araling Panlipunan', type: 'Core', targetBand: 'Grades 7-10' },
  { code: 'G710-MAPEH-MA', name: 'Music and Arts', department: 'MAPEH', type: 'Core', targetBand: 'Grades 7-10' },
  { code: 'G710-MAPEH-PEH', name: 'Physical Education and Health (PEH)', department: 'MAPEH', type: 'Core', targetBand: 'Grades 7-10' },
  { code: 'G710-TLE', name: 'Technology and Livelihood Education (TLE)', department: 'TLE', type: 'Core', targetBand: 'Grades 7-10' },
  { code: 'G710-VE', name: 'Values Education', department: 'Values Ed', type: 'Core', targetBand: 'Grades 7-10' }
];

const { v4: uuidv4 } = require('uuid');

async function main() {
  console.log('Importing subjects from image...');
  for (const s of subjects) {
    const existing = await prisma.subject.findFirst({
      where: { code: s.code }
    });
    
    if (existing) {
      await prisma.subject.update({
        where: { id: existing.id },
        data: s
      });
    } else {
      await prisma.subject.create({
        data: {
          id: uuidv4(),
          ...s
        }
      });
    }
  }
  console.log('Successfully imported all subjects!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
