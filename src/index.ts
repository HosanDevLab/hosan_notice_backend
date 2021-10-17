import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import admin from 'firebase-admin';
import routes from './routes';

const PORT = process.env.PORT || 3001;

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(
    path.join(__dirname, process.env.SERVICE_ACCOUNT_FILE!)
  ),
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(compression());
app.use(cors());
app.set('trust proxy', 1);

app.use('/', routes);

app.listen(PORT, () => {
  console.log(
    `${process.env.NODE_ENV || 'production'} Server started on port ${PORT}`
  );
});
