import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeModel } from '../../db/models/StrategyTemplateSeaDogDiscountScheme.js';
import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import * as Errors from '../../errors/index.js';
import { KNEXION } from '../../index.js';
import { Symbol as SymbolModel } from '../../db/models/Symbol.js';
import { SymbolModelInterface } from '@umerx/umerx-blackdog-configurator-types-typescript/build/src/symbol.js';
import { Knex } from 'knex';

const router = Router();
const modelName = 'StrategyTemplateSeaDogDiscountScheme';

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

function postRequestBodyDataInstanceToRequiredFields(
    requestBodyData: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePostRequestBodyDataInstance
): StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeRequiredFields {
    const modelData: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeRequiredFields =
        {
            strategyId: requestBodyData.strategyId,
            status: requestBodyData.status,
            cashInCents: requestBodyData.cashInCents,
            sellAtPercentile: requestBodyData.sellAtPercentile,
        };
    return modelData;
}
function patchRequestBodyDataInstanceToRequiredFields(
    requestBodyData: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchRequestBodyDataInstance
): StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeRequiredFieldsOptional {
    let modelData: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeRequiredFieldsOptional =
        {};
    if (undefined !== requestBodyData.strategyId) {
        modelData.strategyId = requestBodyData.strategyId;
    }
    if (undefined !== requestBodyData.status) {
        modelData.status = requestBodyData.status;
    }
    if (undefined !== requestBodyData.cashInCents) {
        modelData.cashInCents = requestBodyData.cashInCents;
    }
    if (undefined !== requestBodyData.sellAtPercentile) {
        modelData.sellAtPercentile = requestBodyData.sellAtPercentile;
    }
    return modelData;
}
function modelToResponseBodyDataInstance(
    model: StrategyTemplateSeaDogDiscountSchemeModel
): StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeResponseBodyDataInstance {
    if (!model.symbols) {
        throw new Error('Expected symbols to be defined');
    }
    const symbols = model.symbols;
    delete model.symbols;
    const modelDataWithSymbolId: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeResponseBodyDataInstance =
        {
            ...model,
            symbolIds: symbols.map(symbol => symbol.id),
        };
    return modelDataWithSymbolId;
}

async function patchSingle(
    id: number,
    strategyTemplateSeaDogDiscountScheme: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePropsOptional,
    trx: Knex.Transaction
) {
    const symbolIds = strategyTemplateSeaDogDiscountScheme.symbolIds;
    const dataToInsert = patchRequestBodyDataInstanceToRequiredFields(
        strategyTemplateSeaDogDiscountScheme
    );
    // Check if there are any properties to update
    let model: StrategyTemplateSeaDogDiscountSchemeModel | undefined;
    if (Object.keys(dataToInsert).length > 0) {
        model = await StrategyTemplateSeaDogDiscountSchemeModel.query(
            trx
        ).patchAndFetchById(id, dataToInsert);
    } else {
        model = await StrategyTemplateSeaDogDiscountSchemeModel.query(trx)
            .findById(id)
            .withGraphFetched('symbols');
    }
    if (!model) {
        throw new Error(`Unable to update ${modelName} instance`);
    }
    if (undefined !== symbolIds) {
        // Unrelate all symbols
        await model.$relatedQuery<SymbolModel>('symbols', trx).unrelate();
        // Insert into junction table
        for (const symbolId of symbolIds ?? []) {
            await model
                .$relatedQuery<SymbolModel>('symbols', trx)
                .relate(symbolId);
        }
    }
    // Fetch model with symbols
    const modelWithSymbols =
        await StrategyTemplateSeaDogDiscountSchemeModel.query(trx)
            .findById(model.id)
            .withGraphFetched('symbols');
    if (!modelWithSymbols) {
        throw new Error(`Unable to find ${modelName} instance`);
    }
    return modelToResponseBodyDataInstance(modelWithSymbols);
}

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
            const queryResults = await query.withGraphFetched('symbols');
            const data = queryResults.map(dataItem => {
                return modelToResponseBodyDataInstance(dataItem);
            });
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
                await StrategyTemplateSeaDogDiscountSchemeModel.query()
                    .findById(params.id)
                    .withGraphFetched('symbols');
            if (!modelData) {
                return res.status(404).json({
                    status: 'error',
                    message: `${modelName} not found`,
                });
            }
            return res.json({
                status: 'success',
                message: `${modelName} instance retrieved successfully`,
                data: modelToResponseBodyDataInstance(modelData),
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
                        // Insert into junction table first
                        const symbolIds =
                            strategyTemplateSeaDogDiscountScheme.symbolIds;
                        const dataToInsert =
                            postRequestBodyDataInstanceToRequiredFields(
                                strategyTemplateSeaDogDiscountScheme
                            );
                        const model =
                            await StrategyTemplateSeaDogDiscountSchemeModel.query(
                                trx
                            )
                                .insert(dataToInsert)
                                .withGraphFetched('symbols');
                        if (!model) {
                            throw new Error(
                                `Unable to create ${modelName} instance`
                            );
                        }
                        // Insert into junction table
                        for (const symbolId of symbolIds) {
                            await model
                                .$relatedQuery<SymbolModel>('symbols', trx)
                                .relate(symbolId);
                        }
                        // fetch model with symbols
                        const modelWithSymbols =
                            await StrategyTemplateSeaDogDiscountSchemeModel.query(
                                trx
                            )
                                .findById(model.id)
                                .withGraphFetched('symbols');
                        if (!modelWithSymbols) {
                            throw new Error(
                                `Unable to find ${modelName} instance`
                            );
                        }
                        modelData.push(
                            modelToResponseBodyDataInstance(modelWithSymbols)
                        );
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
                        // Insert into junction table first
                        modelData.push(
                            await patchSingle(
                                strategyTemplateSeaDogDiscountScheme.id,
                                strategyTemplateSeaDogDiscountScheme,
                                trx
                            )
                        );
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
            let modelData:
                | StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchSingleResponseBodyData
                | undefined = undefined;
            await KNEXION.transaction(
                async trx => {
                    modelData = await patchSingle(
                        params.id,
                        parsedRequest,
                        trx
                    );
                },
                { isolationLevel: 'serializable' }
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
                        const modelDataInstance = await patchSingle(
                            strategyTemplateSeaDogDiscountScheme.id,
                            strategyTemplateSeaDogDiscountScheme,
                            trx
                        );
                        modelData.push(modelDataInstance);
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
            let modelData:
                | StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutSingleResponseBodyData
                | undefined = undefined;
            await KNEXION.transaction(
                async trx => {
                    modelData = await patchSingle(
                        params.id,
                        parsedRequest,
                        trx
                    );
                },
                { isolationLevel: 'serializable' }
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
                            )
                                .findById(id)
                                .withGraphFetched('symbols');
                        if (!model) {
                            throw new Errors.ModelNotFoundError(
                                `Unable to find ${modelName} with id ${id}`
                            );
                        }
                        modelData.push(modelToResponseBodyDataInstance(model));
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
                await StrategyTemplateSeaDogDiscountSchemeModel.query()
                    .findById(params.id)
                    .withGraphFetched('symbols');
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
                data: modelToResponseBodyDataInstance(modelData),
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
