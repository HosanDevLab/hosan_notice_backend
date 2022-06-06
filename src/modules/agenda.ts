import Agenda from 'agenda';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { AssignmentModel } from '../models/assignments';
import { ClassModel } from '../models/class';
import { StudentModel } from '../models/student';
import { SubjectModel } from '../models/subjects';
import { TeacherModel } from '../models/teachers';

if (process.env.NODE_ENV === 'production') {
  dotenv.config();
} else {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
}

const DB_URI = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const agenda = new Agenda({
  db: {
    address: DB_URI,
    options: {
      authSource: process.env.DB_AUTH_SOURCE,
    },
  },
});

agenda.define('p', async () => {
  console.log('asdf');
});

agenda.define('pushAssignmentPostedNotification', async (job: any) => {
  let { title, body } = job.attrs.data;

  admin.messaging().sendToTopic('assignmentPosted', {
    notification: {
      title,
      body,
    },
  });
});

agenda.define('pushDeadlineNotification', async (job: any) => {
  let { assignmentId } = job.attrs.data;

  //get assignment data from id
  let assignment = await AssignmentModel.findById(assignmentId).exec();
  if (!assignment) return;

  let subject = await SubjectModel.findById(assignment.subject).exec();
  if (!subject) return;

  let classroom = await ClassModel.findById(assignment.classroom).exec();
  if (!classroom) return;

  let teacher = await TeacherModel.findById(assignment.teacher).exec();

  let classStudents = await StudentModel.find(
    {
      grade: classroom.grade,
      classNum: classroom?.classNum,
    },
    {
      fcmToken: 1,
    }
  )
    .populate('subjects')
    .exec();

  const remoteConfig = await admin.remoteConfig().getTemplate();
  const semester = (
    remoteConfig.parameters[
      process.env.NODE_ENV === 'production'
        ? 'CURRENT_SEMESTER'
        : 'DEV_CURRENT_SEMESTER'
    ].defaultValue as any
  ).value as '1st' | '2nd';

  admin.messaging().sendToDevice(
    classStudents
      .filter(
        (student) =>
          !!student.fcmToken && student.subjects[semester].includes(subject!.id)
      )
      .map((student) => student.fcmToken!),
    {
      notification: {
        title: `내일까지 기한: ${assignment.title}`,
        body: `${subject!.name}${
          teacher ? `(${teacher.name})` : ''
        } 과목에 내일까지 기한인 과제/수행평가가 있습니다!`,
      },
    }
  );
});

export default agenda;
