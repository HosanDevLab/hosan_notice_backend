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

    res.json(classroom);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.get('/all', async (req, res) => {
  try {
    let classrooms = await ClassModel.find().populate('teacher').exec();

    res.json(classrooms);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.get('/:id', async (req, res) => {
  try {
    let classroom = await ClassModel.findById(req.params.id)
      .populate('teacher')
      .exec();

    if (!classroom) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(classroom);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.get('/:id/timetables', async (req, res) => {
  try {
    let timetableset = await TimetableModel.findOne({
      classroom: req.params.id,
    })
      .populate('table.subject')
      .exec();

    if (!timetableset) {
      return res.status(404).json({ error: 'Timetable not found' });
    }

    res.json(timetableset);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

export default router;
