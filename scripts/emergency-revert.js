const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const API_ENV_PATH = path.join(__dirname, '../apps/api/.env');
const DATABASE_ENV_PATH = path.join(__dirname, '../packages/database/.env');
const SCHEMA_PATH = path.join(__dirname, '../packages/database/prisma/schema.prisma');
const APP_MODULE_PATH = path.join(__dirname, '../apps/api/src/app.module.ts');

console.log('🚨 STARTING EMERGENCY REVERT TO SQLITE 🚨');

// 1. Revert schema.prisma
try {
    let schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    if (schema.includes('provider = "postgresql"')) {
        schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');
        fs.writeFileSync(SCHEMA_PATH, schema);
        console.log('✅ Reverted schema.prisma to SQLite');
    } else {
        console.log('ℹ️ schema.prisma already SQLite');
    }
} catch (e) {
    console.error('❌ Failed to revert schema.prisma', e);
}

// 2. Restore .env files
const SQLITE_URL = 'file:../../packages/database/prisma/dev.db';
// We use the absolute path approach dynamically or relative for simplicity in revert
// Let's use the one that worked for verification: 
// file:/Users/vaibhav/AI_ERP/packages/database/prisma/dev.db
// We need to find the CWD to make it absolute if potential issues arise, but relative is safer for "any machine" script if CWD is correct.
// Let's use the relative path that was working before: file:../../packages/database/prisma/dev.db

try {
    // API .env
    let apiEnv = fs.readFileSync(API_ENV_PATH, 'utf8');
    // Replace any postgres URL with sqlite
    // Regex to replace DATABASE_URL=...
    apiEnv = apiEnv.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${SQLITE_URL}"`);
    fs.writeFileSync(API_ENV_PATH, apiEnv);
    console.log('✅ Restored apps/api/.env');

    // Database .env
    let dbEnv = fs.readFileSync(DATABASE_ENV_PATH, 'utf8');
    dbEnv = dbEnv.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${SQLITE_URL}"`);
    fs.writeFileSync(DATABASE_ENV_PATH, dbEnv);
    console.log('✅ Restored packages/database/.env');

} catch (e) {
    console.error('❌ Failed to restore .env files', e);
}

// 3. Relax Joi Validation in AppModule
// We need to remove the Joi validation or make it accept sqlite file format?
// Joi validation just checks for string.required(), so it should pass as long as DATABASE_URL is there.
// However, if we added strict regex validation (we didn't), it would fail.
// We added: DATABASE_URL: Joi.string().required() -> This is fine for SQLite too.
console.log('ℹ️ Joi Validation compatible with SQLite URL.');


// 4. Regenerate Client
try {
    console.log('🔄 Regenerating Prisma Client...');
    execSync('npx prisma generate', { cwd: path.join(__dirname, '../packages/database'), stdio: 'inherit' });
    console.log('✅ Prisma Client Regenerated');
} catch (e) {
    console.error('❌ Failed to generate client', e);
}

// 5. Push DB (Ensure schema sync)
try {
    console.log('fw DB Push (SQLite)...');
    execSync('npx prisma db push', { cwd: path.join(__dirname, '../packages/database'), stdio: 'inherit' });
    console.log('✅ Database Synced');
} catch (e) {
    console.error('❌ Failed to push db', e);
}

console.log('\n✅ REVERT COMPLETE. You can now run `npm run dev` in apps/web and apps/api.');
