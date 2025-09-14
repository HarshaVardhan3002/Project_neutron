/**
 * Script to create the necessary enums in the database
 */

require('dotenv').config();
const { Pool } = require('pg');

async function setupEnums() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔧 Setting up database enums...');

        const client = await pool.connect();

        // Create enums if they don't exist
        const enums = [
            `CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'instructor', 'tutor')`,
            `CREATE TYPE "PlanTier" AS ENUM ('trial', 'basic', 'premium', 'enterprise')`,
            `CREATE TYPE "EnrollmentStatus" AS ENUM ('active', 'paused', 'completed', 'cancelled')`,
            `CREATE TYPE "BookingStatus" AS ENUM ('requested', 'confirmed', 'completed', 'cancelled')`,
            `CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'completed', 'failed', 'refunded')`,
            `CREATE TYPE "PaymentMethod" AS ENUM ('card', 'upi', 'netbanking', 'wallet')`,
            `CREATE TYPE "AttemptStatus" AS ENUM ('in_progress', 'submitted', 'graded', 'expired')`,
            `CREATE TYPE "TestKind" AS ENUM ('quiz', 'assignment', 'mock_test', 'final_exam')`,
            `CREATE TYPE "QuestionKind" AS ENUM ('multiple_choice', 'single_choice', 'true_false', 'short_answer', 'essay', 'fill_blank', 'matching')`,
            `CREATE TYPE "LessonKind" AS ENUM ('video', 'text', 'interactive', 'quiz', 'assignment', 'live_class')`,
            `CREATE TYPE "FileKind" AS ENUM ('image', 'video', 'audio', 'document', 'archive')`,
            `CREATE TYPE "TestType" AS ENUM ('ielts', 'toefl', 'pte', 'gre', 'gmat', 'sat', 'custom')`
        ];

        for (const enumSql of enums) {
            try {
                await client.query(enumSql);
                console.log(`✅ Created enum: ${enumSql.split('"')[1]}`);
            } catch (error) {
                if (error.code === '42710') {
                    console.log(`⚠️  Enum already exists: ${enumSql.split('"')[1]}`);
                } else {
                    console.error(`❌ Error creating enum: ${error.message}`);
                }
            }
        }

        client.release();
        console.log('🎉 Database enums setup completed!');

    } catch (error) {
        console.error('❌ Error setting up enums:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

setupEnums()
    .then(() => {
        console.log('✅ Enum setup completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Enum setup failed:', error);
        process.exit(1);
    });