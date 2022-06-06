import { Router } from 'express';
import { Assignment, AssignmentModel } from '../models/assignments';
import { StudentModel } from '../models/student';
import agenda from '../modules/agenda';
import admin from 'firebase-admin';
import { logger } from '../modules/winston';
import { ClassModel } from '../models/class';
import { AssignmentCommentsModel } from '../models/assignments_comments';
import { SubjectModel } from '../models/subjects';
import { TeacherModel } from '../models/teachers';

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

    let student = await StudentModel.findOne({ uid: req.user.uid })
      .populate('subjects')
      .exec();

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

    let classStudents = await StudentModel.find(
      {
        grade: student.grade,
        classNum: student.classNum,
      },
      {
        fcmToken: 1,
      }
    )
      .populate('subjects')
      .exec();

    let subject = await SubjectModel.findById(data.subject).exec();
    let teacher = await TeacherModel.findById(data.teacher).exec();

    const remoteConfig = await admin.remoteConfig().getTemplate();
    const semester = (
      remoteConfig.parameters[
        process.env.NODE_ENV === 'production'
          ? 'CURRENT_SEMESTER'
          : 'DEV_CURRENT_SEMESTER'
      ].defaultValue as any
    ).value as '1st' | '2nd';

    console.log(student.subjects[semester]);

    admin.messaging().sendToDevice(
      classStudents
        .filter(
          (student) =>
            !!student.fcmToken &&
            student.subjects[semester].includes(data.subject)
        )
        .map((student) => student.fcmToken!),
      {
        notification: {
          title: data.title,
          body: `${student.name}님이 ${subject!.name}${
            teacher ? `(${teacher.name})` : ''
          } 과목 새 과제를 등록했어요.`,
        },
      }
    );

    if (data.deadline) {
      let alertDt = new Date(data.deadline);
      alertDt.setUTCDate(alertDt.getUTCDate() - 1);
      agenda.schedule(alertDt, 'pushDeadlineNotification', {
        assignmentId: assignment.id,
      });
    }

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

router.get('/:id/comments', async (req, res) => {
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

    let comments = await AssignmentCommentsModel.find({
      assignment: id,
    })
      .sort({ createdAt: 1 })
      .populate('author')
      .populate('hearts')
      .exec();

    res.send(comments);
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.post('/:id/comments', async (req, res) => {
  const id = req.params.id;
  const { content, parent } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

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

    let comments = await AssignmentCommentsModel.create({
      assignment: id,
      content,
      author: student,
      createdAt: new Date(),
      hearts: [],
      parent,
    });

    res.send(comments);

    let assignment = await AssignmentModel.findOne({
      classroom,
      _id: id,
    })
      .populate('author')
      .exec();

    if (!assignment) return;

    if ((assignment.author as any).uid !== student.uid) {
      admin.messaging().sendToDevice([(assignment.author as any).fcmToken], {
        notification: {
          title: content,
          body: `${student.name}님이 새 댓글을 등록했어요.`,
        },
      });
    }
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});

router.delete('/:id/comments/:commentid', async (req, res) => {
  const id = req.params.id;
  const commentId = req.params.commentid;

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
    }).exec();

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await AssignmentCommentsModel.deleteOne({
      classroom,
      author: student,
      assignment,
      _id: commentId,
    }).exec();

    res.send({ message: 'OK' });
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

    let assignment = await AssignmentModel.findOne({
      classroom,
      _id: id,
    }).exec();

    if (assignment?.author.toString() !== student.id) {
      return res.status(403).json({ error: 'Not authorized' });
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
        author: student,
      },
      { $set: updates }
    );

    let new_assignment = await AssignmentModel.findOne({
      classroom,
      _id: id,
    })
      .populate('classroom')
      .populate('subject')
      .populate('author')
      .populate('hearts')
      .exec();

    await agenda.cancel({
      name: `pushDeadlineNotification`,
      data: {
        assignmentId: id,
      },
    });

    if (data.deadline) {
      let alertDt = new Date(data.deadline);
      alertDt.setUTCDate(alertDt.getUTCDate() - 1);
      agenda.schedule(alertDt, 'pushDeadlineNotification', {
        assignmentId: new_assignment!.id,
      });
    }

    res.send(new_assignment);
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

    let assignment = await AssignmentModel.findOne({
      classroom,
      _id: id,
    }).exec();

    if (assignment?.author.toString() !== student.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await AssignmentModel.deleteOne({
      classroom,
      author: student,
      _id: id,
    }).exec();

    await agenda.cancel({
      name: `pushDeadlineNotification`,
      data: {
        assignmentId: id,
      },
    });

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

    if (!assignment) return;

    let author = assignment!.author as any;

    if (author.id !== student.id) {
      admin.messaging().sendToDevice([author.fcmToken], {
        notification: {
          title: '좋아요 추가됨',
          body: `${author.name}님이 ${assignment.title} 과제에 좋아요를 눌렀습니다.`,
        },
      });
    }
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
