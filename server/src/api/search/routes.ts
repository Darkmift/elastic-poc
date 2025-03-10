import { Router } from 'express';
import { search, deleteRecord, listIndexes } from './controllers';

const router = Router();

router.get('/list-indexes', listIndexes);
router.get('/search', search);
router.delete('/:indexName/records/:recordId', deleteRecord);

export default router; 