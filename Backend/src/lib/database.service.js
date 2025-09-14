/**
 * Prisma Client Configuration for Project_Neutron LMS
 */

const { PrismaClient } = require('../../generated/prisma');

// Create a single instance of Prisma Client
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty',
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
});

process.on('SIGINT', async () => {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
    process.exit(0);
});

module.exports = prisma;
