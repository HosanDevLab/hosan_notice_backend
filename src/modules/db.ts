import mongoose from 'mongoose';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  dotenv.config();
  console.log('PRODUCTION');
} else {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
  console.log('DEVELOPMENT');
}

mongoose.connect(
  `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/admin`
);

const db = mongoose.connection;

db.once('connection', () => {
  console.log('Connected to MongoDB');
});

export default db;
