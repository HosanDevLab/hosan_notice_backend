import { Router } from 'express';
import { StudentModel } from '../models/student';
import admin from 'firebase-admin';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

const router = Router({ mergeParams: true });

router.get('/token', (req, res) => {
  const idToken = req.header('ID-Token');
  const deviceId = req.header('Device-ID');
  if (!idToken) {
    return res
      .status(401)
      .json({ message: 'Unauthorized: missing ID Token in header' });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
      const { uid, email } = decodedToken;

      req.user = { uid, email: email! };

      if (!email || !email.endsWith('@hosan.hs.kr')) {
        return res
          .status(403)
          .json({ message: 'Only hosan.hs.kr email can be used for login' });
      }

      let student = await StudentModel.findOne({ uid: req.user.uid }).exec();

      if (student && student.loginDevice && student.loginDevice !== deviceId) {
        res.status(403).json({
          code: 40300,
          message: 'Already logged in from another device',
        });
        return;
      }

      let token = jwt.sign({ uid: uid, deviceId }, process.env.SECRET_KEY!, {
        expiresIn: '1m',
      });

      let refreshToken = jwt.sign({}, process.env.SECRET_KEY!, {
        expiresIn: '14d',
      });

      await student?.updateOne({
        $set: {
          loginDevice: deviceId,
          refreshToken,
        },
      });

      res.json({ message: 'OK', token, refreshToken });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

router.get('/refresh', (req, res) => {
  const idToken = req.header('ID-Token');
  const deviceId = req.header('Device-ID');
  const auth = req.header('Authorization');
  const refreshToken = req.header('Refresh-Token');

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

  const [authType, accessToken] = auth.split(' ');

  if (authType !== 'Bearer' || !accessToken) {
    return res
      .status(401)
      .json({ message: 'Unauthorized: invalid Authorization' });
  }

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: 'Unauthorized: missing refresh token in header' });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
      const { uid, email } = decodedToken;

      req.user = { uid, email: email! };

      if (!email || !email.endsWith('@hosan.hs.kr')) {
        return res
          .status(403)
          .json({ message: 'Only hosan.hs.kr email can be used for login' });
      }

      let student = await StudentModel.findOne({ uid: req.user.uid }).exec();

      if (student && student.loginDevice && student.loginDevice !== deviceId) {
        res.status(403).json({
          code: 40300,
          message: 'Already logged in from another device',
        });
        return;
      }

      let isAccessTokenValid = false;
      let isAccessTokenExpired = false;
      try {
        jwt.verify(accessToken, process.env.SECRET_KEY!);
        isAccessTokenValid = true;
      } catch (_e) {
        let error = _e as JsonWebTokenError;
        if (error.name === 'TokenExpiredError') {
          isAccessTokenExpired = true;
        }
      }

      const decodedAccessToken = jwt.decode(accessToken);

      if (!decodedAccessToken) {
        return res.status(401).json({
          message: 'Unauthorized: invalid access token',
        });
      }

      let isRefreshTokenValid = false;
      let isRefreshTokenExpired = false;
      try {
        jwt.verify(refreshToken, process.env.SECRET_KEY!);
        isRefreshTokenValid =
          !!student?.refreshToken && refreshToken === student?.refreshToken;
      } catch (_e) {
        let error = _e as JsonWebTokenError;
        if (error.name === 'TokenExpiredError') {
          isRefreshTokenExpired = true;
        }
      }

      console.log(
        isAccessTokenValid,
        isAccessTokenExpired,
        isRefreshTokenValid,
        isRefreshTokenExpired
      );

      if (!isAccessTokenValid && isAccessTokenExpired) {
        if (!isRefreshTokenValid && isRefreshTokenExpired) {
          return res.status(401).json({
            message: 'Unauthorized: access token and refresh token expired',
          });
        } else if (!isRefreshTokenValid) {
          return res.status(401).json({
            message: 'Unauthorized: invalid refresh token',
          });
        } else {
          let token = jwt.sign(
            { uid: uid, deviceId },
            process.env.SECRET_KEY!,
            {
              expiresIn: '1m',
            }
          );

          await student?.updateOne({
            $set: {
              loginDevice: deviceId,
            },
          });

          res.json({ message: 'OK', token, refreshToken });
        }
      } else {
        res.status(400).json({
          message: 'Access token is not expired yet',
        });
      }
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
