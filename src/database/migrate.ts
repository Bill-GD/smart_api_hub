import fs from 'node:fs';
import db from './knex';

// Only detect new table additions, not column changes or table deletions.
export async function runMigration(path: string) {
  if (process.env.DB_ENABLED === 'false') {
    return console.log('Database migration disabled.');
  }
  
  console.log(`Migrating from ${path}`);
  const schema = JSON.parse(fs.readFileSync(path, 'utf-8'));
  
  let changed = false;
  
  for (const tableName of Object.keys(schema)) {
    if (await db.schema.hasTable(tableName)) {
      continue;
    }
    
    changed = true;
    
    const sample = schema[tableName][0];
    await db.schema.createTable(tableName, (table) => {
      table.increments('id');
      Object.entries(sample).forEach(([col, val]) => {
        if (col === 'id') return;
        
        if (typeof val === 'number') table.integer(col);
        else if (typeof val === 'boolean') table.boolean(col);
        else table.text(col);
      });
    });
    console.log(`Created table: "${tableName}"`);
  }
  if (!changed) {
    console.log('No schema changes, skipping migration');
  }
}
