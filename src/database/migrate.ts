import fs from 'node:fs';
import { getDBClient } from '../utils/helpers';
import db from './knex';

const ON_UPDATE_TIMESTAMP_FUNCTION = `
  CREATE OR REPLACE FUNCTION on_update_timestamp()
  RETURNS trigger AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
$$ language 'plpgsql';
`;

function onUpdateTrigger(table: string) {
  return `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
  `;
}

// Only detect new table additions, not column changes or table deletions.
export async function runMigration(path: string) {
  if (process.env.DB_ENABLED === 'false') {
    return console.log('Database migration disabled.');
  }
  
  // create update timestamp function
  await db.raw(ON_UPDATE_TIMESTAMP_FUNCTION);
  
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
        
        if (col === 'password') table.specificType(col, 'char(60)');
        else if (typeof val === 'number') table.integer(col);
        else if (typeof val === 'boolean') table.boolean(col);
        else table.text(col);
      });
      
      table.timestamps(true, true);
    });
    if (getDBClient() === 'pg') {
      await db.raw(onUpdateTrigger(tableName));
    }
    
    await db(tableName).insert(sample);
    
    console.log(`Created table: "${tableName}" and seeded 1 record`);
  }
  if (changed) {
    console.log('Finished migration');
  } else {
    console.log('No schema changes, skipped migration');
  }
}
