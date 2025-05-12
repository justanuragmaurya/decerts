// Simple script to test database connection
const { PrismaClient } = require('./src/generated/prisma');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    // Try to query the database
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Connection successful!', result);
    
    // Try to count certificates
    const certificateCount = await prisma.certificate.count();
    console.log(`Found ${certificateCount} certificates in the database`);
    
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('\nDatabase connection test passed!');
    } else {
      console.log('\nDatabase connection test failed!');
      console.log('Please check your DATABASE_URL in .env.local');
      console.log('Suggested format: postgresql://postgres:password@localhost:5432/decerts');
    }
    process.exit(success ? 0 : 1);
  });
