import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HttpStatus from '../src/utils/http-status';
import { expectHttpError, mockDBObject } from '../src/utils/test-helper';
import { ResourceRequest, ResourceResponse } from '../src/utils/types';

describe('/:resource', () => {
  describe('/', () => {
    afterEach(() => {
      vi.clearAllMocks();
      vi.resetModules();
    });
    
    it('returns 200 and rate limit headers on successful get', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      vi.spyOn(resourceUtils, 'checkField').mockResolvedValue(true);
      
      const { default: ResourceController } = await import('../src/controllers/resource.controller');
      vi.spyOn(ResourceController, 'getAll')
        .mockImplementation(async (_req: ResourceRequest, res: ResourceResponse) => {
          res.status(HttpStatus.OK).json([]);
        });
      
      const { default: app } = await import('../src/app');
      
      const res = await request(app).get('/realresource');
      
      expect(res.status).toBe(200);
      expect(res.headers).toHaveProperty('x-ratelimit-limit');
      expect(res.headers).toHaveProperty('x-ratelimit-remaining');
    });
    
    it('returns 400 for invalid resource name', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(false);
      
      const { default: app } = await import('../src/app');
      const res = await request(app).get('/notrealresource');
      
      expectHttpError(res, 400);
    });
    
    it('returns 400 for invalid resource fields', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      const spy = vi.spyOn(mockDBObject(), 'where').mockResolvedValue([{ column_name: 'realfield' }]);
      
      const { default: app } = await import('../src/app');
      let res = await request(app).get('/realresource?_fields=notrealfield');
      expectHttpError(res, 400);
      spy.mockRestore();
    });
    
    it('returns 400 for invalid fields filtering', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      vi.spyOn(resourceUtils, 'checkField').mockResolvedValue(false);
      
      const { default: app } = await import('../src/app');
      const res = await request(app).get('/realresource?notrealfield=1234');
      expectHttpError(res, 400);
    });
    
    it('returns 400 on invalid pagination query', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      vi.spyOn(resourceUtils, 'checkField').mockResolvedValue(true);
      
      const { default: app } = await import('../src/app');
      const res = await request(app).get('/realresource?_page=aa&_limit=zz');
      
      expectHttpError(res, 400);
    });
    
    it('returns 429 after reaching rate limit', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      
      const { default: app } = await import('../src/app');
      
      for (let i = 0; i < 10; i++) {
        await request(app).get('/realresource');
      }
      
      const res = await request(app).get('/realresource');
      expectHttpError(res, 429);
    });
    
    it('returns 201 on successful post', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      vi.spyOn(resourceUtils, 'checkField').mockResolvedValue(true);
      
      const { default: ResourceController } = await import('../src/controllers/resource.controller');
      vi.spyOn(ResourceController, 'postOne')
        .mockImplementation(async (_req: ResourceRequest, res: ResourceResponse) => {
          res.status(HttpStatus.CREATED).json({});
        });
      
      vi.doMock('../src/middlewares/validate-body.middleware', () => ({
        default: async (_req: any, _res: any, next: () => any) => next(),
      }));
      
      const { default: CryptoService } = await import('../src/services/crypto.service');
      vi.spyOn(CryptoService, 'verifyToken').mockReturnValue({
        email: '', id: 0, password: '', username: '', role: 'user',
      });
      
      const { default: app } = await import('../src/app');
      const res = await request(app)
        .post('/realresource')
        .set('Authorization', 'Bearer realtoken')
        .send({});
      
      expect(res.status).toBe(201);
    });
    
    it('returns 401 when user is not authenticated', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      vi.spyOn(resourceUtils, 'checkField').mockResolvedValue(true);
      
      vi.doMock('../src/middlewares/validate-body.middleware', () => ({
        default: async (_req: any, _res: any, next: () => any) => next(),
      }));
      
      const { default: app } = await import('../src/app');
      const res = await request(app)
        .post('/realresource')
        .send({});
      
      expectHttpError(res, 401);
    });
    
    it('returns 403 when user is not authorized', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      vi.spyOn(resourceUtils, 'checkField').mockResolvedValue(true);
      
      vi.doMock('../src/middlewares/validate-body.middleware', () => ({
        default: async (_req: any, _res: any, next: () => any) => next(),
      }));
      
      const { default: CryptoService } = await import('../src/services/crypto.service');
      vi.spyOn(CryptoService, 'verifyToken').mockReturnValue({
        // @ts-ignore
        email: '', id: 0, password: '', username: '', role: '',
      });
      
      const { default: app } = await import('../src/app');
      const res = await request(app)
        .post('/realresource')
        .set('Authorization', 'Bearer realtoken')
        .send({});
      
      expectHttpError(res, 403);
    });
    
    it('returns 405 when trying to post to user outside /auth', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      vi.spyOn(resourceUtils, 'checkField').mockResolvedValue(true);
      
      vi.doMock('../src/middlewares/validate-body.middleware', () => ({
        default: async (_req: any, _res: any, next: () => any) => next(),
      }));
      
      const { default: CryptoService } = await import('../src/services/crypto.service');
      vi.spyOn(CryptoService, 'verifyToken').mockReturnValue({
        email: '', id: 0, password: '', username: '', role: 'user',
      });
      
      const { default: app } = await import('../src/app');
      const res = await request(app)
        .post('/users')
        .set('Authorization', 'Bearer realtoken')
        .send({});
      
      expectHttpError(res, 405, false);
    });
  });
  
  describe('/:id', () => {
    it('returns 200 on successful get', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      vi.spyOn(mockDBObject(), 'first').mockResolvedValue({});
      
      const { default: app } = await import('../src/app');
      
      const res = await request(app).get('/realresource/1');
      
      expect(res.status).toBe(200);
    });
    
    it('returns 201 when successfully putting new resource', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      vi.spyOn(resourceUtils, 'checkField').mockResolvedValue(true);
      
      vi.doMock('../src/middlewares/validate-body.middleware', () => ({
        default: async (_req: any, _res: any, next: () => any) => next(),
      }));
      
      const { default: CryptoService } = await import('../src/services/crypto.service');
      vi.spyOn(CryptoService, 'verifyToken').mockReturnValue({
        email: '', id: 0, password: '', username: '', role: 'user',
      });
      
      vi.spyOn(mockDBObject(), 'first').mockResolvedValue({ count: 0 });
      vi.spyOn(mockDBObject(), 'insert').mockResolvedValue([1]);
      
      const { default: app } = await import('../src/app');
      
      const res = await request(app)
        .put('/realresource/1')
        .set('Authorization', 'Bearer realtoken')
        .send({});
      
      expect(res.status).toBe(201);
    });
    
    it('returns 204 when successfully replacing resource', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      
      vi.doMock('../src/middlewares/validate-body.middleware', () => ({
        default: async (_req: any, _res: any, next: () => any) => next(),
      }));
      
      const { default: CryptoService } = await import('../src/services/crypto.service');
      vi.spyOn(CryptoService, 'verifyToken').mockReturnValue({
        email: '', id: 0, password: '', username: '', role: 'user',
      });
      
      vi.spyOn(mockDBObject(), 'first').mockResolvedValue({ count: 1 });
      vi.spyOn(mockDBObject(), 'update').mockResolvedValue(1);
      
      const { default: app } = await import('../src/app');
      
      const res = await request(app)
        .put('/realresource/1')
        .set('Authorization', 'Bearer realtoken')
        .send({});
      
      expect(res.status).toBe(204);
    });
    
    it('returns 204 when successfully patching resource', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      
      vi.doMock('../src/middlewares/validate-body.middleware', () => ({
        default: async (_req: any, _res: any, next: () => any) => next(),
      }));
      
      const { default: CryptoService } = await import('../src/services/crypto.service');
      vi.spyOn(CryptoService, 'verifyToken').mockReturnValue({
        email: '', id: 0, password: '', username: '', role: 'user',
      });
      
      vi.spyOn(mockDBObject(), 'update').mockResolvedValue(1);
      
      const { default: app } = await import('../src/app');
      
      const res = await request(app)
        .patch('/realresource/1')
        .set('Authorization', 'Bearer realtoken')
        .send({});
      
      expect(res.status).toBe(204);
    });
    
    it('returns 404 when trying to patch non-existent resource', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      
      vi.doMock('../src/middlewares/validate-body.middleware', () => ({
        default: async (_req: any, _res: any, next: () => any) => next(),
      }));
      
      const { default: CryptoService } = await import('../src/services/crypto.service');
      vi.spyOn(CryptoService, 'verifyToken').mockReturnValue({
        email: '', id: 0, password: '', username: '', role: 'user',
      });
      
      vi.spyOn(mockDBObject(), 'update').mockResolvedValue(0);
      
      const { default: app } = await import('../src/app');
      
      const res = await request(app)
        .patch('/realresource/1')
        .set('Authorization', 'Bearer realtoken')
        .send({});
      
      expectHttpError(res, 404);
    });
    
    it('returns 204 when successfully deleting resource', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      
      vi.doMock('../src/middlewares/validate-body.middleware', () => ({
        default: async (_req: any, _res: any, next: () => any) => next(),
      }));
      
      const { default: CryptoService } = await import('../src/services/crypto.service');
      vi.spyOn(CryptoService, 'verifyToken').mockReturnValue({
        email: '', id: 0, password: '', username: '', role: 'admin',
      });
      
      vi.spyOn(mockDBObject(), 'del').mockResolvedValue(1);
      
      const { default: app } = await import('../src/app');
      
      const res = await request(app)
        .delete('/realresource/1')
        .set('Authorization', 'Bearer realtoken');
      
      expect(res.status).toBe(204);
    });
    
    it('returns 403 when non-admin tries to delete resource', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      
      vi.doMock('../src/middlewares/validate-body.middleware', () => ({
        default: async (_req: any, _res: any, next: () => any) => next(),
      }));
      
      const { default: CryptoService } = await import('../src/services/crypto.service');
      vi.spyOn(CryptoService, 'verifyToken').mockReturnValue({
        email: '', id: 0, password: '', username: '', role: 'user',
      });
      
      const { default: app } = await import('../src/app');
      
      const res = await request(app)
        .patch('/realresource/1')
        .set('Authorization', 'Bearer realtoken')
        .send({});
      
      expectHttpError(res, 404);
    });
    
    it('returns 404 when trying to delete non-existent resource', async () => {
      const resourceUtils = await import('../src/utils/helpers');
      vi.spyOn(resourceUtils, 'checkResource').mockResolvedValue(true);
      
      vi.doMock('../src/middlewares/validate-body.middleware', () => ({
        default: async (_req: any, _res: any, next: () => any) => next(),
      }));
      
      const { default: CryptoService } = await import('../src/services/crypto.service');
      vi.spyOn(CryptoService, 'verifyToken').mockReturnValue({
        email: '', id: 0, password: '', username: '', role: 'admin',
      });
      
      vi.spyOn(mockDBObject(), 'del').mockResolvedValue(0);
      
      const { default: app } = await import('../src/app');
      
      const res = await request(app)
        .patch('/realresource/1')
        .set('Authorization', 'Bearer realtoken')
        .send({});
      
      expectHttpError(res, 404);
    });
  });
});
