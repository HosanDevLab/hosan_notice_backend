import { Router } from 'express';
import { StudentModel } from '../models/student';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';

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

      let student = await StudentModel.findOne({ uid: req.user.uid }).exec();

      if (student && student.loginDevice && student.loginDevice !== deviceId) {
        res.status(401).json({
          code: 40100,
          message: 'Already logged in from another device',
        });
        return;
      }

      let token = jwt.sign({ uid: uid, deviceId }, process.env.SECRET_KEY!, {
        expiresIn: '1 day',
      });

      await student?.updateOne({
        $set: {
          loginDevice: deviceId,
        },
      });

      res.json({ message: 'OK', token });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

router.post('/logout-other', (req, res) => {
  const idToken = req.header('ID-Token');
  if (!idToken) return res.status(401).json({ message: 'Unauthorized' });
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
      const { uid, email } = decodedToken;

      req.user = { uid, email: email! };

      StudentModel.findOneAndUpdate(
        { uid },
        {
          $set: {
            loginDevice: null,
          },
        }
      )
        .exec()
        .then(() => res.json({ message: 'OK' }));
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

export default router;
