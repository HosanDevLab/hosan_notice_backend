import Agenda from 'agenda';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

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

export default agenda;
