import { Knex } from 'knex';
import db from '../database/knex';
import HttpStatus from '../utils/http-status';
import { ResourceRequest, ResourceResponse } from '../utils/types';

function matchSpecialWhereClauses(
  query: Knex.QueryBuilder,
  filter: { field: string, op: string, value: string, },
) {
  switch (filter.op) {
    case '_like':
      query.orWhereILike(filter.field, `%${filter.value}%`);
      break;
  }
}

export default class ResourceController {
  static async getAll(req: ResourceRequest, res: ResourceResponse) {
    const { resource: tableName } = req.params;
    const { columns: selects, sorting, pagination, filtering, relation } = res.locals;
    
    const query = db(tableName)
      .select(...selects)
      .orderBy(sorting.field, sorting.order)
      .offset(pagination.offset)
      .limit(pagination.limit);
    
    for (const filter of filtering) {
      if (filter.op.startsWith('_')) {
        matchSpecialWhereClauses(query, filter);
      } else {
        query.orWhere(filter.field, filter.op, filter.value);
      }
    }
    
    if (relation?.expand) {
      const parentTable = relation.expand.table;
      query
        .innerJoin(
          parentTable,
          `${tableName}.${relation.expand.foreignKey}`,
          `${parentTable}.id`,
        )
        .select(db.raw(`to_jsonb(${parentTable}) as ${relation.expand.prop}`));
    }
    if (relation?.embed) {
      const childTable = relation.embed.table;
      const subquery = db(childTable)
        .select(db.raw(`COALESCE(json_agg(to_jsonb(${childTable})), '[]')`))
        .where(`${childTable}.${relation.embed.foreignKey}`, db.ref(`${tableName}.id`));
      query.select(subquery.as(relation.embed.table));
    }
    
    // @ts-ignore
    const [result, [{ count }]] = await Promise.all([
      query,
      db(tableName).count('id as count'),
    ]);
    
    res.setHeader('X-Total-Count', count);
    res.status(HttpStatus.OK).json(result);
  }
  
  static async getOne(req: ResourceRequest, res: ResourceResponse) {
    const { resource: tableName, id } = req.params;
    const { relation } = res.locals;
    
    const query = db(tableName)
      .select(...res.locals.columns)
      .where(`${tableName}.id`, id)
      .first();
    
    if (relation?.expand) {
      const parentTable = relation.expand.table;
      query
        .innerJoin(
          parentTable,
          `${tableName}.${relation.expand.foreignKey}`,
          `${parentTable}.id`,
        )
        .select(db.raw(`to_jsonb(${parentTable}) as ${relation.expand.prop}`));
    }
    if (relation?.embed) {
      const childTable = relation.embed.table;
      const subquery = db(childTable)
        .select(db.raw(`COALESCE(json_agg(to_jsonb(${childTable})), '[]')`))
        .where(`${childTable}.${relation.embed.foreignKey}`, id);
      query.select(subquery.as(relation.embed.table));
    }
    
    const result = await query;
    res.status(HttpStatus.OK).json(result);
  }
  
  static async postOne(req: ResourceRequest, res: ResourceResponse) {
    const { resource: tableName } = req.params;
    const [{ id: newId }] = await db(tableName).insert(req.body, ['id']);
    res.status(HttpStatus.CREATED).json({
      id: newId,
    });
  }
  
  static async putOne(req: ResourceRequest, res: ResourceResponse) {
    const { resource: tableName, id } = req.params;
    
    const result = await db(tableName)
      .where({ id })
      .count('id')
      .first();
    
    const count = +(result?.count ?? 0);
    if (count <= 0) {
      await db(tableName).insert({ id, ...req.body });
      res.status(HttpStatus.CREATED).json({ id: +id });
    } else {
      await db(tableName).update(req.body).where({ id });
      res.sendStatus(HttpStatus.NO_CONTENT);
    }
  }
  
  static async patchOne(req: ResourceRequest, res: ResourceResponse) {
    const { resource: tableName, id } = req.params;
    await db(tableName).update(req.body).where({ id });
    res.sendStatus(HttpStatus.NO_CONTENT);
  }
  
  static async deleteOne(req: ResourceRequest, res: ResourceResponse) {
    const { resource: tableName, id } = req.params;
    await db(tableName).where({ id }).delete();
    res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
