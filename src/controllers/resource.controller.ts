import { Knex } from 'knex';
import db from '../database/knex';
import { checkField } from '../utils/helpers';
import { NotFoundError } from '../utils/http-error';
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
    
    if (req.query.q) {
      const textColumns = (await db('information_schema.columns')
        .select('column_name')
        .whereIn('data_type', ['text', 'character', 'varying character'])
        .andWhere({ table_schema: 'public', table_name: tableName })).map((r) => r['column_name']);
      
      query.where((builder) => {
        textColumns.forEach((c) => builder.orWhereILike(c, `%${req.query.q}%`));
      });
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
    if (!result) {
      throw new NotFoundError(tableName, id);
    }
    res.status(HttpStatus.OK).json(result);
  }
  
  static async postOne(req: ResourceRequest, res: ResourceResponse) {
    const { resource: tableName } = req.params;
    const { user: { id: userId } } = res.locals;
    if (await checkField(tableName, 'user_id')) {
      req.body = { ...req.body, user_id: userId };
    }
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
      const { user: { id: userId } } = res.locals;
      if (await checkField(tableName, 'user_id')) {
        req.body = { ...req.body, user_id: userId };
      }
      await db(tableName).insert({ id, ...req.body });
      res.status(HttpStatus.CREATED).json({ id: +id });
    } else {
      await db(tableName).where({ id }).update(req.body);
      res.sendStatus(HttpStatus.NO_CONTENT);
    }
  }
  
  static async patchOne(req: ResourceRequest, res: ResourceResponse) {
    const { resource: tableName, id } = req.params;
    const result = await db(tableName).where({ id }).update(req.body);
    if (result <= 0) {
      throw new NotFoundError(tableName, id);
    }
    res.sendStatus(HttpStatus.NO_CONTENT);
  }
  
  static async deleteOne(req: ResourceRequest, res: ResourceResponse) {
    const { resource: tableName, id } = req.params;
    const rows = await db(tableName).where({ id }).del();
    if (rows <= 0) {
      throw new NotFoundError(tableName, id);
    }
    res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
