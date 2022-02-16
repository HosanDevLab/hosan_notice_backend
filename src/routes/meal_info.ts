import axios from 'axios';
import { Router } from 'express';
import nodeCache from '../modules/cache';

const router = Router({ mergeParams: true });

router.get('/', (req, res) => {
  let cachedData = nodeCache.get('mealInfo');
  if (cachedData) return res.json(cachedData);

  let now = new Date();
  now.setHours(now.getHours() + 9);
  axios
    .get(
      'https://open.neis.go.kr/hub/mealServiceDietInfo?' +
        `KEY=${process.env.NEIS_API_KEY}&` +
        'Type=json&' +
        `ATPT_OFCDC_SC_CODE=${process.env.OFFICE_OF_EDUCATION_CODE}&` +
        `SD_SCHUL_CODE=${process.env.STD_SCHOOL_CODE}&` +
        `MLSV_FROM_YMD=${now.toISOString().slice(0, 10).replace(/-/g, '')}`
    )
    .then((r) => {
      res.send(r.data);
      nodeCache.set('mealInfo', r.data, 60 * 60);
    });
});

export default router;
