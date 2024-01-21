import { Strategy as StrategyModel } from '../../db/models/Strategy.js';
import { Strategy as StrategyTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import { z, ZodError } from 'zod';
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
        res: Response<StrategyTypes.StrategyGetManyResponseBody>
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
            if (err instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request query: ${err.message}`,
                });
            }
            throw err;
        }
    }
);

router.get(
    '/:id',
    async (
        req: Request<StrategyTypes.StrategyGetSingleRequestParamsRaw>,
        res: Response<StrategyTypes.StrategyGetSingleResponseBody>
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
            if (err instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request params: ${err.message}`,
                });
            }
        }
    }
);

router.post(
    '/',
    async (
        req: Request<any, any, StrategyTypes.StrategyPostManyRequestBody>,
        res: Response<StrategyTypes.StrategyPostManyResponseBody>
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
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request body: ${e.message}`,
                });
            }
            throw e;
        }
    }
);

router.patch(
    '/',
    async (
        req: Request<any, any, StrategyTypes.StrategyPatchManyRequestBody>,
        res: Response<StrategyTypes.StrategyPatchManyResponseBody>
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
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request body: ${e.message}`,
                });
            }
            throw e;
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
        res: Response<StrategyTypes.StrategyPatchSingleResponseBody>
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
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request body: ${e.message}`,
                });
            }
            throw e;
        }
    }
);

router.put(
    '/',
    async (
        req: Request<any, any, StrategyTypes.StrategyPutManyRequestBody>,
        res: Response<StrategyTypes.StrategyPutManyResponseBody>
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
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request body: ${e.message}`,
                });
            }
            throw e;
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
        res: Response<StrategyTypes.StrategyPutSingleResponseBody>
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
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request body: ${e.message}`,
                });
            }
            throw e;
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
        res: Response<StrategyTypes.StrategyDeleteManyResponseBody>
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
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request body: ${e.message}`,
                });
            }
            if (e instanceof Errors.ModelNotFoundError) {
                return res.status(404).json({
                    status: 'error',
                    message: e.message,
                });
            }
            throw e;
        }
    }
);

router.delete(
    '/:id',
    async (
        req: Request<StrategyTypes.StrategyDeleteSingleRequestParamsRaw>,
        res: Response<StrategyTypes.StrategyDeleteSingleResponseBody>
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
            if (err instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request params: ${err.message}`,
                });
            }
        }
    }
);

export default router;
