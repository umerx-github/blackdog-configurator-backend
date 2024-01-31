import { Order as OrderModel } from '../db/models/Order.js';
import { Order as OrderTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import * as Errors from '../errors/index.js';
import { KNEXION } from '../index.js';
import { Symbol as SymbolModel } from '../db/models/Symbol.js';
import { Knex } from 'knex';
import { NextFunction } from 'express';

const router = Router();
const modelName = 'Order';

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body
function postRequestBodyDataInstanceToRequiredFields(
    requestBodyData: OrderTypes.OrderPostRequestBodyDataInstance
): OrderTypes.OrderRequiredFields {
    const modelData: OrderTypes.OrderRequiredFields = {
        symbolId: requestBodyData.symbolId,
        strategyId: requestBodyData.strategyId,
        alpacaOrderId: requestBodyData.alpacaOrderId,
    };
    return modelData;
}
function modelToResponseBodyDataInstance(
    model: OrderModel
): OrderTypes.OrderResponseBodyDataInstance {
    return model;
}

async function patchSingle(
    id: number,
    modelProps: OrderTypes.OrderPropsOptional,
    trx: Knex.Transaction
) {
    // Check if there are any properties to update
    let model = await OrderModel.query(trx).findById(id);
    // get the model's data before deleting it
    if (!model) {
        throw new Errors.ModelNotFoundError(
            `Unable to find ${modelName} with id ${id}`
        );
    }
    if (Object.keys(modelProps).length > 0) {
        model = await OrderModel.query(trx).patchAndFetchById(id, modelProps);
        if (!model) {
            throw new Error(`Unable to update ${modelName} instance`);
        }
    }
    return modelToResponseBodyDataInstance(model);
}

async function deleteSingle(
    id: number,
    trx: Knex.Transaction
): Promise<OrderTypes.OrderResponseBodyDataInstance> {
    let model = await OrderModel.query(trx).findById(id);
    // get the model's data before deleting it
    if (!model) {
        throw new Errors.ModelNotFoundError(
            `Unable to find ${modelName} with id ${id}`
        );
    }
    // const data = modelToResponseBodyDataInstance(model);
    // Unrelate all symbols without removing them from the model
    await OrderModel.query(trx).deleteById(id);
    return modelToResponseBodyDataInstance(model);
}

router.get(
    '/',
    async (
        req: Request<any, any, any, OrderTypes.OrderGetManyRequestQueryRaw>,
        res: Response<OrderTypes.OrderGetManyResponseBody>,
        next: NextFunction
    ) => {
        try {
            const query = OrderModel.query().orderBy('id', 'desc');
            const expectedOrderGetManyRequestQuery: OrderTypes.OrderGetManyRequestQuery =
                OrderTypes.OrderGetManyRequestQueryFromRaw(req.query);
            if (undefined !== expectedOrderGetManyRequestQuery.symbolId) {
                query.where(
                    'symbolId',
                    expectedOrderGetManyRequestQuery.symbolId
                );
            }
            if (undefined !== expectedOrderGetManyRequestQuery.strategyId) {
                query.where(
                    'strategyId',
                    expectedOrderGetManyRequestQuery.strategyId
                );
            }
            if (undefined !== expectedOrderGetManyRequestQuery.alpacaOrderId) {
                query.where(
                    'alpacaOrderId',
                    expectedOrderGetManyRequestQuery.alpacaOrderId
                );
            }
            if (undefined !== expectedOrderGetManyRequestQuery.ids) {
                query.whereIn('id', expectedOrderGetManyRequestQuery.ids);
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
        req: Request<OrderTypes.OrderGetSingleRequestParamsRaw>,
        res: Response<OrderTypes.OrderGetSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params = OrderTypes.OrderGetSingleRequestParamsFromRaw(
                req.params
            );
            const modelData = await OrderModel.query().findById(params.id);
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
        req: Request<any, any, OrderTypes.OrderPostManyRequestBody>,
        res: Response<OrderTypes.OrderPostManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: OrderTypes.OrderPostManyRequestBody =
                OrderTypes.OrderPostManyRequestBodyFromRaw(req.body);
            const modelData: OrderTypes.OrderPostManyResponseBodyData = [];
            await KNEXION.transaction(
                async trx => {
                    for (const Order of parsedRequest) {
                        // Insert into junction table first
                        const dataToInsert =
                            postRequestBodyDataInstanceToRequiredFields(Order);
                        const model = await OrderModel.query(trx).insert(
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
        req: Request<any, any, OrderTypes.OrderPatchManyRequestBody>,
        res: Response<OrderTypes.OrderPatchManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: OrderTypes.OrderPatchManyRequestBody =
                OrderTypes.OrderPatchManyRequestBodyFromRaw(req.body);
            const modelData: OrderTypes.OrderPatchManyResponseBodyData = [];
            await KNEXION.transaction(
                async trx => {
                    for (const Order of parsedRequest) {
                        // Insert into junction table first
                        modelData.push(await patchSingle(Order.id, Order, trx));
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
            OrderTypes.OrderPatchSingleRequestParamsRaw,
            any,
            OrderTypes.OrderPatchSingleRequestBody
        >,
        res: Response<OrderTypes.OrderPatchSingleResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const params = OrderTypes.OrderGetSingleRequestParamsFromRaw(
                req.params
            );
            const parsedRequest: OrderTypes.OrderPatchSingleRequestBody =
                OrderTypes.OrderPatchSingleRequestBodyFromRaw(req.body);
            let modelData:
                | OrderTypes.OrderPatchSingleResponseBodyData
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
        req: Request<any, any, OrderTypes.OrderPutManyRequestBody>,
        res: Response<OrderTypes.OrderPutManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: OrderTypes.OrderPutManyRequestBody =
                OrderTypes.OrderPutManyRequestBodyFromRaw(req.body);
            const modelData: OrderTypes.OrderPutManyResponseBodyData = [];
            await KNEXION.transaction(
                async trx => {
                    for (const Order of parsedRequest) {
                        const modelDataInstance = await patchSingle(
                            Order.id,
                            Order,
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
            OrderTypes.OrderPutSingleRequestParamsRaw,
            any,
            OrderTypes.OrderPutSingleRequestBody
        >,
        res: Response<OrderTypes.OrderPutSingleResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const params = OrderTypes.OrderGetSingleRequestParamsFromRaw(
                req.params
            );
            const parsedRequest: OrderTypes.OrderPutSingleRequestBody =
                OrderTypes.OrderPutSingleRequestBodyFromRaw(req.body);
            let modelData:
                | OrderTypes.OrderPutSingleResponseBodyData
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
        req: Request<any, any, any, OrderTypes.OrderDeleteManyRequestQueryRaw>,
        res: Response<OrderTypes.OrderDeleteManyResponseBody>,
        next: NextFunction
    ) => {
        try {
            const query = OrderModel.query();
            const expectedOrderDeleteManyRequestQuery: OrderTypes.OrderDeleteManyRequestQuery =
                OrderTypes.OrderDeleteManyRequestQueryFromRaw(req.query);
            const modelData: OrderTypes.OrderPutManyResponseBodyData = [];
            await KNEXION.transaction(
                async trx => {
                    for (const id of expectedOrderDeleteManyRequestQuery.ids) {
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
        req: Request<OrderTypes.OrderDeleteSingleRequestParamsRaw>,
        res: Response<OrderTypes.OrderDeleteSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params = OrderTypes.OrderDeleteSingleRequestParamsFromRaw(
                req.params
            );
            let modelData:
                | OrderTypes.OrderDeleteSingleResponseBodyData
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
