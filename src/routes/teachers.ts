import { Router } from 'express';
import { TeacherModel } from '../models/teachers';
import { logger } from '../modules/winston';

const router = Router({ mergeParams: true });

router.get('/all', async (req, res) => {
  try {
    let teachers = await TeacherModel.find().populate('classroom').exec();

    console.log(teachers);
    res.send(teachers);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.get('/:id', async (req, res) => {
  try {
    let teacher = await TeacherModel.findById(req.params.id).exec();

    res.send(teacher);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

export default router;
