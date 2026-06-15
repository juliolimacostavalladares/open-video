import { PrismaClient } from '@prisma/client';

export { PrismaClient };

// Re-export all Prisma types
export * from '@prisma/client';

// Create a singleton Prisma client
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, attach to global to prevent multiple instances
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
