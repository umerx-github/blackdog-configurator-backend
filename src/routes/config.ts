import { Router, Request, Response } from 'express';
import { Config } from '../db/models/Config.js';
import { ResponseBase } from '../interfaces/response.js';

const router = Router();

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

interface ConfigRequestPost {
    symbolIds: number[];
    isActive?: boolean;
}

router.get('/', async (req, res: Response<ResponseBase<Config[]>>) => {
    const configs = await Config.query()
        .orderBy('id', 'desc')
        .withGraphFetched('symbols');
    return res.json({
        status: 'success',
        message: 'Configurations retrieved successfully',
        data: configs,
    });
});

router.get('/active', async (req, res: Response<ResponseBase<Config>>) => {
    const configs = await Config.query()
        .where('isActive', true)
        .orderBy('id', 'desc')
        .first()
        .withGraphFetched('symbols');
    if (!configs) {
        return res.status(404).json({
            status: 'error',
            message: 'No active configuration found',
        });
    }
    return res.json({
        status: 'success',
        message: 'Active configuration retrieved successfully',
        data: configs,
    });
});

router.post(
    '/',
    async (
        req: Request<{}, {}, ConfigRequestPost>,
        res: Response<ResponseBase<Config>>
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries
        if (
            undefined !== req?.body?.isActive &&
            typeof req?.body?.isActive !== 'boolean'
        ) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request body: "isActive" should be boolean',
            });
        }
        if (
            undefined !== req?.body?.symbolIds &&
            !Array.isArray(req?.body?.symbolIds)
        ) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request body: "symbolIds" should be array',
            });
        }
        const newConfig: { isActive?: boolean } = {};

        if (undefined !== req?.body?.isActive) {
            newConfig.isActive = req.body.isActive;
        }

        if (newConfig.isActive === true) {
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

        if (!responseObj) {
            return res.status(404).json({
                status: 'error',
                message: 'Configuration not found',
            });
        }

        return res.json({
            status: 'success',
            message: 'Configuration created successfully',
            data: responseObj,
        });
    }
);

export default router;
