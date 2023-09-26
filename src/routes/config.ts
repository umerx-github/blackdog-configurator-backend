import { Router, response } from 'express';
import { Config } from '../db/models/Config.js';
import { Symbol } from '../db/models/Symbol.js';
import { Model } from 'objection';

const router = Router();

router.post('/', async (req, res) => {
    console.log('intro');
    // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries
    let symbols: Model[] = [];
    const config = await Config.query().insertAndFetch({});
    if (config) {
        await config.$relatedQuery('symbols').relate(1);
    }
    const responseObj = await Config.query().findById(config.id);
    return res.json(responseObj);
});

export default router;
