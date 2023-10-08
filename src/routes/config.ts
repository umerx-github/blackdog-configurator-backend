import { Router, Request, Response } from 'express';
import { Config, OrderedSymbolModel } from '../db/models/Config.js';
import { ResponseBase } from '../interfaces/response.js';
import { NewConfigInterface } from '../interfaces/db/models/index.js';
import test, { Knex, knex } from 'knex';
import { KNEXION } from '../index.js';

const router = Router();

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

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
        req: Request<{}, {}, NewConfigInterface>,
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
            undefined !== req?.body?.symbols &&
            !Array.isArray(req?.body?.symbols)
        ) {
            return res.status(400).json({
                status: 'error',
                message:
                    'Invalid request body: "symbols" should be array of OrderedSymbolInterface',
            });
        }
        if (
            undefined !== req?.body?.isActive &&
            typeof req?.body?.isActive !== 'boolean'
        ) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request body: "isActive" should be boolean',
            });
        }
        if (typeof req?.body?.sellAtPercentile !== 'number') {
            return res.status(400).json({
                status: 'error',
                message:
                    'Invalid request body: "sellAtPercentile" is required number',
            });
        }
        if (typeof req?.body?.buyAtPercentile !== 'number') {
            return res.status(400).json({
                status: 'error',
                message:
                    'Invalid request body: "buyAtPercentile" is required number',
            });
        }
        if (typeof req?.body?.sellTrailingPercent !== 'number') {
            return res.status(400).json({
                status: 'error',
                message:
                    'Invalid request body: "sellTrailingPercent" is required number',
            });
        }
        if (typeof req?.body?.buyTrailingPercent !== 'number') {
            return res.status(400).json({
                status: 'error',
                message:
                    'Invalid request body: "buyTrailingPercent" is required number',
            });
        }
        if (typeof req?.body?.timeframeInDays !== 'number') {
            return res.status(400).json({
                status: 'error',
                message:
                    'Invalid request body: "timeframeInDays" is required number',
            });
        }
        if (typeof req?.body?.alpacaApiKey !== 'string') {
            return res.status(400).json({
                status: 'error',
                message:
                    'Invalid request body: "alpacaApiKey" is required string',
            });
        }
        if (typeof req?.body?.alpacaApiSecret !== 'string') {
            return res.status(400).json({
                status: 'error',
                message:
                    'Invalid request body: "alpacaApiSecret" is required string',
            });
        }

        const newConfig: NewConfigInterface = {
            isActive: req.body.isActive ?? false,
            sellAtPercentile: req?.body?.sellAtPercentile,
            buyAtPercentile: req?.body?.buyAtPercentile,
            sellTrailingPercent: req?.body?.sellTrailingPercent,
            buyTrailingPercent: req?.body?.buyTrailingPercent,
            timeframeInDays: req?.body?.timeframeInDays,
            alpacaApiKey: req?.body?.alpacaApiKey,
            alpacaApiSecret: req?.body?.alpacaApiSecret,
        };
        let responseObj: Config | undefined;
        await KNEXION.transaction(
            async trx => {
                if (newConfig.isActive === true) {
                    await Config.query(trx).patch({ isActive: false });
                }

                const config = await Config.query(trx).insertAndFetch(
                    newConfig
                );

                if (config && Array.isArray(req.body.symbols)) {
                    // Can't do batch on MySQL - only Postgres and SQL Server
                    req.body.symbols.forEach(async symbol => {
                        await config
                            .$relatedQuery<OrderedSymbolModel>('symbols', trx)
                            .relate({ id: symbol.id, order: symbol.order });
                    });
                    // await config.$relatedQuery('symbols').relate([1, 2, 3]);
                }

                responseObj = await Config.query(trx)
                    .findById(config.id)
                    .withGraphFetched('symbols');
            },
            { isolationLevel: 'serializable' }
        );
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
