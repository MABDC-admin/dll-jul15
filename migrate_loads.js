const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getValidSubjectsForGrade(gradeName, allSubjects) {
  if (!gradeName) return [];
  const allowList = (names) => allSubjects.filter(s => names.includes(s.name));
  
  if (gradeName === 'Kindergarten 1' || gradeName === 'Kindergarten 2') {
    return allowList([
      'Socio-emotional Development',
      'Values Development',
      'Aesthetic/Creative Development',
      'Physical Health and Motor Development',
      'Language, Literacy, and Communication',
      'Mathematics (Kinder)',
      'Understanding the Physical and Natural Environment'
    ]);
  } 
  
  if (gradeName === 'Grade 1') {
    return allowList(['Language', 'Reading and Literacy', 'Mathematics', 'Makabansa', 'GMRC']);
  } 

  if (gradeName === 'Grade 2') {
    return allowList(['Filipino', 'English', 'Mathematics', 'Makabansa', 'GMRC']);
  }

  if (gradeName === 'Grade 3') {
    return allowList(['Filipino', 'English', 'Mathematics', 'Science', 'Makabansa', 'GMRC']);
  }

  if (gradeName === 'Grade 4' || gradeName === 'Grade 5' || gradeName === 'Grade 6') {
    return allowList(['Filipino', 'English', 'Mathematics', 'Science', 'Araling Panlipunan', 'GMRC', 'MAPEH', 'EPP / TLE']);
  }

  if (gradeName === 'Grade 7' || gradeName === 'Grade 8' || gradeName === 'Grade 9' || gradeName === 'Grade 10') {
    return allowList(['Filipino', 'English', 'Mathematics', 'Science', 'Araling Panlipunan', 'Values Education', 'MAPEH', 'EPP / TLE']);
  }
  
  return allSubjects;
}

async function main() {
  console.log("Starting migration...");
  const allSubjects = await prisma.subject.findMany();
  
  const profiles = await prisma.teacherProfile.findMany({
    include: { subjectLoads: true }
  });

  let createdCount = 0;

  for (const profile of profiles) {
    if (profile.subjectLoads.length > 0) {
      console.log(`Skipping profile ${profile.id} - already has ${profile.subjectLoads.length} loads`);
      continue;
    }

    try {
      const grades = JSON.parse(profile.gradeLevels || '[]');
      const sections = JSON.parse(profile.sections || '[]');
      const subjects = JSON.parse(profile.subjects || '[]');

      if (grades.length === 0 || sections.length === 0 || subjects.length === 0) {
        continue; // Nothing to migrate
      }

      const newLoads = [];
      for (const grade of grades) {
        const validSubjects = getValidSubjectsForGrade(grade, allSubjects).map(s => s.name);
        for (const subject of subjects) {
          if (validSubjects.includes(subject)) {
            for (const section of sections) {
              newLoads.push({
                teacherProfileId: profile.id,
                gradeId: grade,
                sectionName: section,
                subjectName: subject
              });
            }
          }
        }
      }

      if (newLoads.length > 0) {
        await prisma.teacherSubjectLoad.createMany({ data: newLoads });
        console.log(`Migrated ${newLoads.length} loads for profile ${profile.id}`);
        createdCount += newLoads.length;
      }
    } catch (err) {
      console.error(`Error migrating profile ${profile.id}:`, err);
    }
  }

  console.log(`Migration complete. Created ${createdCount} new TeacherSubjectLoad records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
