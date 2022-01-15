import { Router } from 'express';
import { StudentModel } from '../models/student';
import admin from 'firebase-admin';

const router = Router({ mergeParams: true });

router.get('/token', (req, res) => {
  const idToken = req.header('ID-Token');
  const deviceId = req.header('Device-ID');
  if (!idToken) return res.status(401).json({ message: 'Unauthorized' });
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
      const { uid, email } = decodedToken;

      req.user = { uid, email: email! };

      if (!email || !email.endsWith('@hosan.hs.kr')) {
        return res
          .status(401)
          .json({ message: 'Only hosan.hs.kr email can be used for login' });
      }

      const student = await StudentModel.findById(uid).exec();

      if (student && student.loginDevice !== deviceId) {
        res.status(401).json({
          code: 40100,
          message: 'Already logged in from another device',
        });
        return;
      }

      res.json({
        token: await admin.auth().createCustomToken(uid),
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

router.post('/logout-another', (req, res) => {
  const idToken = req.header('ID-Token');
  const deviceId = req.header('Device-ID');
  if (!idToken) return res.status(401).json({ message: 'Unauthorized' });
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
      const { uid, email } = decodedToken;

      req.user = { uid, email: email! };

      StudentModel.findByIdAndUpdate(uid, {
        $set: {
          loginDevice: deviceId,
        },
      })
        .exec()
        .then(() => res.json({ message: 'OK' }));
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

export default router;
