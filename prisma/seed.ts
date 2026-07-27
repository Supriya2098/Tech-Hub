/**
 * Demo seed for Tech-Hub: resets the local database and loads one richly
 * populated tenant modeled as an Indian IT services company, so every
 * dashboard/analytics/AI-insights view has realistic, non-empty data to show.
 *
 * Reuses the same `seedStarterData` module that every real `/auth/register`
 * call uses, so this script and a brand-new signup always produce the same
 * shape of starter dataset.
 *
 * Run with: npm run prisma:seed
 */
import bcrypt from 'bcrypt';
import { prisma } from '../apps/api/src/lib/prisma';
import { seedStarterData } from '../apps/api/src/lib/demoData';

async function resetDatabase() {
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.document.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.orgSettings.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

async function main() {
  console.log('Resetting database...');
  await resetDatabase();

  console.log('Creating organization: Tech-Hub Solutions Pvt. Ltd....');
  const org = await prisma.organization.create({
    data: {
      name: 'Tech-Hub Solutions Pvt. Ltd.',
      settings: {
        create: {
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          dateFormat: 'DD/MM/YYYY',
        },
      },
    },
  });

  const passwordHash = await bcrypt.hash('TechHub@123', 12);
  const admin = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Aditya Rao',
      email: 'admin@techhub.in',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('Admin login: admin@techhub.in / TechHub@123');

  console.log('Seeding starter dataset (employees, customers, projects, tasks, invoices, documents, notifications)...');
  await seedStarterData({
    organizationId: org.id,
    orgDisplayName: org.name,
    adminUserId: admin.id,
    adminName: admin.name,
    adminEmail: admin.email,
  });

  const [employeeCount, customerCount, projectCount] = await Promise.all([
    prisma.employee.count({ where: { organizationId: org.id } }),
    prisma.customer.count({ where: { organizationId: org.id } }),
    prisma.project.count({ where: { organizationId: org.id } }),
  ]);

  console.log('\nSeed complete.');
  console.log(`Organization: ${org.name}`);
  console.log(`Login: admin@techhub.in / TechHub@123`);
  console.log(`Employees: ${employeeCount}, Customers: ${customerCount}, Projects: ${projectCount}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
