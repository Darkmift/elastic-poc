import { Router } from 'express';
import { uploadCsv } from './controllers';

const router = Router();

router.post('/upload', uploadCsv);

export default router;
