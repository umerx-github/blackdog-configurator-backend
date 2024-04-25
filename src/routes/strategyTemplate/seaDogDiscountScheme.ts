import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeModel } from '../../db/models/StrategyTemplateSeaDogDiscountScheme.js';
import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response, ErrorRequestHandler } from 'express';
import { KNEXION } from '../../index.js';
import { Symbol as SymbolModel } from '../../db/models/Symbol.js';
import { Knex } from 'knex';
import { NextFunction } from 'express';
import { MissingRelationError, ModelNotFoundError, UnableToCreateInstanceError, UnableToUpdateInstanceError } from '../../errors/index.js';
import { validateResponse } from '../../utils/response.js';

const router = Router();

function modelToResponseBodyDataInstance(
    model: StrategyTemplateSeaDogDiscountSchemeModel
): StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeResponseBodyDataInstance {
    if (!model.symbols) {
        throw new MissingRelationError('Expected symbols to be defined');
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

async function deactivateAllOtherDiscountSchemes(
    id: number,
    strategyId: number,
    trx: Knex.Transaction
): Promise<void> {
    await StrategyTemplateSeaDogDiscountSchemeModel.query(trx)
        .where('id', '!=', id)
        .andWhere('strategyId', strategyId)
        .patch({ status: 'inactive' });
}

async function patchSingle(
    id: number,
    strategyTemplateSeaDogDiscountScheme: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePropsOptional,
    trx: Knex.Transaction
) {
    const { symbolIds, ...dataToInsert } = strategyTemplateSeaDogDiscountScheme;
    // Check if there are any properties to update
    let model: StrategyTemplateSeaDogDiscountSchemeModel | undefined;
    if (Object.keys(dataToInsert).length > 0) {
        model = await StrategyTemplateSeaDogDiscountSchemeModel.query(
            trx
        ).findById(id);
        if (!model) {
            throw new ModelNotFoundError(
                `Unable to find ${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} with id ${id}`
            );
        }
        if (model.status === 'inactive' && dataToInsert.status === 'active') {
            deactivateAllOtherDiscountSchemes(model.id, model.strategyId, trx);
        }
        model = await model.$query(trx).patchAndFetchById(id, dataToInsert);
    } else {
        model = await StrategyTemplateSeaDogDiscountSchemeModel.query(trx)
            .findById(id)
            .withGraphFetched('symbols');
    }
    if (!model) {
        throw new UnableToUpdateInstanceError(
            `Unable to update ${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} instance`
        );
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
        throw new ModelNotFoundError(
            `Unable to find ${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} instance`
        );
    }
    return modelToResponseBodyDataInstance(modelWithSymbols);
}

async function deleteSingle(
    id: number,
    trx: Knex.Transaction
): Promise<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeResponseBodyDataInstance> {
    let model = await StrategyTemplateSeaDogDiscountSchemeModel.query(trx)
        .findById(id)
        .withGraphFetched('symbols');
    // get the model's data before deleting it
    if (!model) {
        throw new ModelNotFoundError(
            `Unable to find ${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} with id ${id}`
        );
    }
    // const data = modelToResponseBodyDataInstance(model);
    // Unrelate all symbols without removing them from the model
    await model.$relatedQuery<SymbolModel>('symbols', trx).unrelate();
    await StrategyTemplateSeaDogDiscountSchemeModel.query(trx).deleteById(id);
    return modelToResponseBodyDataInstance(model);
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
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetManyResponseBody>,
        next: NextFunction
    ) => {
        try {
            const query =
                StrategyTemplateSeaDogDiscountSchemeModel.query().orderBy(
                    'id',
                    'desc'
                );
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
            return res.json(validateResponse(() => StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetManyResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} instances retrieved successfully`,
                data: data,
            })));
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    '/:id',
    async (
        req: Request<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetSingleRequestParamsRaw>,
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetSingleResponseBody>,
        next: NextFunction
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
                throw new ModelNotFoundError(
                    `${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} not found`
                );
            }
            return res.json(validateResponse(() => StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeGetSingleResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} instance retrieved successfully`,
                data: modelToResponseBodyDataInstance(modelData),
            })));
        } catch (err) {
            next(err);
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
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePostManyResponseBody>,
        next: NextFunction
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
                        // const symbolIds =
                        //     strategyTemplateSeaDogDiscountScheme.symbolIds;
                        const { symbolIds, ...dataToInsert } =
                            strategyTemplateSeaDogDiscountScheme;
                        const model =
                            await StrategyTemplateSeaDogDiscountSchemeModel.query(
                                trx
                            )
                                .insert(dataToInsert)
                                .withGraphFetched('symbols');
                        if (!model) {
                            throw new UnableToCreateInstanceError(
                                `Unable to create ${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} instance`
                            );
                        }
                        if (model.status === 'active') {
                            deactivateAllOtherDiscountSchemes(
                                model.id,
                                model.strategyId,
                                trx
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
                            throw new ModelNotFoundError(
                                `Unable to find ${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} instance`
                            );
                        }
                        modelData.push(
                            modelToResponseBodyDataInstance(modelWithSymbols)
                        );
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json(validateResponse(() => StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePostManyResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} instances created successfully`,
                data: modelData,
            })));
        } catch (err) {
            next(err);
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
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchManyResponseBody>,
        next: NextFunction
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
            return res.json(validateResponse(() => StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchManyResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} instances updated successfully`,
                data: modelData,
            })));
        } catch (err) {
            next(err);
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
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchSingleResponseBody>,
        next: NextFunction
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
                throw new ModelNotFoundError(
                    `${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} not found`
                );
            }
            return res.json(validateResponse(() => StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePatchSingleResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} instance updated successfully`,
                data: modelData,
            })));
        } catch (err) {
            next(err);
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
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutManyResponseBody>,
        next: NextFunction
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
            return res.json(validateResponse(() => StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutManyResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} instances updated successfully`,
                data: modelData,
            })));
        } catch (err) {
            next(err);
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
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutSingleResponseBody>,
        next: NextFunction
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
                throw new ModelNotFoundError(
                    `${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} not found`
                );
            }
            return res.json(validateResponse(() => StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutSingleResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} instance updated successfully`,
                data: modelData,
            })));
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
            StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteManyRequestQueryRaw
        >,
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteManyResponseBody>,
        next: NextFunction
    ) => {
        try {
            const query = StrategyTemplateSeaDogDiscountSchemeModel.query();
            const expectedStrategyTemplateSeaDogDiscountSchemeDeleteManyRequestQuery: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteManyRequestQuery =
                StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteManyRequestQueryFromRaw(
                    req.query
                );
            const modelData: StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemePutManyResponseBodyData =
                [];
            await KNEXION.transaction(
                async trx => {
                    for (const id of expectedStrategyTemplateSeaDogDiscountSchemeDeleteManyRequestQuery.ids) {
                        const modelDataInstance = await deleteSingle(id, trx);
                        modelData.push(modelDataInstance);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json(validateResponse(() => StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteManyResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} instances deleted successfully`,
                data: modelData,
            })));
        } catch (err) {
            next(err);
        }
    }
);

router.delete(
    '/:id',
    async (
        req: Request<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteSingleRequestParamsRaw>,
        res: Response<StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params =
                StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteSingleRequestParamsFromRaw(
                    req.params
                );
            let modelData:
                | StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteSingleResponseBodyData
                | undefined;
            await KNEXION.transaction(
                async trx => {
                    modelData = await deleteSingle(params.id, trx);
                },
                { isolationLevel: 'serializable' }
            );
            if (undefined === modelData) {
                throw new ModelNotFoundError(
                   `${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} not found`,
                );
            }
            return res.json(validateResponse(() => StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeDeleteSingleResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyTemplateSeaDogDiscountSchemeModel.prettyName} instance deleted successfully`,
                data: modelData,
            })));
        } catch (err) {
            next(err);
        }
    }
);

export default router;
