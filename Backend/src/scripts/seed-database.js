/**
 * Script to seed the database with test users.
 * This script is idempotent and can be run multiple times.
 */

require('dotenv').config({ path: './.env' });

const { supabaseAdmin } = require('../lib/supabase.service');
const prisma = require('../lib/database.service');

const testUsers = [
  {
    email: 'student@test.com',
    password: 'Student123!',
    role: 'student',
    displayName: 'Test Student',
  },
  {
    email: 'instructor@test.com',
    password: 'Instructor123!',
    role: 'instructor',
    displayName: 'Test Instructor',
  },
  {
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin',
    displayName: 'Test Admin',
  },
  {
    email: 'superadmin@test.com',
    password: 'SuperAdmin123!',
    role: 'super_admin',
    displayName: 'Test Super Admin',
  },
];

async function seedDatabase() {
  console.log('Starting database seeding...');

  for (const userData of testUsers) {
    try {
      // 1. Check if user already exists in Supabase Auth
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ email: userData.email });
      if (listError) throw new Error(`Error checking for user ${userData.email}: ${listError.message}`);

      let authUser;
      if (users && users.length > 0) {
        console.log(`Auth user ${userData.email} already exists. Skipping creation.`);
        authUser = users[0];
      } else {
        // 2. Create user in Supabase Auth if they don't exist
        const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // Auto-confirm email for test users
          user_metadata: {
            display_name: userData.displayName,
          },
        });
        if (createError) throw new Error(`Error creating auth user ${userData.email}: ${createError.message}`);

        authUser = data.user;
        console.log(`Successfully created auth user: ${userData.email}`);
      }

      // 3. Check if profile already exists in our public schema
      const profile = await prisma.profiles.findUnique({
        where: { id: authUser.id },
      });

      if (profile) {
        console.log(`Profile for ${userData.email} already exists. Skipping creation.`);
      } else {
        // 4. Create profile in our database if it doesn't exist
        await prisma.profiles.create({
          data: {
            id: authUser.id,
            email: authUser.email,
            display_name: userData.displayName,
            role: userData.role,
          },
        });
        console.log(`Successfully created profile for: ${userData.email}`);
      }
    } catch (error) {
      console.error(`Failed to process user ${userData.email}. Reason:`, error.message);
    }
  }

  console.log('Database seeding finished.');
}

seedDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
