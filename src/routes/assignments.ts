import { Router } from 'express';
import { AssignmentModel } from '../models/assignments';
import { ClassModel } from '../models/class';
import { StudentModel } from '../models/student';
import { logger } from '../modules/winston';

const router = Router({ mergeParams: true });

router.get('/', async (req, res) => {
  try {
    console.log(req.user.uid);
    let student = await StudentModel.findOne({ uid: req.user.uid }).exec();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let classes = await ClassModel.find({ students: student._id }).exec();

    let assignments = await AssignmentModel.find({
      classes: { $in: classes.map((c) => c._id) },
    })
      .populate('classes')
      .exec();

    res.send(assignments);
    console.log(assignments);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

export default router;
