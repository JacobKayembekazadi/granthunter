import { db } from './index';
import { organizations, opportunities, searchAgents } from './schema';

export async function seed() {
  // Create a default organization
  const [org] = await db.insert(organizations).values({
    name: 'Default Organization',
    domain: 'example.com',
  }).returning();

  // Create sample opportunities
  await db.insert(opportunities).values([
    {
      title: 'Autonomous Drone Swarm Control Systems',
      agency: 'DARPA',
      value: '$25M - $50M',
      dueDate: new Date('2025-10-15'),
      status: 'analyzing',
      matchScore: 94,
      naicsCode: '541715',
      description: 'Development of decentralized command and control architecture for heterogeneous drone swarms in contested environments.',
      organizationId: org.id,
    },
    {
      title: 'Cybersecurity Infrastructure Upgrade - Phase III',
      agency: 'Dept of Energy',
      value: '$10M - $15M',
      dueDate: new Date('2025-11-01'),
      status: 'new',
      matchScore: 88,
      naicsCode: '541512',
      description: 'Modernization of legacy SCADA systems including zero-trust architecture implementation across regional power grids.',
      organizationId: org.id,
    },
  ]);

  // Create sample search agents
  await db.insert(searchAgents).values([
    {
      name: 'Global Energy Sweep',
      target: 'NAICS 541512, 541715',
      status: 'Active',
      hits: 142,
      lastRun: new Date(),
      organizationId: org.id,
    },
    {
      name: 'DARPA Swarm Monitor',
      target: 'Keywords: Swarm, Drone',
      status: 'Learning',
      hits: 12,
      lastRun: new Date(),
      organizationId: org.id,
    },
  ]);

  console.log('Database seeded successfully');
}

