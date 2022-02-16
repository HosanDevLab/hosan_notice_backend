import { Router } from 'express';
import { StudentModel } from '../models/student';
import { logger } from '../modules/winston';

const router = Router({ mergeParams: true });

router.get('/me', async (req, res) => {
  try {
    console.log(req.user.uid);
    let student = await StudentModel.findOne(
      { uid: req.user.uid },
      { refreshToken: 0 }
    ).exec();

    res.json(student);
    console.log(student);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

export default router;
