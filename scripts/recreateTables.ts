import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const dbName = process.env.DB_NAME || 'officer_duty_db';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.DB_PORT || '3306');

async function recreateTables() {
  try {
    // First, connect without database to create it if it doesn't exist
    const tempSequelize = new Sequelize('', dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: 'mysql',
      logging: false
    });

    await tempSequelize.authenticate();
    await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await tempSequelize.close();
    console.log(`✓ Database '${dbName}' verified/created.`);

    // Now connect to the actual database
    const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: 'mysql',
      logging: console.log
    });

    await sequelize.authenticate();
    console.log('✓ Connected to database successfully.');

    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'migrations', 'recreate_tables.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // Remove comment lines (lines that start with --)
    sql = sql.split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 0 && !trimmed.startsWith('--');
      })
      .join('\n');

    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`\nExecuting ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await sequelize.query(statement);
          console.log(`✓ Statement ${i + 1}/${statements.length} executed successfully`);
        } catch (error: any) {
          // Ignore "Table doesn't exist" errors for DROP TABLE statements
          if (statement.toUpperCase().includes('DROP TABLE') && error.message.includes("doesn't exist")) {
            console.log(`⚠ Statement ${i + 1}: Table already dropped or doesn't exist (this is OK)`);
          } else {
            console.error(`✗ Error in statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }

    console.log('\n✓ All tables recreated successfully!');
  

    await sequelize.close();
  } catch (error) {
    console.error('✗ Error recreating tables:', error);
    process.exit(1);
  }
}

recreateTables();

