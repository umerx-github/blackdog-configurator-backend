import { Order as OrderModel } from '../db/models/Order.js';
import { Position as PositionModel } from '../db/models/Position.js';
import { Order as OrderTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import * as Errors from '../errors/index.js';
import { KNEXION } from '../index.js';
import { Knex } from 'knex';
import { NextFunction } from 'express';

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
        // Decrease position quantity
        await PositionModel.query(trx).patchAndFetchById(positions[0].id, {
            quantity: positions[0].quantity - modelProps.quantity,
        });
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
            await KNEXION.transaction(
                async trx => {
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
                        if (positions.length < 1) {
                            await PositionModel.query(trx).insert({
                                symbolId: model.symbolId,
                                strategyId: model.strategyId,
                                quantity: model.quantity,
                            });
                        } else {
                            await PositionModel.query(trx).patchAndFetchById(
                                positions[0].id,
                                {
                                    quantity:
                                        positions[0].quantity + model.quantity,
                                }
                            );
                        }
                    }
                    model = await OrderModel.query(trx).patchAndFetchById(
                        model.id,
                        {
                            status: OrderTypes.StatusSchema.Enum.closed,
                        }
                    );
                },
                { isolationLevel: 'serializable' }
            );
            if (!model) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${modelName} with id ${params.id}`
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

router.post(
    '/:id/cancel',
    async (
        req: Request<OrderTypes.OrderCancelPostSingleRequestParamsRaw>,
        res: Response<OrderTypes.OrderCancelPostSingleResponseBody>,
        next
    ) => {
        try {
            const params = OrderTypes.OrderCancelPostSingleRequestParamsFromRaw(
                req.params
            );
            let model: OrderModel | undefined;
            await KNEXION.transaction(
                async trx => {
                    model = await OrderModel.query(trx).findById(params.id);
                    if (!model) {
                        throw new Errors.ModelNotFoundError(
                            `Unable to find ${modelName} with id ${params.id}`
                        );
                    }
                    if (model.status !== 'open') {
                        throw new Error(
                            `Unable to cancel ${modelName} with id ${params.id} because it is no longer open`
                        );
                    }
                    if (!(model.side in OrderTypes.SideSchema.Enum)) {
                        throw new Error(
                            `Unable to cancel ${modelName} with id ${params.id} because it has an invalid side`
                        );
                    }
                    if (model.side === OrderTypes.SideSchema.Enum.sell) {
                        // Check if position exists
                        // If it does, increment quantity
                        // If it does not, create a new position
                        const positions = await PositionModel.query(trx)
                            .where({
                                symbolId: model.symbolId,
                                strategyId: model.strategyId,
                            })
                            .limit(1);
                        if (positions.length < 1) {
                            await PositionModel.query(trx).insert({
                                symbolId: model.symbolId,
                                strategyId: model.strategyId,
                                quantity: model.quantity,
                            });
                        } else {
                            await PositionModel.query(trx).patchAndFetchById(
                                positions[0].id,
                                {
                                    quantity:
                                        positions[0].quantity + model.quantity,
                                }
                            );
                        }
                    }
                    model = await OrderModel.query(trx).patchAndFetchById(
                        model.id,
                        {
                            status: OrderTypes.StatusSchema.Enum.closed,
                        }
                    );
                },
                { isolationLevel: 'serializable' }
            );
            if (!model) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${modelName} with id ${params.id}`
                );
            }
            return res.json({
                status: 'success',
                message: `${modelName} instance canceled successfully`,
                data: model,
            });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
