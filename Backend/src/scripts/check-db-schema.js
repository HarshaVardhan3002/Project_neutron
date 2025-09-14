/**
 * Script to check existing database schema and enums
 */

require('dotenv').config();
const { Pool } = require('pg');

async function checkSchema() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔍 Checking existing database schema...');

        const client = await pool.connect();

        // Check existing enums
        console.log('\n📋 Existing Enums:');
        const enumsResult = await client.query(`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder;
    `);

        const enums = {};
        enumsResult.rows.forEach(row => {
            if (!enums[row.enum_name]) {
                enums[row.enum_name] = [];
            }
            enums[row.enum_name].push(row.enum_value);
        });

        Object.entries(enums).forEach(([name, values]) => {
            console.log(`  ${name}: [${values.join(', ')}]`);
        });

        // Check existing tables
        console.log('\n📋 Existing Tables:');
        const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });

        // Check courses table structure if it exists
        const coursesCheck = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'courses'
      ORDER BY ordinal_position;
    `);

        if (coursesCheck.rows.length > 0) {
            console.log('\n📋 Courses Table Structure:');
            coursesCheck.rows.forEach(row => {
                console.log(`  ${row.column_name}: ${row.data_type} (${row.udt_name})`);
            });
        }

        client.release();

    } catch (error) {
        console.error('❌ Error checking schema:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

checkSchema()
    .then(() => {
        console.log('\n✅ Schema check completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Schema check failed:', error);
        process.exit(1);
    });