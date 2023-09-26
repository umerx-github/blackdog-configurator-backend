import { Router, Request } from 'express';
import { Config } from '../db/models/Config.js';
import { Symbol } from '../db/models/Symbol.js';
import { Model } from 'objection';

const router = Router();

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

interface ConfigRequestPost {
    symbolIds: number[];
}

router.post('/', async (req: Request<{}, {}, ConfigRequestPost>, res) => {
    // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries
    const config = await Config.query().insertAndFetch({});
    if (config && Array.isArray(req.body.symbolIds)) {
        // Can't do batch on MySQL - only Postgres and SQL Server
        req.body.symbolIds.forEach(async symbolId => {
            await config.$relatedQuery('symbols').relate(symbolId);
        });
        // await config.$relatedQuery('symbols').relate([1, 2, 3]);
    }
    const responseObj = await Config.query()
        .findById(config.id)
        .withGraphFetched('symbols');
    return res.json(responseObj);
});

export default router;
