import { Router } from 'express';
import firebaseAuth from '../middlewares/firebase_auth';
import toiletPaper from './toilet_paper';
import mealInfo from './meal_info';

const router = Router({ mergeParams: true });

router.use('/toilet_paper', toiletPaper);
router.use('/meal-info', firebaseAuth, mealInfo);

export default router;
