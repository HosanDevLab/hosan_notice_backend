import { Router } from 'express';
import firebaseAuth from '../middlewares/firebase_auth';
import toiletPaper from './toilet_paper';
import mealInfo from './meal_info';
import students from './students';
import assignments from './assignments';
import subjects from './subjects';
import teachers from './teachers';
import classes from './classes';
import timetables from './timetables';
import auth from './auth';

const router = Router({ mergeParams: true });

router.use('/toilet_paper', toiletPaper);
router.use('/students', firebaseAuth, students);
router.use('/assignments', firebaseAuth, assignments);
router.use('/subjects', firebaseAuth, subjects);
router.use('/teachers', firebaseAuth, teachers);
router.use('/classes', firebaseAuth, classes);
router.use('/timetables', firebaseAuth, timetables);
router.use('/auth', auth);
router.use('/meal-info', firebaseAuth, mealInfo);

export default router;
