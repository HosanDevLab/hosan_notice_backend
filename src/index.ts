import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import admin from 'firebase-admin';
import routes from './routes';
import mongoose from 'mongoose';
import fs from 'fs';
import agenda from './modules/agenda';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'production') {
  dotenv.config();
  console.log('PRODUCTION');
} else {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
  console.log('DEVELOPMENT');
}

admin.initializeApp({
  credential: admin.credential.cert(
    path.join(__dirname, process.env.SERVICE_ACCOUNT_FILE!)
  ),
});

fs.readdirSync('./src/models')
  .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
  .forEach((file) => require(`./models/${file.split('.')[0]}`));

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(compression());
app.use(cors());
app.set('trust proxy', 1);

app.get('/', (req, res) => {
  res.send({ message: 'Hello' });
});

app.use('/', routes);

const options = {
  definition: {
    info: {
      title: 'hosan notice',
      version: '1.0.0',
      description: 'hosan notice API DOCs',
    },
  },
  apis: ['./routes/*.ts', './routes/*.js'],
};

const specs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

console.log(process.env.DB_USERNAME);

const DB_URI = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOSTNAME}:${process.env.DB_PORT}`;

(async () => {
  await mongoose
    .connect(DB_URI, {
      dbName: process.env.DB_NAME,
      authSource: process.env.DB_AUTH_SOURCE,
    })
    .then(() => console.log('DB connected successfully'))
    .catch(console.error);

  await agenda.start().then(() => {
    console.log('agenda started');
  });
})();

app.listen(PORT, () => {
  console.log(
    `${process.env.NODE_ENV || 'production'} Server started on port ${PORT}`
  );
});
