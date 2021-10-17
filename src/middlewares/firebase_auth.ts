import { Router } from 'express';
import admin from 'firebase-admin';

const router = Router({ mergeParams: true });

router.use((req, res, next) => {
  const idToken = req.header('ID-Token');
  if (!idToken) return res.status(401).json({ message: 'Unauthorized' });
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const { uid, email } = decodedToken;
      req.user = { uid, email: email! };
      next();
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

export default router;
