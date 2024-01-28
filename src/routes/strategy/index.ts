import { Strategy as StrategyModel } from '../../db/models/Strategy.js';
import { Strategy as StrategyTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response, NextFunction } from 'express';
import * as Errors from '../../errors/index.js';
import { KNEXION } from '../../index.js';

const router = Router();
const modelName = 'Strategy';

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

router.get(
    '/',
    async (
        req: Request<
            any,
            any,
            any,
            StrategyTypes.StrategyGetManyRequestQueryRaw
        >,
        res: Response<StrategyTypes.StrategyGetManyResponseBody>,
        next: NextFunction
    ) => {
        const query = StrategyModel.query().orderBy('id', 'desc');
        // .withGraphFetched('configSymbols');
        try {
            const expectedStrategyGetManyRequestQuery: StrategyTypes.StrategyGetManyRequestQuery =
                StrategyTypes.StrategyGetManyRequestQueryFromRaw(req.query);
            if (undefined !== expectedStrategyGetManyRequestQuery.status) {
                query.where(
                    'status',
                    expectedStrategyGetManyRequestQuery.status
                );
            }
            if (undefined !== expectedStrategyGetManyRequestQuery.ids) {
                query.whereIn('id', expectedStrategyGetManyRequestQuery.ids);
            }
            const data = await query;
            return res.json({
                status: 'success',
                message: `${modelName} instances retrieved successfully`,
                data: data,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    '/:id',
    async (
        req: Request<StrategyTypes.StrategyGetSingleRequestParamsRaw>,
        res: Response<StrategyTypes.StrategyGetSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params = StrategyTypes.StrategyGetSingleRequestParamsFromRaw(
                req.params
            );
            const modelData = await StrategyModel.query().findById(params.id);
            if (!modelData) {
                return res.status(404).json({
                    status: 'error',
                    message: `${modelName} not found`,
                });
            }
            return res.json({
                status: 'success',
                message: `${modelName} instance retrieved successfully`,
                data: modelData,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    '/',
    async (
        req: Request<any, any, StrategyTypes.StrategyPostManyRequestBody>,
        res: Response<StrategyTypes.StrategyPostManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: StrategyTypes.StrategyPostManyRequestBody =
                StrategyTypes.StrategyPostManyRequestBodyFromRaw(req.body);
            const modelData: StrategyTypes.StrategyPostManyResponseBodyData =
                [];
            await KNEXION.transaction(
                async trx => {
                    for (const strategy of parsedRequest) {
                        const model = await StrategyModel.query(trx).insert(
                            strategy
                        );
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${modelName} instances created successfully`,
                data: modelData,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.patch(
    '/',
    async (
        req: Request<any, any, StrategyTypes.StrategyPatchManyRequestBody>,
        res: Response<StrategyTypes.StrategyPatchManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: StrategyTypes.StrategyPatchManyRequestBody =
                StrategyTypes.StrategyPatchManyRequestBodyFromRaw(req.body);
            const modelData: StrategyTypes.StrategyPatchManyResponseBodyData =
                [];
            await KNEXION.transaction(
                async trx => {
                    for (const strategy of parsedRequest) {
                        const model = await StrategyModel.query(
                            trx
                        ).patchAndFetchById(strategy.id, strategy);
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${modelName} instances updated successfully`,
                data: modelData,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.patch(
    '/:id',
    async (
        req: Request<
            StrategyTypes.StrategyPatchSingleRequestParamsRaw,
            any,
            StrategyTypes.StrategyPatchSingleRequestBody
        >,
        res: Response<StrategyTypes.StrategyPatchSingleResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const params = StrategyTypes.StrategyGetSingleRequestParamsFromRaw(
                req.params
            );
            const parsedRequest: StrategyTypes.StrategyPatchSingleRequestBody =
                StrategyTypes.StrategyPatchSingleRequestBodyFromRaw(req.body);
            const modelData = await StrategyModel.query().patchAndFetchById(
                params.id,
                parsedRequest
            );
            if (!modelData) {
                return res.status(404).json({
                    status: 'error',
                    message: `${modelName} not found`,
                });
            }
            return res.json({
                status: 'success',
                message: `${modelName} instance updated successfully`,
                data: modelData,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.put(
    '/',
    async (
        req: Request<any, any, StrategyTypes.StrategyPutManyRequestBody>,
        res: Response<StrategyTypes.StrategyPutManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: StrategyTypes.StrategyPutManyRequestBody =
                StrategyTypes.StrategyPutManyRequestBodyFromRaw(req.body);
            const modelData: StrategyTypes.StrategyPutManyResponseBodyData = [];
            await KNEXION.transaction(
                async trx => {
                    for (const strategy of parsedRequest) {
                        const model = await StrategyModel.query(
                            trx
                        ).patchAndFetchById(strategy.id, strategy);
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${modelName} instances updated successfully`,
                data: modelData,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.put(
    '/:id',
    async (
        req: Request<
            StrategyTypes.StrategyPutSingleRequestParamsRaw,
            any,
            StrategyTypes.StrategyPutSingleRequestBody
        >,
        res: Response<StrategyTypes.StrategyPutSingleResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const params = StrategyTypes.StrategyGetSingleRequestParamsFromRaw(
                req.params
            );
            const parsedRequest: StrategyTypes.StrategyPutSingleRequestBody =
                StrategyTypes.StrategyPutSingleRequestBodyFromRaw(req.body);
            const modelData = await StrategyModel.query().patchAndFetchById(
                params.id,
                parsedRequest
            );
            if (!modelData) {
                return res.status(404).json({
                    status: 'error',
                    message: `${modelName} not found`,
                });
            }
            return res.json({
                status: 'success',
                message: `${modelName} instance updated successfully`,
                data: modelData,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.delete(
    '/',
    async (
        req: Request<
            any,
            any,
            any,
            StrategyTypes.StrategyDeleteManyRequestQueryRaw
        >,
        res: Response<StrategyTypes.StrategyDeleteManyResponseBody>,
        next: NextFunction
    ) => {
        const query = StrategyModel.query();
        try {
            const expectedStrategyDeleteManyRequestQuery: StrategyTypes.StrategyDeleteManyRequestQuery =
                StrategyTypes.StrategyDeleteManyRequestQueryFromRaw(req.query);
            const modelData: StrategyTypes.StrategyPutManyResponseBodyData = [];
            await KNEXION.transaction(
                async trx => {
                    for (const id of expectedStrategyDeleteManyRequestQuery.ids) {
                        const model = await StrategyModel.query(trx).findById(
                            id
                        );
                        if (!model) {
                            throw new Errors.ModelNotFoundError(
                                `Unable to find ${modelName} with id ${id}`
                            );
                        }
                        modelData.push(model);
                        await StrategyModel.query(trx).deleteById(id);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${modelName} instances deleted successfully`,
                data: modelData,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.delete(
    '/:id',
    async (
        req: Request<StrategyTypes.StrategyDeleteSingleRequestParamsRaw>,
        res: Response<StrategyTypes.StrategyDeleteSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params =
                StrategyTypes.StrategyDeleteSingleRequestParamsFromRaw(
                    req.params
                );
            const modelData = await StrategyModel.query().findById(params.id);
            if (!modelData) {
                return res.status(404).json({
                    status: 'error',
                    message: `${modelName} not found`,
                });
            }
            await StrategyModel.query().deleteById(params.id);
            return res.json({
                status: 'success',
                message: `${modelName} instance deleted successfully`,
                data: modelData,
            });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
