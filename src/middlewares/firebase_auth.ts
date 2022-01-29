import { Router } from 'express';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import { StudentModel } from '../models/student';

const router = Router({ mergeParams: true });

router.use((req, res, next) => {
  const idToken = req.header('ID-Token');
  const auth = req.header('Authorization');

  if (!idToken) {
    return res
      .status(401)
      .json({ message: 'Unauthorized: missing ID Token in header' });
  }

  if (!auth) {
    return res
      .status(401)
      .json({ message: 'Unauthorized: missing Authorization in header' });
  }

  const [authType, authValue] = auth.split(' ');

  if (authType !== 'Bearer' || !authValue) {
    return res
      .status(401)
      .json({ message: 'Unauthorized: invalid Authorization' });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
      const { uid, email } = decodedToken;

      jwt.verify(authValue, process.env.SECRET_KEY!, async (err, decoded) => {
        if (err || !decoded) {
          return res
            .status(403)
            .json({ message: '토큰을 검사하는 중에 오류가 발생했습니다.' });
        }

        const jwtData = decoded as { uid: string; deviceId: string };

        if (jwtData.uid !== uid) {
          return res.status(403).json({
            message:
              '로그인한 구글 계정과 토큰 데이터상의 계정이 일치하지 않습니다.',
          });
        }

        let student = await StudentModel.findOne({ uid }).exec();

        if (student?.loginDevice && jwtData.deviceId !== student?.loginDevice) {
          return res.status(403).json({
            message: '이미 다른 기기에서 로그인되어 있습니다.',
          });
        }

        req.user = { uid, email: email! };

        next();
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

export default router;
