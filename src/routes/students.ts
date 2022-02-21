import { Router } from 'express';
import { StudentModel, Student } from '../models/student';
import { logger } from '../modules/winston';

const router = Router({ mergeParams: true });

router.post('/', async (req, res) => {
  const { grade, classNum, numberInClass, name, subjects, classes } =
    req.body as Student;

  try {
    let student = await StudentModel.findOneAndUpdate(
      { uid: req.user.uid },
      {
        uid: req.user.uid,
        grade,
        classNum,
        numberInClass,
        name,
        subjects,
        classes,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json(student);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.get('/me', async (req, res) => {
  try {
    let student = await StudentModel.findOne(
      { uid: req.user.uid },
      { refreshToken: 0 }
    )
      .populate('subjects')
      .populate('classes')
      .exec();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

export default router;
