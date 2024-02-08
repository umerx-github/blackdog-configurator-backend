import { Order as OrderModel } from '../db/models/Order.js';
import { Position as PositionModel } from '../db/models/Position.js';
import { Order as OrderTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import * as Errors from '../errors/index.js';
import { KNEXION } from '../index.js';
import { Knex } from 'knex';
import { NextFunction } from 'express';
import { unknown } from 'zod';

const router = Router();
const modelName = 'Order';

async function postSingle(
    modelProps: OrderTypes.OrderProps,
    trx: Knex.Transaction
) {
    // If sell order, check if position exists and is greater than or equal to quantity
    if (modelProps.side === OrderTypes.SideSchema.Enum.sell) {
        const positions = await PositionModel.query(trx).where({
            symbolId: modelProps.symbolId,
            strategyId: modelProps.strategyId,
        });
        if (positions.length === 0) {
            throw new Errors.ModelNotFoundError(
                `Unable to find Position with symbolId ${modelProps.symbolId} and strategyId ${modelProps.strategyId}`
            );
        }
        if (positions[0].quantity < modelProps.quantity) {
            throw new Error(
                `Unable to create ${modelName} instance because it would result in a negative position quantity`
            );
        }
    }
    // insert into order table
    const model = await OrderModel.query(trx).insert({
        ...modelProps,
        status: OrderTypes.StatusSchema.Enum.open,
    });
    if (!model) {
        throw new Error(`Unable to create ${modelName} instance`);
    }
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
    return model;
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
    // const data = model;
    // Unrelate all symbols without removing them from the model
    await OrderModel.query(trx).deleteById(id);
    return model;
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
                return dataItem;
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
                        const dataToInsert = Order;
                        const model = await postSingle(dataToInsert, trx);
                        if (!model) {
                            throw new Error(
                                `Unable to create ${modelName} instance`
                            );
                        }
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

router.post(
    '/:id/fill',
    async (
        req: Request<OrderTypes.OrderFillPostSingleRequestParamsRaw>,
        res: Response<OrderTypes.OrderFillPostSingleResponseBody>,
        next
    ) => {
        try {
            const params = OrderTypes.OrderFillPostSingleRequestParamsFromRaw(
                req.params
            );
            let model: OrderModel | undefined;
            let position: PositionModel | undefined;
            await KNEXION.transaction(async trx => {
                model = await OrderModel.query(trx).findById(params.id);
                if (!model) {
                    throw new Errors.ModelNotFoundError(
                        `Unable to find ${modelName} with id ${params.id}`
                    );
                }
                if (model.status !== 'open') {
                    throw new Error(
                        `Unable to fill ${modelName} with id ${params.id} because it is no longer open`
                    );
                }
                if (!(model.side in OrderTypes.SideSchema.Enum)) {
                    throw new Error(
                        `Unable to fill ${modelName} with id ${params.id} because it has an invalid side`
                    );
                }
                if (model.side === OrderTypes.SideSchema.Enum.buy) {
                    // Check if position exists
                    // If it does, increment quantity
                    // If it does not, create a new position
                    const positions = await PositionModel.query(trx)
                        .where({
                            symbolId: model.symbolId,
                            strategyId: model.strategyId,
                        })
                        .limit(1);
                    if (positions.length === 0) {
                        position = await PositionModel.query(trx).insert({
                            symbolId: model.symbolId,
                            strategyId: model.strategyId,
                            quantity: model.quantity,
                        });
                    }
                    if (positions.length > 0) {
                        position = positions[0];
                        position = await PositionModel.query(
                            trx
                        ).patchAndFetchById(position.id, {
                            quantity: position.quantity + model.quantity,
                        });
                    }
                }
                if (model.side === OrderTypes.SideSchema.Enum.sell) {
                    // Check if position exists
                    // If it does, decrement quantity
                    // If quantity is 0, delete the position
                    // If quantity less than 0, throw an error
                    // If it does not, throw an error
                    const positions = await PositionModel.query(trx)
                        .where({
                            symbolId: model.symbolId,
                            strategyId: model.strategyId,
                        })
                        .limit(1);
                    if (positions.length === 0) {
                        throw new Errors.ModelNotFoundError(
                            `Unable to find Position with symbolId ${model.symbolId} and strategyId ${model.strategyId}`
                        );
                    }
                    position = positions[0];
                    position = await PositionModel.query(trx).patchAndFetchById(
                        position.id,
                        {
                            quantity: position.quantity - model.quantity,
                        }
                    );
                    if (position.quantity < 0) {
                        throw new Error(
                            `Unable to fill ${modelName} with id ${params.id} because it would result in a negative position quantity`
                        );
                    }
                    if (position.quantity === 0) {
                        await PositionModel.query(trx).deleteById(position.id);
                    }
                }
                model = await OrderModel.query(trx).patchAndFetchById(
                    model.id,
                    {
                        status: OrderTypes.StatusSchema.Enum.closed,
                    }
                );
            });
            if (!model) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${modelName} with id ${params.id}`
                );
            }
            if (!position) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find Position with symbolId ${model.symbolId} and strategyId ${model.strategyId}`
                );
            }
            return res.json({
                status: 'success',
                message: `${modelName} instance filled successfully`,
                data: model,
            });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
