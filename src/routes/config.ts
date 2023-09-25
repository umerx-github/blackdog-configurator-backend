import { Router } from 'express';
import { Config } from '../db/models/Config.js';

const router = Router();

router.post('/', async (req, res) => {
    console.log('intro');
    const model = await Config.query().insertAndFetch(req.body || {});
    console.log('hi');
    return res.json(model);
});

export default router;
