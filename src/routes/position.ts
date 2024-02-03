import { Position as PositionModel } from '../db/models/Position.js';
import { Position as PositionTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import * as Errors from '../errors/index.js';
import { KNEXION } from '../index.js';
import { Symbol as SymbolModel } from '../db/models/Symbol.js';
import { Knex } from 'knex';
import { NextFunction } from 'express';

const router = Router();
const modelName = 'Position';

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body
function postRequestBodyDataInstanceToRequiredFields(
    requestBodyData: PositionTypes.PositionPostRequestBodyDataInstance
): PositionTypes.PositionRequiredFields {
    const modelData: PositionTypes.PositionRequiredFields = {
        symbolId: requestBodyData.symbolId,
        strategyId: requestBodyData.strategyId,
        orderId: requestBodyData.orderId,
    };
    return modelData;
}
function modelToResponseBodyDataInstance(
    model: PositionModel
): PositionTypes.PositionResponseBodyDataInstance {
    return model;
}

async function patchSingle(
    id: number,
    modelProps: PositionTypes.PositionPropsOptional,
    trx: Knex.Transaction
) {
    // Check if there are any properties to update
    let model = await PositionModel.query(trx).findById(id);
    // get the model's data before deleting it
    if (!model) {
        throw new Errors.ModelNotFoundError(
            `Unable to find ${modelName} with id ${id}`
        );
    }
    if (Object.keys(modelProps).length > 0) {
        model = await PositionModel.query(trx).patchAndFetchById(
            id,
            modelProps
        );
        if (!model) {
            throw new Error(`Unable to update ${modelName} instance`);
        }
    }
    return modelToResponseBodyDataInstance(model);
}

async function deleteSingle(
    id: number,
    trx: Knex.Transaction
): Promise<PositionTypes.PositionResponseBodyDataInstance> {
    let model = await PositionModel.query(trx).findById(id);
    // get the model's data before deleting it
    if (!model) {
        throw new Errors.ModelNotFoundError(
            `Unable to find ${modelName} with id ${id}`
        );
    }
    // const data = modelToResponseBodyDataInstance(model);
    // Unrelate all symbols without removing them from the model
    await PositionModel.query(trx).deleteById(id);
    return modelToResponseBodyDataInstance(model);
}

router.get(
    '/',
    async (
        req: Request<
            any,
            any,
            any,
            PositionTypes.PositionGetManyRequestQueryRaw
        >,
        res: Response<PositionTypes.PositionGetManyResponseBody>,
        next: NextFunction
    ) => {
        try {
            const query = PositionModel.query().orderBy('id', 'desc');
            const expectedPositionGetManyRequestQuery: PositionTypes.PositionGetManyRequestQuery =
                PositionTypes.PositionGetManyRequestQueryFromRaw(req.query);
            if (undefined !== expectedPositionGetManyRequestQuery.symbolId) {
                query.where(
                    'symbolId',
                    expectedPositionGetManyRequestQuery.symbolId
                );
            }
            if (undefined !== expectedPositionGetManyRequestQuery.strategyId) {
                query.where(
                    'strategyId',
                    expectedPositionGetManyRequestQuery.strategyId
                );
            }
            if (undefined !== expectedPositionGetManyRequestQuery.orderId) {
                query.where(
                    'orderId',
                    expectedPositionGetManyRequestQuery.orderId
                );
            }
            if (undefined !== expectedPositionGetManyRequestQuery.ids) {
                query.whereIn('id', expectedPositionGetManyRequestQuery.ids);
            }
            const queryResults = await query;
            const data = queryResults.map(dataItem => {
                return modelToResponseBodyDataInstance(dataItem);
            });
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
        req: Request<PositionTypes.PositionGetSingleRequestParamsRaw>,
        res: Response<PositionTypes.PositionGetSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params = PositionTypes.PositionGetSingleRequestParamsFromRaw(
                req.params
            );
            const modelData = await PositionModel.query().findById(params.id);
            if (!modelData) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${modelName} with id ${params.id}`
                );
            }
            return res.json({
                status: 'success',
                message: `${modelName} instance retrieved successfully`,
                data: modelToResponseBodyDataInstance(modelData),
            });
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    '/',
    async (
        req: Request<any, any, PositionTypes.PositionPostManyRequestBody>,
        res: Response<PositionTypes.PositionPostManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: PositionTypes.PositionPostManyRequestBody =
                PositionTypes.PositionPostManyRequestBodyFromRaw(req.body);
            const modelData: PositionTypes.PositionPostManyResponseBodyData =
                [];
            await KNEXION.transaction(
                async trx => {
                    for (const Position of parsedRequest) {
                        // Insert into junction table first
                        const dataToInsert =
                            postRequestBodyDataInstanceToRequiredFields(
                                Position
                            );
                        const model = await PositionModel.query(trx).insert(
                            dataToInsert
                        );
                        if (!model) {
                            throw new Error(
                                `Unable to create ${modelName} instance`
                            );
                        }
                        modelData.push(modelToResponseBodyDataInstance(model));
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
        req: Request<any, any, PositionTypes.PositionPatchManyRequestBody>,
        res: Response<PositionTypes.PositionPatchManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: PositionTypes.PositionPatchManyRequestBody =
                PositionTypes.PositionPatchManyRequestBodyFromRaw(req.body);
            const modelData: PositionTypes.PositionPatchManyResponseBodyData =
                [];
            await KNEXION.transaction(
                async trx => {
                    for (const Position of parsedRequest) {
                        // Insert into junction table first
                        modelData.push(
                            await patchSingle(Position.id, Position, trx)
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
        } catch (err) {
            next(err);
        }
    }
);

router.patch(
    '/:id',
    async (
        req: Request<
            PositionTypes.PositionPatchSingleRequestParamsRaw,
            any,
            PositionTypes.PositionPatchSingleRequestBody
        >,
        res: Response<PositionTypes.PositionPatchSingleResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const params = PositionTypes.PositionGetSingleRequestParamsFromRaw(
                req.params
            );
            const parsedRequest: PositionTypes.PositionPatchSingleRequestBody =
                PositionTypes.PositionPatchSingleRequestBodyFromRaw(req.body);
            let modelData:
                | PositionTypes.PositionPatchSingleResponseBodyData
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
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${modelName} with id ${params.id}`
                );
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
        req: Request<any, any, PositionTypes.PositionPutManyRequestBody>,
        res: Response<PositionTypes.PositionPutManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: PositionTypes.PositionPutManyRequestBody =
                PositionTypes.PositionPutManyRequestBodyFromRaw(req.body);
            const modelData: PositionTypes.PositionPutManyResponseBodyData = [];
            await KNEXION.transaction(
                async trx => {
                    for (const Position of parsedRequest) {
                        const modelDataInstance = await patchSingle(
                            Position.id,
                            Position,
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
        } catch (err) {
            next(err);
        }
    }
);

router.put(
    '/:id',
    async (
        req: Request<
            PositionTypes.PositionPutSingleRequestParamsRaw,
            any,
            PositionTypes.PositionPutSingleRequestBody
        >,
        res: Response<PositionTypes.PositionPutSingleResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const params = PositionTypes.PositionGetSingleRequestParamsFromRaw(
                req.params
            );
            const parsedRequest: PositionTypes.PositionPutSingleRequestBody =
                PositionTypes.PositionPutSingleRequestBodyFromRaw(req.body);
            let modelData:
                | PositionTypes.PositionPutSingleResponseBodyData
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
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${modelName} with id ${params.id}`
                );
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
            PositionTypes.PositionDeleteManyRequestQueryRaw
        >,
        res: Response<PositionTypes.PositionDeleteManyResponseBody>,
        next: NextFunction
    ) => {
        try {
            const query = PositionModel.query();
            const expectedPositionDeleteManyRequestQuery: PositionTypes.PositionDeleteManyRequestQuery =
                PositionTypes.PositionDeleteManyRequestQueryFromRaw(req.query);
            const modelData: PositionTypes.PositionPutManyResponseBodyData = [];
            await KNEXION.transaction(
                async trx => {
                    for (const id of expectedPositionDeleteManyRequestQuery.ids) {
                        const modelDataInstance = await deleteSingle(id, trx);
                        modelData.push(modelDataInstance);
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
        req: Request<PositionTypes.PositionDeleteSingleRequestParamsRaw>,
        res: Response<PositionTypes.PositionDeleteSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params =
                PositionTypes.PositionDeleteSingleRequestParamsFromRaw(
                    req.params
                );
            let modelData:
                | PositionTypes.PositionDeleteSingleResponseBodyData
                | undefined;
            await KNEXION.transaction(
                async trx => {
                    modelData = await deleteSingle(params.id, trx);
                },
                { isolationLevel: 'serializable' }
            );
            if (undefined === modelData) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${modelName} with id ${params.id}`
                );
            }
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
