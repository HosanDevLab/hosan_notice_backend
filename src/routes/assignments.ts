import { Router } from 'express';
import { Assignment, AssignmentModel } from '../models/assignments';
import { StudentModel } from '../models/student';
import { logger } from '../modules/winston';

const router = Router({ mergeParams: true });

router.get('/', async (req, res) => {
  try {
    let student = await StudentModel.findOne({ uid: req.user.uid }).exec();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let assignments = await AssignmentModel.find({
      classes: { $in: student.classes },
    })
      .populate('classes')
      .populate('subject')
      .exec();

    res.send(assignments);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.post('/', async (req, res) => {
  try {
    let data = req.body as Assignment;

    let student = await StudentModel.findOne({ uid: req.user.uid }).exec();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let assignment = await AssignmentModel.create({
      title: data.title,
      description: data.description,
      type: data.type,
      subject: data.subject,
      teacher: data.teacher,
      classes: student.classes,
      deadline: data.deadline,
      createdAt: new Date(),
    });

    res.send(assignment);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    let student = await StudentModel.findOne({ uid: req.user.uid }).exec();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let assignment = await AssignmentModel.findOne({
      classes: { $in: student.classes },
      _id: id,
    })
      .populate('classes')
      .populate('subject')
      .exec();

    res.send(assignment);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

export default router;
