import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@openvideo.dev' },
    update: {},
    create: {
      email: 'admin@openvideo.dev',
      name: 'Admin User',
      role: 'admin',
    },
  });

  console.log(`✅ Created admin user: ${admin.email}`);

  // Create sample voice profile
  const voiceProfile = await prisma.voiceProfile.create({
    data: {
      name: 'Default Voice',
      provider: 'omnivoice',
      status: 'active',
    },
  });

  console.log(`✅ Created voice profile: ${voiceProfile.name}`);

  // Create sample project
  const project = await prisma.project.create({
    data: {
      title: 'Sample Video Project',
      description: 'A sample project to demonstrate the Open Video Studio workflow',
      theme: 'technology',
      tone: 'professional',
      targetDuration: 60,
      status: 'draft',
      tags: ['demo', 'sample'],
      voiceProfileId: voiceProfile.id,
    },
  });

  console.log(`✅ Created sample project: ${project.title}`);

  // Create sample scenes
  const scenes = await Promise.all([
    prisma.scene.create({
      data: {
        projectId: project.id,
        orderIndex: 0,
        title: 'Introduction',
        script: 'Welcome to Open Video Studio, the future of automated video creation.',
        keywords: ['technology', 'innovation', 'future'],
        status: 'draft',
      },
    }),
    prisma.scene.create({
      data: {
        projectId: project.id,
        orderIndex: 1,
        title: 'Features',
        script: 'Our platform combines AI-powered script generation, voice synthesis, and intelligent media selection.',
        keywords: ['AI', 'automation', 'features'],
        status: 'draft',
      },
    }),
    prisma.scene.create({
      data: {
        projectId: project.id,
        orderIndex: 2,
        title: 'Conclusion',
        script: 'Start creating professional videos in minutes, not hours.',
        keywords: ['conclusion', 'call-to-action'],
        status: 'draft',
      },
    }),
  ]);

  console.log(`✅ Created ${scenes.length} sample scenes`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
