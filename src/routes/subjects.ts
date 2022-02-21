import { Router } from 'express';
import { SubjectModel } from '../models/subjects';
import { logger } from '../modules/winston';

const router = Router({ mergeParams: true });

router.get('/all', async (req, res) => {
  try {
    let subjects = await SubjectModel.find().exec();

    res.send(subjects);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.get('/:id', async (req, res) => {
  try {
    let subject = await SubjectModel.findById(req.params.id).exec();

    res.send(subject);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

export default router;
