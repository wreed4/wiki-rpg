const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

const runMigrations = async () => {
  try {
    console.log('Running database migrations...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../../sql/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split into individual statements and filter out empty ones
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        try {
          await pool.query(trimmedStatement);
        } catch (error) {
          // Ignore "already exists" errors for tables, extensions, etc.
          if (error.code === '42P07' || error.code === '42P06' || error.code === '42710') {
            console.log(`Skipping existing database object: ${error.message}`);
            continue;
          }
          throw error;
        }
      }
    }
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

module.exports = {
  query,
  pool,
  runMigrations
};