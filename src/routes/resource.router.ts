import express from 'express';
import ResourceController from '../controllers/resource.controller';
import filtering from '../middlewares/filtering.middleware';
import pagination from '../middlewares/pagination.middleware';
import relation from '../middlewares/relation.middleware';
import sorting from '../middlewares/sorting.middleware';
import validateFields from '../middlewares/validate-fields.middleware';
import validateResource from '../middlewares/validate-resource.middleware';

const router = express.Router({ mergeParams: true });

router.use(validateResource);

router.get('/',
  validateFields,
  pagination,
  sorting,
  filtering,
  relation,
  ResourceController.getAll,
);

router.post('/', ResourceController.postOne);
router.get('/:id', validateFields, relation, ResourceController.getOne);
router.put('/:id', ResourceController.putOne);
router.patch('/:id', ResourceController.patchOne);
router.delete('/:id', ResourceController.deleteOne);

export default router;
