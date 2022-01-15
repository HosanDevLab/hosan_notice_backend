import { Router } from 'express';
import { StudentModel } from '../models/student';
import { logger } from '../modules/winston';

const router = Router({ mergeParams: true });

router.get('/me', async (req, res) => {
  try {
    let students = await StudentModel.find({}).exec();
    res.send(students);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

export default router;
