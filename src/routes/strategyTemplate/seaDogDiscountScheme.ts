import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeModel } from '../../db/models/StrategyTemplateSeaDogDiscountScheme.js';
import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import * as Errors from '../../errors/index.js';
import { KNEXION } from '../../index.js';

const router = Router();
const modelName = 'StrategyTemplateSeaDogDiscountScheme';

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

router.get(
    '/',
    async (
        req: Request<
            any,
            any,
            any,
            StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetManyRequestQueryRaw
        >,
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetManyResponseBody>
    ) => {
        const query = StrategyTemplateSeaDogDiscountSchemeModel.query().orderBy(
            'id',
            'desc'
        );
        // .withGraphFetched('configSymbols');
        try {
            const expectedStrategyTemplateSeaDogDiscountSchemeGetManyRequestQuery: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetManyRequestQuery =
                StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetManyRequestQueryFromRaw(
                    req.query
                );
            if (
                undefined !==
                expectedStrategyTemplateSeaDogDiscountSchemeGetManyRequestQuery.status
            ) {
                query.where(
                    'status',
                    expectedStrategyTemplateSeaDogDiscountSchemeGetManyRequestQuery.status
                );
            }
            if (
                undefined !==
                expectedStrategyTemplateSeaDogDiscountSchemeGetManyRequestQuery.strategyId
            ) {
                query.where(
                    'strategyId',
                    expectedStrategyTemplateSeaDogDiscountSchemeGetManyRequestQuery.strategyId
                );
            }
            if (
                undefined !==
                expectedStrategyTemplateSeaDogDiscountSchemeGetManyRequestQuery.ids
            ) {
                query.whereIn(
                    'id',
                    expectedStrategyTemplateSeaDogDiscountSchemeGetManyRequestQuery.ids
                );
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
        req: Request<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetSingleRequestParamsRaw>,
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetSingleResponseBody>
    ) => {
        try {
            const params =
                StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetSingleRequestParamsFromRaw(
                    req.params
                );
            const modelData =
                await StrategyTemplateSeaDogDiscountSchemeModel.query().findById(
                    params.id
                );
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
        req: Request<
            any,
            any,
            StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePostManyRequestBody
        >,
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePostManyResponseBody>
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePostManyRequestBody =
                StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePostManyRequestBodyFromRaw(
                    req.body
                );
            const modelData: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePostManyResponseBodyData =
                [];
            await KNEXION.transaction(
                async trx => {
                    for (const strategyTemplateSeaDogDiscountScheme of parsedRequest) {
                        const model =
                            await StrategyTemplateSeaDogDiscountSchemeModel.query(
                                trx
                            ).insert(strategyTemplateSeaDogDiscountScheme);
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
        req: Request<
            any,
            any,
            StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchManyRequestBody
        >,
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchManyResponseBody>
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchManyRequestBody =
                StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchManyRequestBodyFromRaw(
                    req.body
                );
            const modelData: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchManyResponseBodyData =
                [];
            await KNEXION.transaction(
                async trx => {
                    for (const strategyTemplateSeaDogDiscountScheme of parsedRequest) {
                        const model =
                            await StrategyTemplateSeaDogDiscountSchemeModel.query(
                                trx
                            ).patchAndFetchById(
                                strategyTemplateSeaDogDiscountScheme.id,
                                strategyTemplateSeaDogDiscountScheme
                            );
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
            StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchSingleRequestParamsRaw,
            any,
            StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchSingleRequestBody
        >,
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchSingleResponseBody>
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const params =
                StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetSingleRequestParamsFromRaw(
                    req.params
                );
            const parsedRequest: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchSingleRequestBody =
                StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchSingleRequestBodyFromRaw(
                    req.body
                );
            const modelData =
                await StrategyTemplateSeaDogDiscountSchemeModel.query().patchAndFetchById(
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
        req: Request<
            any,
            any,
            StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutManyRequestBody
        >,
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutManyResponseBody>
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutManyRequestBody =
                StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutManyRequestBodyFromRaw(
                    req.body
                );
            const modelData: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutManyResponseBodyData =
                [];
            await KNEXION.transaction(
                async trx => {
                    for (const strategyTemplateSeaDogDiscountScheme of parsedRequest) {
                        const model =
                            await StrategyTemplateSeaDogDiscountSchemeModel.query(
                                trx
                            ).patchAndFetchById(
                                strategyTemplateSeaDogDiscountScheme.id,
                                strategyTemplateSeaDogDiscountScheme
                            );
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
            StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutSingleRequestParamsRaw,
            any,
            StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutSingleRequestBody
        >,
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutSingleResponseBody>
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const params =
                StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetSingleRequestParamsFromRaw(
                    req.params
                );
            const parsedRequest: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutSingleRequestBody =
                StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutSingleRequestBodyFromRaw(
                    req.body
                );
            const modelData =
                await StrategyTemplateSeaDogDiscountSchemeModel.query().patchAndFetchById(
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
            StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteManyRequestQueryRaw
        >,
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteManyResponseBody>
    ) => {
        const query = StrategyTemplateSeaDogDiscountSchemeModel.query();
        try {
            const expectedStrategyTemplateSeaDogDiscountSchemeDeleteManyRequestQuery: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteManyRequestQuery =
                StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteManyRequestQueryFromRaw(
                    req.query
                );
            const modelData: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutManyResponseBodyData =
                [];
            await KNEXION.transaction(
                async trx => {
                    for (const id of expectedStrategyTemplateSeaDogDiscountSchemeDeleteManyRequestQuery.ids) {
                        const model =
                            await StrategyTemplateSeaDogDiscountSchemeModel.query(
                                trx
                            ).findById(id);
                        if (!model) {
                            throw new Errors.ModelNotFoundError(
                                `Unable to find ${modelName} with id ${id}`
                            );
                        }
                        modelData.push(model);
                        await StrategyTemplateSeaDogDiscountSchemeModel.query(
                            trx
                        ).deleteById(id);
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
        req: Request<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteSingleRequestParamsRaw>,
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteSingleResponseBody>
    ) => {
        try {
            const params =
                StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteSingleRequestParamsFromRaw(
                    req.params
                );
            const modelData =
                await StrategyTemplateSeaDogDiscountSchemeModel.query().findById(
                    params.id
                );
            if (!modelData) {
                return res.status(404).json({
                    status: 'error',
                    message: `${modelName} not found`,
                });
            }
            await StrategyTemplateSeaDogDiscountSchemeModel.query().deleteById(
                params.id
            );
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
