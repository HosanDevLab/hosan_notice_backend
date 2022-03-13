import { Router } from 'express';
import { Assignment, AssignmentModel } from '../models/assignments';
import { StudentModel } from '../models/student';
import agenda from '../modules/agenda';
import admin from 'firebase-admin';
import { logger } from '../modules/winston';
import { ClassModel } from '../models/class';

const router = Router({ mergeParams: true });

router.get('/', async (req, res) => {
  try {
    let student = await StudentModel.findOne({ uid: req.user.uid }).exec();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let classroom = await ClassModel.findOne({
      grade: student.grade,
      classNum: student.classNum,
    }).exec();

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    let assignments = await AssignmentModel.find({
      classroom,
    })
      .populate('classroom')
      .populate('subject')
      .populate('author')
      .populate('hearts')
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

    let classroom = await ClassModel.findOne({
      grade: student.grade,
      classNum: student.classNum,
    }).exec();

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    let assignment = await AssignmentModel.create({
      title: data.title,
      description: data.description,
      author: student,
      type: data.type,
      subject: data.subject,
      teacher: data.teacher,
      classroom,
      deadline: data.deadline,
      createdAt: new Date(),
      hearts: [],
    });

    admin.messaging().sendToTopic('assignmentPosted', {
      notification: {
        title: data.title,
        body: `${student.name}님이 새 과제를 등록했어요.`,
      },
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

    let classroom = await ClassModel.findOne({
      grade: student.grade,
      classNum: student.classNum,
    }).exec();

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    let assignment = await AssignmentModel.findOne({
      classroom,
      _id: id,
    })
      .populate('classroom')
      .populate('subject')
      .populate('author')
      .populate('hearts')
      .exec();

    res.send(assignment);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.patch('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    let data = req.body as Partial<Assignment>;

    let student = await StudentModel.findOne({ uid: req.user.uid }).exec();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let classroom = await ClassModel.findOne({
      grade: student.grade,
      classNum: student.classNum,
    }).exec();

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    let updates = {
      title: data.title,
      description: data.description,
      type: data.type,
      subject: data.subject,
      teacher: data.teacher,
      deadline: data.deadline,
    };

    Object.keys(updates).forEach(
      (key) =>
        (updates as any)[key] === undefined && delete (updates as any)[key]
    );

    await AssignmentModel.updateOne(
      {
        classroom,
        _id: id,
      },
      { $set: updates }
    );

    let assignment = await AssignmentModel.findOne({
      classroom,
      _id: id,
    })
      .populate('classroom')
      .populate('subject')
      .populate('author')
      .populate('hearts')
      .exec();

    res.send(assignment);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    let student = await StudentModel.findOne({ uid: req.user.uid }).exec();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let classroom = await ClassModel.findOne({
      grade: student.grade,
      classNum: student.classNum,
    }).exec();

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    await AssignmentModel.deleteOne({
      classroom,
      author: student,
      _id: id,
    }).exec();

    res.send({ message: 'OK' });
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.post('/:id/heart', async (req, res) => {
  const id = req.params.id;

  try {
    let student = await StudentModel.findOne({ uid: req.user.uid }).exec();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let classroom = await ClassModel.findOne({
      grade: student.grade,
      classNum: student.classNum,
    }).exec();

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    await AssignmentModel.updateOne(
      {
        classroom,
        _id: id,
      },
      {
        $addToSet: {
          hearts: student,
        },
      }
    ).exec();

    let assignment = await AssignmentModel.findOne({
      classroom,
      _id: id,
    })
      .populate('classroom')
      .populate('subject')
      .populate('author')
      .populate('hearts')
      .exec();

    res.send(assignment);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.delete('/:id/heart', async (req, res) => {
  const id = req.params.id;

  try {
    let student = await StudentModel.findOne({ uid: req.user.uid }).exec();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let classroom = await ClassModel.findOne({
      grade: student.grade,
      classNum: student.classNum,
    }).exec();

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    await AssignmentModel.updateOne(
      {
        classroom,
        _id: id,
      },
      {
        $pull: {
          hearts: student._id,
        },
      }
    ).exec();

    let assignment = await AssignmentModel.findOne({
      classroom,
      _id: id,
    })
      .populate('classroom')
      .populate('subject')
      .populate('author')
      .populate('hearts')
      .exec();

    res.send(assignment);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

export default router;
