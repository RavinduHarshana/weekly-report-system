require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Report = require('../models/Report');

async function seedData() {
  const { MANAGER_NAME, MANAGER_EMAIL, MANAGER_PASSWORD } = process.env;

  if (!MANAGER_NAME || !MANAGER_EMAIL || !MANAGER_PASSWORD) {
    throw new Error('MANAGER_NAME, MANAGER_EMAIL, and MANAGER_PASSWORD are required in .env');
  }

  await connectDB();

  console.log('Clearing existing data (users, projects, reports)...');
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Report.deleteMany({})
  ]);

  console.log('Seeding Manager account...');
  const salt = await bcrypt.genSalt(10);
  const hashedManagerPassword = await bcrypt.hash(MANAGER_PASSWORD, salt);

  const manager = await User.create({
    name: MANAGER_NAME,
    email: MANAGER_EMAIL,
    password: hashedManagerPassword,
    role: 'Manager',
  });
  console.log(`Manager created: ${manager.email}`);

  console.log('Seeding Team Members...');
  const hashedMemberPassword = await bcrypt.hash('Password123!', salt);

  const membersData = [
    { name: 'Kasun Perera', email: 'kasun@example.com', password: hashedMemberPassword, role: 'Team Member' },
    { name: 'Nimal Silva', email: 'nimal@example.com', password: hashedMemberPassword, role: 'Team Member' },
    { name: 'Ruwan Fernando', email: 'ruwan@example.com', password: hashedMemberPassword, role: 'Team Member' },
    { name: 'Dilini Wijesinghe', email: 'dilini@example.com', password: hashedMemberPassword, role: 'Team Member' },
  ];

  const members = await User.insertMany(membersData);
  console.log(`Successfully seeded ${members.length} team members.`);

  // Extract member ids
  const [alice, bob, charlie, diana] = members;

  console.log('Seeding Projects...');
  const projectsData = [
    {
      name: 'LankaQR Sync Platform',
      description: 'Developing the central LankaQR payment verification system, merchant dashboards, and transaction reconciliations.',
      assignedMembers: [alice._id, bob._id]
    },
    {
      name: 'Seylan Bank Pay Gateway',
      description: 'Integrating Seylan Bank IPG secure endpoints, merchant callback webhooks, and local payment verification.',
      assignedMembers: [bob._id, charlie._id]
    },
    {
      name: 'Dialog SMS Portal Core',
      description: 'Building the enterprise Dialog SMS API integration, notification queues, and automated alerts Dispatcher.',
      assignedMembers: [charlie._id, diana._id]
    },
    {
      name: 'Koombiyo Delivery Tracker',
      description: 'Developing mobile tracking sync adapters, parcel dispatch flows, and rider offline database integrations.',
      assignedMembers: [alice._id, diana._id]
    }
  ];

  const projects = await Project.insertMany(projectsData);
  console.log(`Successfully seeded ${projects.length} projects.`);

  const [saasProj, payProj, kubeProj, mobileProj] = projects;

  console.log('Seeding Weekly Reports (5 Weeks)...');

  // Helper to generate dates
  const weeks = [
    { start: new Date('2026-06-08'), end: new Date('2026-06-12'), range: '08 Jun 2026 - 12 Jun 2026' },
    { start: new Date('2026-06-15'), end: new Date('2026-06-19'), range: '15 Jun 2026 - 19 Jun 2026' },
    { start: new Date('2026-06-22'), end: new Date('2026-06-26'), range: '22 Jun 2026 - 26 Jun 2026' },
    { start: new Date('2026-06-29'), end: new Date('2026-07-03'), range: '29 Jun 2026 - 03 Jul 2026' },
    { start: new Date('2026-07-06'), end: new Date('2026-07-10'), range: '06 Jul 2026 - 10 Jul 2026' },
  ];

  const reportsData = [
    // ALICE VANCE
    {
      userId: alice._id,
      projectId: saasProj._id,
      startDate: weeks[0].start,
      endDate: weeks[0].end,
      weekDateRange: weeks[0].range,
      tasksCompleted: 'Designed UI mockups for core pages, set up Figma assets, completed folder skeletons.',
      tasksPlanned: 'Build boilerplate structure, code-split main landing page views.',
      blockers: 'None',
      hoursWorked: 38,
      status: 'submitted',
      submittedAt: new Date('2026-06-12T17:00:00Z')
    },
    {
      userId: alice._id,
      projectId: saasProj._id,
      startDate: weeks[1].start,
      endDate: weeks[1].end,
      weekDateRange: weeks[1].range,
      tasksCompleted: 'Created main layout shell, refactored styles.css, set up base theme variables.',
      tasksPlanned: 'Integrate charts grid, set up Recharts dynamic responsiveness.',
      blockers: 'Waiting on approval for chart palettes from Product Owner.',
      hoursWorked: 40,
      status: 'submitted',
      submittedAt: new Date('2026-06-19T16:30:00Z')
    },
    {
      userId: alice._id,
      projectId: mobileProj._id,
      startDate: weeks[2].start,
      endDate: weeks[2].end,
      weekDateRange: weeks[2].range,
      tasksCompleted: 'Initiated mobile codebase using React Native template, set up navigation routes.',
      tasksPlanned: 'Build user credentials UI and offline caching mechanism.',
      blockers: 'None',
      hoursWorked: 36,
      status: 'submitted',
      submittedAt: new Date('2026-06-26T17:45:00Z')
    },
    {
      userId: alice._id,
      projectId: mobileProj._id,
      startDate: weeks[3].start,
      endDate: weeks[3].end,
      weekDateRange: weeks[3].range,
      tasksCompleted: 'Finished mobile login flow, completed SQLite offline sync module.',
      tasksPlanned: 'Add push notification certificates and configure Apple Developer portal config.',
      blockers: 'Awaiting Apple credentials from Admin team.',
      hoursWorked: 44,
      status: 'submitted',
      submittedAt: new Date('2026-07-03T18:10:00Z')
    },
    {
      userId: alice._id,
      projectId: saasProj._id,
      startDate: weeks[4].start,
      endDate: weeks[4].end,
      weekDateRange: weeks[4].range,
      tasksCompleted: 'Refactoring landing dashboard grids to fit wide desktop screen width and full screen layouts.',
      tasksPlanned: 'Build recent activity feed widgets with custom initials avatar.',
      blockers: 'None',
      hoursWorked: 24,
      status: 'submitted',
      submittedAt: new Date('2026-07-08T11:00:00Z') // submitted early this week
    },

    // BOB MILLER
    {
      userId: bob._id,
      projectId: saasProj._id,
      startDate: weeks[0].start,
      endDate: weeks[0].end,
      weekDateRange: weeks[0].range,
      tasksCompleted: 'Established backend REST endpoints for user authentication, connected MongoDB database schema.',
      tasksPlanned: 'Implement JSON Web Token verification middleware and error logs.',
      blockers: 'None',
      hoursWorked: 40,
      status: 'submitted',
      submittedAt: new Date('2026-06-12T16:50:00Z')
    },
    {
      userId: bob._id,
      projectId: payProj._id,
      startDate: weeks[1].start,
      endDate: weeks[1].end,
      weekDateRange: weeks[1].range,
      tasksCompleted: 'Researched Stripe API, configured sandbox test keys, wrote initial checkout router.',
      tasksPlanned: 'Implement Stripe webhooks logic to process invoice alerts asynchronously.',
      blockers: 'Awaiting webhook secret key configuration parameters.',
      hoursWorked: 38,
      status: 'submitted',
      submittedAt: new Date('2026-06-19T17:15:00Z')
    },
    {
      userId: bob._id,
      projectId: payProj._id,
      startDate: weeks[2].start,
      endDate: weeks[2].end,
      weekDateRange: weeks[2].range,
      tasksCompleted: 'Completed Stripe webhook handlers, verified local signature checks successfully.',
      tasksPlanned: 'Write integration test cases for payment failures and chargeback responses.',
      blockers: 'None',
      hoursWorked: 42,
      status: 'submitted',
      submittedAt: new Date('2026-06-26T15:20:00Z')
    },
    {
      userId: bob._id,
      projectId: saasProj._id,
      startDate: weeks[3].start,
      endDate: weeks[3].end,
      weekDateRange: weeks[3].range,
      tasksCompleted: 'Optimized backend DB index execution, reducing query durations on team statistics by 40%.',
      tasksPlanned: 'Setup backend cron jobs to compile dashboard figures weekly.',
      blockers: 'None',
      hoursWorked: 35,
      status: 'submitted',
      submittedAt: new Date('2026-07-03T16:45:00Z')
    },
    {
      userId: bob._id,
      projectId: payProj._id,
      startDate: weeks[4].start,
      endDate: weeks[4].end,
      weekDateRange: weeks[4].range,
      tasksCompleted: 'Configuring payment portal configuration UI and adding dynamic checkout discounts fields.',
      tasksPlanned: 'Test stripe multi-currency integrations.',
      blockers: 'None',
      hoursWorked: 18,
      status: 'pending' // Still working on it
    },

    // CHARLIE DAVIS
    {
      userId: charlie._id,
      projectId: payProj._id,
      startDate: weeks[0].start,
      endDate: weeks[0].end,
      weekDateRange: weeks[0].range,
      tasksCompleted: 'Collaborated on payment schema definitions, set up database models for checkout logs.',
      tasksPlanned: 'Design frontend UI views for invoice history table.',
      blockers: 'None',
      hoursWorked: 40,
      status: 'submitted',
      submittedAt: new Date('2026-06-12T17:30:00Z')
    },
    {
      userId: charlie._id,
      projectId: kubeProj._id,
      startDate: weeks[1].start,
      endDate: weeks[1].end,
      weekDateRange: weeks[1].range,
      tasksCompleted: 'Drafted Dockerfiles for containerizing application services, completed local docker-compose configuration.',
      tasksPlanned: 'Initiate Kubernetes deployment configurations, draft service templates.',
      blockers: 'Dev cluster node limits exceeded, waiting on platform admin to expand resources.',
      hoursWorked: 45,
      status: 'submitted',
      submittedAt: new Date('2026-06-20T10:00:00Z') // submitted late
    },
    {
      userId: charlie._id,
      projectId: kubeProj._id,
      startDate: weeks[2].start,
      endDate: weeks[2].end,
      weekDateRange: weeks[2].range,
      tasksCompleted: 'Created base Helm charts, deployed sandbox instances to dev cluster.',
      tasksPlanned: 'Set up automated ingress controller and configure Let’s Encrypt certificate hooks.',
      blockers: 'None',
      hoursWorked: 42,
      status: 'submitted',
      submittedAt: new Date('2026-06-26T16:55:00Z')
    },
    {
      userId: charlie._id,
      projectId: kubeProj._id,
      startDate: weeks[3].start,
      endDate: weeks[3].end,
      weekDateRange: weeks[3].range,
      tasksCompleted: 'Configured automated SSL rotation using Cert-Manager, deployed staging ingress records.',
      tasksPlanned: 'Add resource limits configurations to deployment yaml specs.',
      blockers: 'None',
      hoursWorked: 38,
      status: 'submitted',
      submittedAt: new Date('2026-07-03T17:15:00Z')
    },
    {
      userId: charlie._id,
      projectId: kubeProj._id,
      startDate: weeks[4].start,
      endDate: weeks[4].end,
      weekDateRange: weeks[4].range,
      tasksCompleted: 'None',
      tasksPlanned: 'Setup CI/CD deployment pipelines inside GitHub Actions workflows.',
      blockers: 'Awaiting webhook access approval keys from corporate security team.',
      hoursWorked: 16,
      status: 'pending' // pending
    },

    // DIANA PRINCE
    {
      userId: diana._id,
      projectId: kubeProj._id,
      startDate: weeks[0].start,
      endDate: weeks[0].end,
      weekDateRange: weeks[0].range,
      tasksCompleted: 'Conducted security scans on base node images, patched dependencies vulnerability issues.',
      tasksPlanned: 'Integrate static code analysis check hooks in pipeline runner scripts.',
      blockers: 'None',
      hoursWorked: 36,
      status: 'submitted',
      submittedAt: new Date('2026-06-12T15:45:00Z')
    },
    {
      userId: diana._id,
      projectId: mobileProj._id,
      startDate: weeks[1].start,
      endDate: weeks[1].end,
      weekDateRange: weeks[1].range,
      tasksCompleted: 'Developed offline sync schema specifications, analyzed background task libraries.',
      tasksPlanned: 'Wired React Native Redux states with AsyncStorage modules.',
      blockers: 'None',
      hoursWorked: 38,
      status: 'submitted',
      submittedAt: new Date('2026-06-19T16:00:00Z')
    },
    {
      userId: diana._id,
      projectId: mobileProj._id,
      startDate: weeks[2].start,
      endDate: weeks[2].end,
      weekDateRange: weeks[2].range,
      tasksCompleted: 'Completed Redux slices for offline data sync storage, resolved lock contention errors.',
      tasksPlanned: 'Build notification handler hooks and local scheduled notifications actions.',
      blockers: 'None',
      hoursWorked: 41,
      status: 'submitted',
      submittedAt: new Date('2026-06-26T17:05:00Z')
    },
    {
      userId: diana._id,
      projectId: kubeProj._id,
      startDate: weeks[3].start,
      endDate: weeks[3].end,
      weekDateRange: weeks[3].range,
      tasksCompleted: 'Wrote network security policy descriptors for dev namespaces, verified egress rules.',
      tasksPlanned: 'Audit staging configurations and harden service-to-service communication paths.',
      blockers: 'None',
      hoursWorked: 40,
      status: 'submitted',
      submittedAt: new Date('2026-07-04T11:30:00Z') // submitted late (due Friday, submitted Saturday)
    },
    {
      userId: diana._id,
      projectId: mobileProj._id,
      startDate: weeks[4].start,
      endDate: weeks[4].end,
      weekDateRange: weeks[4].range,
      tasksCompleted: 'Integrated push notification callbacks and local handlers on Android bundle.',
      tasksPlanned: 'Set up same push notification configurations for iOS provisioning profile.',
      blockers: 'None',
      hoursWorked: 28,
      status: 'submitted',
      submittedAt: new Date('2026-07-08T09:15:00Z') // submitted early this week
    }
  ];

  await Report.insertMany(reportsData);
  console.log(`Successfully seeded ${reportsData.length} weekly reports.`);

  console.log('Database seeding process completed successfully!');
  process.exit(0);
}

seedData().catch((error) => {
  console.error('Failed to seed database:', error.stack || error.message);
  process.exit(1);
});
