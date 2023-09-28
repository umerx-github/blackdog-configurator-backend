import { Router, Request } from 'express';
import { Config } from '../db/models/Config.js';
import { Symbol } from '../db/models/Symbol.js';
import { Model } from 'objection';

const router = Router();

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

interface ConfigRequestPost {
    symbolIds: number[];
    isActive?: boolean;
}

router.get('/', async (req, res) => {
    const configs = await Config.query()
        .orderBy('id', 'desc')
        .withGraphFetched('symbols');
    return res.json(configs);
});

router.get('/active', async (req, res) => {
    const configs = await Config.query()
        .where('isActive', true)
        .orderBy('id', 'desc')
        .first()
        .withGraphFetched('symbols');
    return res.json(configs);
});

router.post('/', async (req: Request<{}, {}, ConfigRequestPost>, res) => {
    // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries
    if (
        undefined !== req?.body?.isActive &&
        typeof req?.body?.isActive !== 'boolean'
    ) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid request body: "isActive" is expected boolean',
            data: {},
        });
    }
    if (
        undefined !== req?.body?.symbolIds &&
        !Array.isArray(req?.body?.symbolIds)
    ) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid request body: "symbolIds" is expected array',
            data: {},
        });
    }
    const newConfig = {};

    if (undefined !== req?.body?.isActive) {
        newConfig['isActive'] = req.body.isActive;
    }

    if (newConfig['isActive'] === true) {
        await Config.query().patch({ isActive: false });
    }

    const config = await Config.query().insertAndFetch(newConfig);

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
