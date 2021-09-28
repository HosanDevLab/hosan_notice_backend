import { Router } from 'express';
import admin from 'firebase-admin';

const router = Router({ mergeParams: true });

router.post('/update', (req, res) => {
  console.log(req.body);
  const db = admin.firestore();

  if (!['man', 'woman'].includes(req.body.type)) {
    return res
      .status(400)
      .json({ message: "'type' property must be 'man' or 'woman'." });
  }

  const data: { [key: string]: string } = {};

  data[req.body.type as string] = req.body.percent;

  db.collection('toilet_paper')
    .doc(req.body.id)
    .update(data)
    .then(() => res.json({ message: 'OK' }))
    .catch((e) => {
      console.error(e);
    });
});

export default router;
