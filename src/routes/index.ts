import { Router } from 'express';
import toiletPaper from './toilet_paper';

const router = Router({ mergeParams: true });

router.use('/toilet_paper', toiletPaper);

export default router;
