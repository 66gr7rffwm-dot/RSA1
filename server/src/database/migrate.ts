import fs from 'fs';
import path from 'path';
import { pool } from './connection';

async function runMigrations() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('🔧 Running database migrations...');
    await pool.query(sql);
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();


