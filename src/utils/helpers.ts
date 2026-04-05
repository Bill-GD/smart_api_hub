import db from '../database/knex';

export function getDBClient() {
  return `${db.client.config.client}`;
}
