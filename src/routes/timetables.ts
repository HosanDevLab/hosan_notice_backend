import { Router } from 'express';
import { ClassModel } from '../models/class';
import { StudentModel } from '../models/student';
import { TimetableModel } from '../models/timetables';
import { logger } from '../modules/winston';

const router = Router({ mergeParams: true });

router.get('/me', async (req, res) => {
  try {
    let student = await StudentModel.findOne({ uid: req.user.uid }).exec();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let classroom = await ClassModel.findOne({
      grade: student.grade,
      classNum: student.classNum,
    })
      .populate('teacher')
      .exec();

    if (!classroom) {
      return res.status(404).json({ error: 'Class not found' });
    }

    let timetableset = await TimetableModel.findOne({ classroom })
      .populate('classroom')
      .populate('table.subject')
      .exec();

    res.json(timetableset);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

export default router;
