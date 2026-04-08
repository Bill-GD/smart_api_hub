import express from 'express';
import ResourceController from '../controllers/resource.controller';
import authorize from '../middlewares/authorize.middleware';
import blockResources from '../middlewares/block-resources.middleware';
import filtering from '../middlewares/filtering.middleware';
import pagination from '../middlewares/pagination.middleware';
import ratelimit from '../middlewares/rate-limit.middleware';
import relation from '../middlewares/relation.middleware';
import sorting from '../middlewares/sorting.middleware';
import validateBody from '../middlewares/validate-body.middleware';
import validateFields from '../middlewares/validate-fields.middleware';
import validateResource from '../middlewares/validate-resource.middleware';

const router = express.Router({ mergeParams: true });

router.use(validateResource);

router.get('/',
  ratelimit(10, 6000),
  validateFields,
  pagination,
  sorting,
  filtering,
  relation,
  ResourceController.getAll,
);
router.get('/:id', ratelimit(10, 6000), validateFields, relation, ResourceController.getOne);
router.delete('/:id', ratelimit(10, 6000), authorize('admin'), ResourceController.deleteOne);

router.use(authorize('user', 'admin'), validateBody);
router.post('/', ratelimit(10, 6000), blockResources('users'), ResourceController.postOne);
router.put('/:id', ratelimit(10, 6000), ResourceController.putOne);
router.patch('/:id', ratelimit(10, 6000), ResourceController.patchOne);

export default router;
