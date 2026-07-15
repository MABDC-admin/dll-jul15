import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Denskie123', 10);

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@mabdc.org' },
    update: {},
    create: {
      email: 'admin@mabdc.org',
      name: 'SysAdmin',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Principal
  await prisma.user.upsert({
    where: { email: 'acad@mabdc.org' },
    update: {},
    create: {
      email: 'acad@mabdc.org',
      name: 'Glorie Ann Espinosa',
      passwordHash,
      role: 'PRINCIPAL',
    },
  });

  // Teachers
  const teacherEmails = [
    'teacher-k1@mabdc.org',
    'teacher-k2@mabdc.org',
    ...Array.from({ length: 10 }, (_, i) => `teacher-${i + 1}@mabdc.org`),
  ];

  for (let i = 0; i < teacherEmails.length; i++) {
    const email = teacherEmails[i];
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `Teacher ${i + 1}`,
        passwordHash,
        role: 'TEACHER',
      },
    });

    await prisma.teacherProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        department: 'General',
        gradeLevels: JSON.stringify(['Grade 1']),
        sections: JSON.stringify(['Section A']),
        subjects: JSON.stringify(['English']),
        schedule: 'Mon/Wed 9:00 AM',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      },
    });
  }

  const grades = [
    { id: 'k1', name: 'Kindergarten 1', level: 0, keyStage: 'Key Stage 1', count: 0 },
    { id: 'k2', name: 'Kindergarten 2', level: 0, keyStage: 'Key Stage 1', count: 0 },
    { id: 'g1', name: 'Grade 1', level: 1, keyStage: 'Key Stage 1', count: 0 },
    { id: 'g2', name: 'Grade 2', level: 2, keyStage: 'Key Stage 1', count: 0 },
    { id: 'g3', name: 'Grade 3', level: 3, keyStage: 'Key Stage 1', count: 0 },
    { id: 'g4', name: 'Grade 4', level: 4, keyStage: 'Key Stage 2', count: 0 },
    { id: 'g5', name: 'Grade 5', level: 5, keyStage: 'Key Stage 2', count: 0 },
    { id: 'g6', name: 'Grade 6', level: 6, keyStage: 'Key Stage 2', count: 0 },
    { id: 'g7', name: 'Grade 7', level: 7, keyStage: 'Key Stage 3', count: 0 },
    { id: 'g8', name: 'Grade 8', level: 8, keyStage: 'Key Stage 3', count: 0 },
    { id: 'g9', name: 'Grade 9', level: 9, keyStage: 'Key Stage 3', count: 0 },
    { id: 'g10', name: 'Grade 10', level: 10, keyStage: 'Key Stage 3', count: 0 },
    { id: 'g11', name: 'Grade 11', level: 11, keyStage: 'Key Stage 4', count: 0 },
    { id: 'g12', name: 'Grade 12', level: 12, keyStage: 'Key Stage 4', count: 0 },
  ];

  for (const g of grades) {
    await prisma.gradeLevel.upsert({
      where: { id: g.id },
      update: {},
      create: g
    });
  }

  const subjects = [
    { id: 'eng', name: 'English', code: 'ENG', department: 'Languages', type: 'Core', targetBand: '75-100' },
    { id: 'math', name: 'Mathematics', code: 'MATH', department: 'Sciences', type: 'Core', targetBand: '75-100' },
    { id: 'sci', name: 'Science', code: 'SCI', department: 'Sciences', type: 'Core', targetBand: '75-100' },
    { id: 'fil', name: 'Filipino', code: 'FIL', department: 'Languages', type: 'Core', targetBand: '75-100' },
    { id: 'ap', name: 'Araling Panlipunan', code: 'AP', department: 'Humanities', type: 'Core', targetBand: '75-100' },
    { id: 'mapeh', name: 'MAPEH', code: 'MAPEH', department: 'Arts & Health', type: 'Core', targetBand: '75-100' },
  ];

  for (const s of subjects) {
    await prisma.subject.upsert({
      where: { id: s.id },
      update: {},
      create: s
    });
  }

  const depts = [
    { id: 'dept-pre', name: 'Pre-School Department', description: 'Kindergarten levels' },
    { id: 'dept-elem', name: 'Elementary Department', description: 'Grades 1 to 6' },
    { id: 'dept-jhs', name: 'Junior High School Department', description: 'Grades 7 to 10' },
    { id: 'dept-shs', name: 'Senior High School Department', description: 'Grades 11 to 12' },
  ];

  for (const d of depts) {
    await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: d
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
