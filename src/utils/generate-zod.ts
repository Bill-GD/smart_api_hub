import fs from 'node:fs';
import { z } from 'zod';
import { validatorCache } from './validators';

export function generateZod(schemaPath: string) {
  console.log(`Generating Zod schemas from ${schemaPath}`);
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  
  for (const tableName of Object.keys(schema)) {
    const sample = schema[tableName][0];
    const shape: any = {};
    
    if (tableName === 'users') {
      Object.keys(sample).forEach((col) => {
        switch (col) {
          case 'id':
          case 'email':
          case 'role':
            break;
          case 'password':
            console.log('Password update not supported (yet)');
            break;
          case 'username':
            shape[col] = z.string().trim().min(4);
            break;
        }
      });
    } else {
      Object.entries(sample).forEach(([col, val]) => {
        // auto generated/attached fields
        if (col === 'id' || col === 'user_id') {
          return;
        }
        
        switch (typeof val) {
          case 'boolean':
            shape[col] = z.boolean();
            break;
          case 'string':
            shape[col] = z.string().trim().min(1);
            break;
          case 'number':
            shape[col] = z.int();
            if (!col.endsWith('_id')) {
              shape[col] = shape[col].exactOptional();
            }
            break;
        }
      });
    }
    
    validatorCache.set(tableName, z.object(shape));
    console.log(`Generated schema for: "${tableName}"`);
  }
  console.log('Finished generating Zod schemas');
}
