const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

const teachers = [
  { name: 'Aimee June A. Alolor', email: 'aloloraimeejune@gmail.com' },
  { name: 'Revelyn A. Galang', email: 'galangrevelyn@gmail.com' },
  { name: 'Michelle R. Aserios', email: 'mich.agcy@gmail.com' },
  { name: 'Krisha Dwine R. Riotoc', email: 'dwine.riotoc1122@gmail.com' },
  { name: 'Julie Fe L. Benedicto', email: 'luciojuliefb@gmail.com' },
  { name: 'Jecille F. Buizon', email: 'franciscojecille451@gmail.com' },
  { name: 'Jayson B. Cuello', email: 'jisuncwelyo10@gmail.com' },
  { name: 'Jan Alfred P. Macalintal', email: 'macalintaljanalfred@gmail.com' },
  { name: 'Jade Emerald A. Amurao', email: 'jhaydey0203@gmail.com' },
  { name: 'Homer S. Macrohon', email: 'ayeshanicolemacrohon@gmail.com' },
  { name: 'Glorie Ann I. Espinosa', email: 'espinosaglorieann@gmail.com' },
  { name: 'Princess Jesa D. Tagulao', email: '0128princessjesa@gmail.com' },
  { name: 'Mark John J. Ramirez', email: 'ramirezmarkjohn@gmail.com' },
  { name: 'Christine Mari M. Jonson', email: 'cmjonson01@yahoo.com' },
  { name: 'Arianne Kaye N. Sager', email: 'sager@gmail.com' },
  { name: 'Renz Vincent S. Aclan', email: 'aclanrenz1@gmail.com' }
];

async function main() {
  console.log('Seeding teachers...');
  
  for (const t of teachers) {
    const existing = await prisma.user.findUnique({ where: { email: t.email } });
    
    if (existing) {
      console.log(`Teacher ${t.email} already exists. Skipping.`);
      continue;
    }
    
    console.log(`Creating teacher ${t.email}...`);
    await prisma.user.create({
      data: {
        id: uuidv4(),
        name: t.name,
        email: t.email,
        passwordHash: 'Denskie123',
        role: 'TEACHER',
        teacherProfile: {
          create: {
            id: uuidv4(),
            department: 'General',
            gradeLevels: '[]',
            sections: '[]',
            subjects: '[]',
            schedule: '[]',
            status: 'Active',
            avatar: '',
            totalSubmitted: 0,
            approved: 0,
            forRevision: 0,
            missing: 0,
            complianceRate: 100
          }
        }
      }
    });
  }
  
  console.log('Successfully seeded all teachers!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
