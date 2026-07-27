import { prisma } from './prisma';

/**
 * Populates a newly created organization with a realistic starter dataset
 * (an Indian IT services company: staff, clients, projects, tasks, invoices,
 * documents, notifications) so a brand-new signup never lands on an empty
 * app. Used both by every `/auth/register` call and by `prisma/seed.ts`
 * (the standalone `npm run prisma:seed` reset-and-demo script).
 *
 * Dates are relative to "now" so the dataset always looks current, and
 * numbers are deliberately shaped to trigger every AI Insights rule
 * (overdue tasks, revenue growth, workload imbalance, top customers,
 * overdue invoices, a stale project) rather than showing "all clear".
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS);
const daysFromNow = (n: number) => new Date(Date.now() + n * DAY_MS);

export interface SeedStarterDataParams {
  organizationId: string;
  orgDisplayName: string;
  adminUserId: string;
  adminName: string;
  adminEmail: string;
}

export async function seedStarterData({
  organizationId,
  orgDisplayName,
  adminUserId,
  adminName,
  adminEmail,
}: SeedStarterDataParams): Promise<void> {
  // -------------------------------------------------------------------
  // Employees (annual CTC in INR) - the registering user becomes the
  // Founder & CEO employee record; the rest fill out a realistic roster.
  // -------------------------------------------------------------------
  const employeeSeed = [
    { name: adminName, email: adminEmail, title: 'Founder & CEO', department: 'Management', salary: 4200000, status: 'ACTIVE' as const, hiredDaysAgo: 1460, userId: adminUserId },
    { name: 'Priya Sharma', email: 'priya.sharma@example.com', title: 'VP Engineering', department: 'Engineering', salary: 3200000, status: 'ACTIVE' as const, hiredDaysAgo: 1200 },
    { name: 'Pooja Desai', email: 'pooja.desai@example.com', title: 'Technical Lead', department: 'Engineering', salary: 2800000, status: 'ACTIVE' as const, hiredDaysAgo: 1000 },
    { name: 'Vikram Singh', email: 'vikram.singh@example.com', title: 'Cloud Architect', department: 'DevOps', salary: 2600000, status: 'ACTIVE' as const, hiredDaysAgo: 900 },
    { name: 'Meera Pillai', email: 'meera.pillai@example.com', title: 'Project Manager', department: 'Delivery', salary: 2200000, status: 'ACTIVE' as const, hiredDaysAgo: 820 },
    { name: 'Rohan Mehta', email: 'rohan.mehta@example.com', title: 'Senior Software Engineer', department: 'Engineering', salary: 1800000, status: 'ACTIVE' as const, hiredDaysAgo: 760 },
    { name: 'Suresh Kumar', email: 'suresh.kumar@example.com', title: 'Scrum Master', department: 'Delivery', salary: 1600000, status: 'ACTIVE' as const, hiredDaysAgo: 700 },
    { name: 'Neha Gupta', email: 'neha.gupta@example.com', title: 'QA Lead', department: 'Quality Assurance', salary: 1500000, status: 'ACTIVE' as const, hiredDaysAgo: 650 },
    { name: 'Sneha Reddy', email: 'sneha.reddy@example.com', title: 'DevOps Engineer', department: 'DevOps', salary: 1400000, status: 'ACTIVE' as const, hiredDaysAgo: 600 },
    { name: 'Amit Joshi', email: 'amit.joshi@example.com', title: 'HR Manager', department: 'Human Resources', salary: 1300000, status: 'ACTIVE' as const, hiredDaysAgo: 580 },
    { name: 'Rahul Verma', email: 'rahul.verma@example.com', title: 'Business Analyst', department: 'Business Analysis', salary: 1200000, status: 'ACTIVE' as const, hiredDaysAgo: 540 },
    { name: 'Divya Krishnan', email: 'divya.krishnan@example.com', title: 'UI/UX Designer', department: 'Design', salary: 1100000, status: 'ACTIVE' as const, hiredDaysAgo: 500 },
    { name: 'Kavya Menon', email: 'kavya.menon@example.com', title: 'Data Analyst', department: 'Data & Analytics', salary: 1000000, status: 'ON_LEAVE' as const, hiredDaysAgo: 460 },
    { name: 'Ananya Iyer', email: 'ananya.iyer@example.com', title: 'Software Engineer', department: 'Engineering', salary: 900000, status: 'ACTIVE' as const, hiredDaysAgo: 420 },
    { name: 'Karthik Subramaniam', email: 'karthik.s@example.com', title: 'Software Engineer', department: 'Engineering', salary: 850000, status: 'ACTIVE' as const, hiredDaysAgo: 380 },
    { name: 'Arjun Nair', email: 'arjun.nair@example.com', title: 'QA Engineer', department: 'Quality Assurance', salary: 700000, status: 'ACTIVE' as const, hiredDaysAgo: 300 },
    { name: 'Sanjay Bhatt', email: 'sanjay.bhatt@example.com', title: 'Software Engineer', department: 'Engineering', salary: 950000, status: 'TERMINATED' as const, hiredDaysAgo: 900 },
  ];

  const employees = await Promise.all(
    employeeSeed.map((e) =>
      prisma.employee.create({
        data: {
          organizationId,
          userId: e.userId,
          name: e.name,
          email: e.email,
          title: e.title,
          department: e.department,
          salary: e.salary,
          status: e.status,
          hiredAt: daysAgo(e.hiredDaysAgo),
        },
      }),
    ),
  );
  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE');
  const findEmp = (name: string) => employees.find((e) => e.name === name)!;

  // -------------------------------------------------------------------
  // Customers
  // -------------------------------------------------------------------
  const customerSeed = [
    { name: 'Bharat Retail Ventures Pvt Ltd', email: 'it.head@bharatretail.example', company: 'Bharat Retail Ventures', phone: '+91 98200 11223', status: 'ACTIVE' as const, createdDaysAgo: 340 },
    { name: 'Suvidha Fintech Solutions', email: 'cto@suvidhafintech.example', company: 'Suvidha Fintech Solutions', phone: '+91 98450 22334', status: 'ACTIVE' as const, createdDaysAgo: 300 },
    { name: 'Garuda Logistics & Supply Chain', email: 'ops@garudalogistics.example', company: 'Garuda Logistics', phone: '+91 99020 33445', status: 'ACTIVE' as const, createdDaysAgo: 260 },
    { name: 'Vitality Health Systems', email: 'projects@vitalityhealth.example', company: 'Vitality Health Systems', phone: '+91 90360 44556', status: 'ACTIVE' as const, createdDaysAgo: 98 },
    { name: 'NextGen Manufacturing Ltd', email: 'digital@nextgenmfg.example', company: 'NextGen Manufacturing', phone: '+91 96540 55667', status: 'LEAD' as const, createdDaysAgo: 58 },
    { name: 'Skyline Realty Group', email: 'tech@skylinerealty.example', company: 'Skyline Realty Group', phone: '+91 97120 66778', status: 'ACTIVE' as const, createdDaysAgo: 168 },
    { name: 'Prime Insurance Corp', email: 'vendor@primeinsurance.example', company: 'Prime Insurance Corp', phone: '+91 98650 77889', status: 'INACTIVE' as const, createdDaysAgo: 500 },
    { name: 'Metro Grocers Pvt Ltd', email: 'it@metrogrocers.example', company: 'Metro Grocers', phone: '+91 99870 88990', status: 'ACTIVE' as const, createdDaysAgo: 128 },
    { name: 'Orion Renewable Energy Ltd', email: 'innovation@orionenergy.example', company: 'Orion Renewable Energy', phone: '+91 90040 99001', status: 'LEAD' as const, createdDaysAgo: 18 },
    { name: 'Sundar AgroExports Pvt Ltd', email: 'admin@sundaragro.example', company: 'Sundar AgroExports', phone: '+91 89390 00112', status: 'CHURNED' as const, createdDaysAgo: 600 },
  ];

  const customers = await Promise.all(
    customerSeed.map((c) =>
      prisma.customer.create({
        data: {
          organizationId,
          name: c.name,
          email: c.email,
          phone: c.phone,
          company: c.company,
          status: c.status,
          createdAt: daysAgo(c.createdDaysAgo),
        },
      }),
    ),
  );
  const findCust = (name: string) => customers.find((c) => c.name === name)!;

  // -------------------------------------------------------------------
  // Projects
  // -------------------------------------------------------------------
  const projectSeed = [
    { name: 'E-commerce Platform Revamp', customer: 'Bharat Retail Ventures Pvt Ltd', status: 'ACTIVE' as const, budget: 8500000, startDaysAgo: 120, endDaysFromNow: 60 },
    { name: 'Core Banking API Migration', customer: 'Suvidha Fintech Solutions', status: 'ACTIVE' as const, budget: 12000000, startDaysAgo: 150, endDaysFromNow: 90 },
    { name: 'Fleet Tracking Mobile App', customer: 'Garuda Logistics & Supply Chain', status: 'ACTIVE' as const, budget: 6500000, startDaysAgo: 90, endDaysFromNow: 45 },
    { name: 'Patient Portal Modernization', customer: 'Vitality Health Systems', status: 'ON_HOLD' as const, budget: 4500000, startDaysAgo: 200, endDaysFromNow: 30 },
    { name: 'HRMS Cloud Migration', customer: 'NextGen Manufacturing Ltd', status: 'PLANNING' as const, budget: 3000000, startDaysAgo: 10, endDaysFromNow: 150 },
    { name: 'Property Listing Platform Upgrade', customer: 'Skyline Realty Group', status: 'ACTIVE' as const, budget: 5500000, startDaysAgo: 30, endDaysFromNow: 100 },
    { name: 'Claims Automation Portal', customer: 'Prime Insurance Corp', status: 'COMPLETED' as const, budget: 9000000, startDaysAgo: 400, endDaysFromNow: -60 },
    { name: 'Retail POS Integration', customer: 'Metro Grocers Pvt Ltd', status: 'ACTIVE' as const, budget: 4000000, startDaysAgo: 70, endDaysFromNow: 40 },
    { name: 'IoT Energy Monitoring Dashboard', customer: 'Orion Renewable Energy Ltd', status: 'PLANNING' as const, budget: 7000000, startDaysAgo: 5, endDaysFromNow: 180 },
    { name: 'Export Documentation System', customer: 'Sundar AgroExports Pvt Ltd', status: 'CANCELLED' as const, budget: 2000000, startDaysAgo: 250, endDaysFromNow: -180 },
  ];

  const projects = await Promise.all(
    projectSeed.map((p) =>
      prisma.project.create({
        data: {
          organizationId,
          customerId: findCust(p.customer).id,
          name: p.name,
          description: `${p.name} delivered for ${p.customer} by ${orgDisplayName}.`,
          status: p.status,
          budget: p.budget,
          startDate: daysAgo(p.startDaysAgo),
          endDate: daysFromNow(p.endDaysFromNow),
        },
      }),
    ),
  );

  // -------------------------------------------------------------------
  // Tasks - shaped to light up the AI Insights rules engine: ~30% of
  // open tasks overdue, one employee overloaded vs. the team average,
  // "Property Listing Platform Upgrade" left with zero tasks (stale project).
  // -------------------------------------------------------------------
  const taskTitles = [
    'Set up CI/CD pipeline',
    'Implement JWT authentication',
    'Design database schema',
    'Write unit tests for payment module',
    'Conduct UAT with client',
    'Optimize API response time',
    'Fix cross-browser CSS issues',
    'Prepare deployment runbook',
    'Code review for sprint',
    'Integrate Razorpay payment gateway',
    'Set up monitoring & alerting',
    'Migrate legacy data to new schema',
    'Build responsive dashboard UI',
    'Conduct security audit',
    'Write API documentation',
    'Set up staging environment',
    'Refactor authentication middleware',
    'Performance load testing',
  ];
  const taskStatuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const;
  const taskPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

  const overloadedId = findEmp('Pooja Desai').id;
  const rotationEmployees = activeEmployees.filter(
    (e) => e.department === 'Engineering' || e.department === 'DevOps' || e.department === 'Quality Assurance',
  );

  const taskCreates: ReturnType<typeof prisma.task.create>[] = [];
  let taskCounter = 0;
  for (const project of projects) {
    if (project.name === 'Property Listing Platform Upgrade') continue; // intentionally task-less (stale project insight)

    const taskCount = project.status === 'CANCELLED' ? 2 : project.status === 'COMPLETED' ? 6 : 5 + (taskCounter % 3);

    for (let i = 0; i < taskCount; i++) {
      taskCounter++;
      const title = taskTitles[taskCounter % taskTitles.length];
      const assignee = taskCounter % 3 === 0 ? overloadedId : rotationEmployees[taskCounter % rotationEmployees.length].id;

      let status: (typeof taskStatuses)[number];
      let dueDate: Date;
      let completedAt: Date | null = null;

      if (project.status === 'COMPLETED') {
        status = 'DONE';
        dueDate = daysAgo(90 - i * 5);
        completedAt = daysAgo(80 - i * 5);
      } else if (project.status === 'CANCELLED') {
        status = i === 0 ? 'IN_PROGRESS' : 'TODO';
        dueDate = daysAgo(150 - i * 10);
      } else {
        const cycle = i % 4;
        status = taskStatuses[cycle];
        if (status === 'DONE') {
          dueDate = daysAgo(20 - i);
          completedAt = daysAgo(15 - i);
        } else if (taskCounter % 3 === 0) {
          dueDate = daysAgo(2 + (taskCounter % 10)); // overdue
        } else {
          dueDate = daysFromNow(3 + (taskCounter % 20));
        }
      }

      taskCreates.push(
        prisma.task.create({
          data: {
            organizationId,
            projectId: project.id,
            employeeId: assignee,
            title: `${title} - ${project.name.split(' ').slice(0, 2).join(' ')}`,
            description: `${title} as part of the ${project.name} engagement.`,
            status,
            priority: taskPriorities[taskCounter % taskPriorities.length],
            dueDate,
            completedAt,
          },
        }),
      );
    }
  }
  await Promise.all(taskCreates);

  // -------------------------------------------------------------------
  // Invoices + Payments - this month's collected revenue meaningfully
  // higher than last month's (AI insight: revenue growth), with a
  // couple of unpaid overdue invoices (AI insight: overdue invoices).
  // -------------------------------------------------------------------
  let invoiceSeq = 1;
  const nextInvoiceNumber = () => `INV-2026-${String(invoiceSeq++).padStart(4, '0')}`;

  async function createPaidInvoice(customerName: string, amount: number, paidDaysAgo: number) {
    const invoice = await prisma.invoice.create({
      data: {
        organizationId,
        customerId: findCust(customerName).id,
        invoiceNumber: nextInvoiceNumber(),
        amount,
        status: 'PAID',
        issuedAt: daysAgo(paidDaysAgo + 10),
        dueAt: daysAgo(paidDaysAgo + 3),
        paidAt: daysAgo(paidDaysAgo),
      },
    });
    await prisma.payment.create({
      data: { invoiceId: invoice.id, amount, method: 'bank_transfer', paidAt: daysAgo(paidDaysAgo) },
    });
  }

  const monthlyPaidInvoices: Array<[string, number, number]> = [
    ['Bharat Retail Ventures Pvt Ltd', 1800000, 165],
    ['Metro Grocers Pvt Ltd', 900000, 160],
    ['Prime Insurance Corp', 2400000, 135],
    ['Garuda Logistics & Supply Chain', 1100000, 128],
    ['Bharat Retail Ventures Pvt Ltd', 2000000, 100],
    ['Suvidha Fintech Solutions', 2600000, 92],
    ['Vitality Health Systems', 1300000, 75],
    ['Metro Grocers Pvt Ltd', 950000, 68],
    ['Garuda Logistics & Supply Chain', 1450000, 48],
    ['Suvidha Fintech Solutions', 2900000, 40],
    ['Bharat Retail Ventures Pvt Ltd', 2200000, 20],
    ['Metro Grocers Pvt Ltd', 1050000, 14],
    ['Suvidha Fintech Solutions', 3400000, 6],
    ['Vitality Health Systems', 1700000, 3],
  ];
  for (const [customerName, amount, paidDaysAgo] of monthlyPaidInvoices) {
    await createPaidInvoice(customerName, amount, paidDaysAgo);
  }

  await prisma.invoice.create({
    data: {
      organizationId,
      customerId: findCust('Garuda Logistics & Supply Chain').id,
      invoiceNumber: nextInvoiceNumber(),
      amount: 1250000,
      status: 'SENT',
      issuedAt: daysAgo(5),
      dueAt: daysFromNow(25),
    },
  });
  await prisma.invoice.create({
    data: {
      organizationId,
      customerId: findCust('NextGen Manufacturing Ltd').id,
      invoiceNumber: nextInvoiceNumber(),
      amount: 750000,
      status: 'DRAFT',
      issuedAt: daysAgo(1),
      dueAt: daysFromNow(30),
    },
  });
  await prisma.invoice.create({
    data: {
      organizationId,
      customerId: findCust('Prime Insurance Corp').id,
      invoiceNumber: nextInvoiceNumber(),
      amount: 1600000,
      status: 'OVERDUE',
      issuedAt: daysAgo(60),
      dueAt: daysAgo(25),
    },
  });
  await prisma.invoice.create({
    data: {
      organizationId,
      customerId: findCust('Sundar AgroExports Pvt Ltd').id,
      invoiceNumber: nextInvoiceNumber(),
      amount: 500000,
      status: 'OVERDUE',
      issuedAt: daysAgo(90),
      dueAt: daysAgo(45),
    },
  });
  await prisma.invoice.create({
    data: {
      organizationId,
      customerId: findCust('Skyline Realty Group').id,
      invoiceNumber: nextInvoiceNumber(),
      amount: 600000,
      status: 'VOID',
      issuedAt: daysAgo(100),
      dueAt: daysAgo(70),
    },
  });

  // -------------------------------------------------------------------
  // Documents
  // -------------------------------------------------------------------
  const documentSeed = [
    { name: 'MSA - Bharat Retail Ventures.pdf', mimeType: 'application/pdf', tags: ['contract', 'legal'] },
    { name: 'SOW - Core Banking API Migration.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', tags: ['contract', 'scope'] },
    { name: 'NDA Template.pdf', mimeType: 'application/pdf', tags: ['legal', 'template'] },
    { name: 'Employee Handbook 2026.pdf', mimeType: 'application/pdf', tags: ['hr', 'policy'] },
    { name: 'Architecture Diagram - Fleet Tracking App.png', mimeType: 'image/png', tags: ['architecture', 'engineering'] },
    { name: 'Invoice Template.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', tags: ['finance', 'template'] },
    { name: 'Security Audit Report - Q2.pdf', mimeType: 'application/pdf', tags: ['security', 'audit'] },
    { name: 'Onboarding Checklist - New Engineers.pdf', mimeType: 'application/pdf', tags: ['hr', 'engineering'] },
  ];
  await Promise.all(
    documentSeed.map((d, i) =>
      prisma.document.create({
        data: {
          organizationId,
          name: d.name,
          url: `https://docs.example.com/files/${encodeURIComponent(d.name)}`,
          mimeType: d.mimeType,
          sizeBytes: 150_000 + i * 45_000,
          tags: d.tags,
          createdAt: daysAgo(120 - i * 12),
        },
      }),
    ),
  );

  // -------------------------------------------------------------------
  // Notifications - recent activity feed
  // -------------------------------------------------------------------
  const notificationSeed = [
    { type: 'SUCCESS' as const, title: 'Invoice paid', message: 'Invoice INV-2026-0013 from Suvidha Fintech Solutions has been paid in full.', daysAgo: 6 },
    { type: 'SUCCESS' as const, title: 'Task completed', message: '"Integrate Razorpay payment gateway - Core Banking API" was marked as done.', daysAgo: 8 },
    { type: 'ALERT' as const, title: 'Invoice overdue', message: 'Invoice INV-2026-0017 from Prime Insurance Corp is 25 days past due.', daysAgo: 1 },
    { type: 'WARNING' as const, title: 'Task overdue', message: '3 tasks on Core Banking API Migration are past their due date.', daysAgo: 2 },
    { type: 'INFO' as const, title: 'New lead added', message: 'NextGen Manufacturing Ltd was added as a new lead.', daysAgo: 45 },
    { type: 'SUCCESS' as const, title: 'Project completed', message: 'Claims Automation Portal for Prime Insurance Corp was marked completed.', daysAgo: 60 },
    { type: 'INFO' as const, title: 'New employee onboarded', message: 'Arjun Nair joined as QA Engineer.', daysAgo: 300 },
    { type: 'WARNING' as const, title: 'Employee on leave', message: 'Kavya Menon is currently marked as on leave.', daysAgo: 10 },
    { type: 'ALERT' as const, title: 'Invoice overdue', message: 'Invoice INV-2026-0018 from Sundar AgroExports Pvt Ltd is 45 days past due.', daysAgo: 3 },
    { type: 'SUCCESS' as const, title: 'Invoice paid', message: 'Invoice INV-2026-0014 from Vitality Health Systems has been paid in full.', daysAgo: 3 },
  ];
  await Promise.all(
    notificationSeed.map((n) =>
      prisma.notification.create({
        data: {
          organizationId,
          type: n.type,
          title: n.title,
          message: n.message,
          isRead: n.daysAgo > 30,
          createdAt: daysAgo(n.daysAgo),
        },
      }),
    ),
  );
}
