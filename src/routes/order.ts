import { Order as OrderModel } from '../db/models/Order.js';
import { Position as PositionModel } from '../db/models/Position.js';
import {
    Order as OrderTypes,
    Position as PositionTypes,
    StrategyLog as StrategyLogTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import * as Errors from '../errors/index.js';
import { KNEXION } from '../index.js';
import { Knex } from 'knex';
import { NextFunction } from 'express';
import { Strategy as StrategyModel } from '../db/models/Strategy.js';
import {
    bankersRounding,
    bankersRoundingTruncateToInt,
} from '../utils/index.js';
import { calculateExistingPositionNewAveragePriceInCentsForFilledBuyOrder } from './position.js';
import { StrategyLog as StrategyLogModel } from '../db/models/StrategyLog.js';
import { Symbol as SymbolModel } from '../db/models/Symbol.js';
import { validateResponse } from '..//utils/response.js';

const router = Router();

async function postSingle(
    modelProps: OrderTypes.OrderProps,
    trx: Knex.Transaction
) {
    // Validate that a symbol with symbolId exists
    const symbolModel = await SymbolModel.query(trx).findById(
        modelProps.symbolId
    );
    if (!symbolModel) {
        throw new Errors.ModelNotFoundError(
            `Unable to find ${SymbolModel.prettyName} with id ${modelProps.symbolId}`
        );
    }
    // Check if this amount can be subtracted from related strategy's cashInCents
    const strategyModel = await StrategyModel.query(trx).findById(
        modelProps.strategyId
    );
    if (!strategyModel) {
        throw new Errors.ModelNotFoundError(
            `Unable to find ${StrategyModel.prettyName} with id ${modelProps.strategyId}`
        );
    }
    // If buy order update strategy's cashInCents
    if (modelProps.side === OrderTypes.SideSchema.Enum.buy) {
        const orderCashInCents = bankersRoundingTruncateToInt(
            modelProps.quantity * modelProps.averagePriceInCents
        );
        if (strategyModel.cashInCents < orderCashInCents) {
            throw new Error(
                `Unable to create ${OrderModel.prettyName} instance because it would result in a negative cashInCents`
            );
        }
        // Decrease strategy's cashInCents
        await StrategyModel.query(trx).patchAndFetchById(strategyModel.id, {
            cashInCents: strategyModel.cashInCents - orderCashInCents,
        });
    }
    // If sell order, check whether there are any other open sell orders for this symbol and whether another sell order would drop position quantity to negative quantity
    if (modelProps.side === OrderTypes.SideSchema.Enum.sell) {
        const openSellOrders = await OrderModel.query(trx).where({
            symbolId: modelProps.symbolId,
            strategyId: modelProps.strategyId,
            side: OrderTypes.SideSchema.Enum.sell,
            status: OrderTypes.StatusSchema.Enum.open,
        });
        const openSellOrdersQuantity = openSellOrders.reduce(
            (acc, order) => acc + order.quantity,
            0
        );
        // Get the position for this symbol if it exists
        const positions = await PositionModel.query(trx).where({
            symbolId: modelProps.symbolId,
            strategyId: modelProps.strategyId,
        });
        console.log({ positions });
        if (positions.length < 1) {
            throw new Error(
                `Cannot create ${modelProps.side} ${OrderModel.prettyName} for ${symbolModel.name} because there is no position for this symbol`
            );
        }
        const position = positions[0];
        console.log({ position });
        const positionQuantity = position.quantity;
        if (
            positionQuantity - (openSellOrdersQuantity + modelProps.quantity) <
            0
        ) {
            throw new Error(
                `Cannot create ${modelProps.side} ${OrderModel.prettyName} for ${symbolModel.name} because it would result in a negative position quantity`
            );
        }
    }
    // insert into order table
    const model = await OrderModel.query(trx).insert({
        ...modelProps,
        status: OrderTypes.StatusSchema.Enum.open,
    });
    if (!model) {
        throw new Error(`Unable to create ${OrderModel.prettyName} instance`);
    }
    const strategyLogModelProps: StrategyLogTypes.StrategyLogModelProps = {
        strategyId: strategyModel.id,
        level: 'info',
        message: `Placed ${modelProps.side} order for ${
            modelProps.quantity
        } shares of ${SymbolModel.prettyName} ${symbolModel.name} with id ${
            symbolModel.id
        } at an average price of $${bankersRounding(
            modelProps.averagePriceInCents / 100
        ).toFixed(2)} each`,
        data: { rawData: modelProps },
        timestamp: Date.now(),
    };

    await StrategyLogModel.query(trx).insert(strategyLogModelProps);
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
            if (undefined !== expectedOrderGetManyRequestQuery.status) {
                query.where('status', expectedOrderGetManyRequestQuery.status);
            }
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
            return res.json(validateResponse(() => OrderTypes.OrderGetManyResponseBodyFromRaw({
                status: 'success',
                message: `${OrderModel.prettyName} instances retrieved successfully`,
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
                    `Unable to find ${OrderModel.prettyName} with id ${params.id}`
                );
            }
            return res.json(validateResponse(() => OrderTypes.OrderGetSingleResponseBodyFromRaw({
                status: 'success',
                message: `${OrderModel.prettyName} instance retrieved successfully`,
                data: modelData,
            })));
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
                                `Unable to create ${OrderModel.prettyName} instance`
                            );
                        }
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json(validateResponse(() => OrderTypes.OrderPostManyResponseBodyFromRaw({
                status: 'success',
                message: `${OrderModel.prettyName} instances created successfully`,
                data: modelData,
            })));
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
                            `Unable to find ${OrderModel.prettyName} with id ${params.id}`
                        );
                    }
                    if (model.status !== 'open') {
                        throw new Error(
                            `Unable to fill ${OrderModel.prettyName} with id ${params.id} because it is no longer open`
                        );
                    }
                    if (!(model.side in OrderTypes.SideSchema.Enum)) {
                        throw new Error(
                            `Unable to fill ${OrderModel.prettyName} with id ${params.id} because it has an invalid side`
                        );
                    }
                    // Get the related Symbol
                    const symbolModel = await SymbolModel.query(trx).findById(
                        model.symbolId
                    );
                    if (!symbolModel) {
                        throw new Errors.ModelNotFoundError(
                            `Unable to find ${SymbolModel.prettyName} with id ${model.symbolId}`
                        );
                    }
                    // If buy order, update position quantity
                    if (model.side === OrderTypes.SideSchema.Enum.buy) {
                        // Check if position exists
                        // If it does, increment quantity
                        // If it does not, create a new position
                        const positions = await PositionModel.query(trx)
                            .where({
                                symbolId: symbolModel.id,
                                strategyId: model.strategyId,
                            })
                            .limit(1);
                        if (positions.length < 1) {
                            const positionProps: PositionTypes.PositionRequiredFields = {
                                symbolId: symbolModel.id,
                                strategyId: model.strategyId,
                                quantity: model.quantity,
                                averagePriceInCents: model.averagePriceInCents,
                            }
                            await PositionModel.query(trx).insert(positionProps);
                        } else {
                            const position = positions[0];
                            // Update position quantity and averagePriceInCents, because placing a buy order means the averagePriceInCents will change depending on how the order is filled.
                            await PositionModel.query(trx).patchAndFetchById(
                                position.id,
                                {
                                    quantity:
                                        position.quantity + model.quantity,
                                    averagePriceInCents:
                                        calculateExistingPositionNewAveragePriceInCentsForFilledBuyOrder(
                                            position.quantity,
                                            position.averagePriceInCents,
                                            model.quantity,
                                            model.averagePriceInCents
                                        ),
                                }
                            );
                        }
                    }
                    // If sell order
                    if (model.side === OrderTypes.SideSchema.Enum.sell) {
                        // Check if position exists
                        const positions = await PositionModel.query(trx)
                            .where({
                                symbolId: model.symbolId,
                                strategyId: model.strategyId,
                            })
                            .limit(1);
                        // If it does not, throw an error
                        if (positions.length < 1) {
                            throw new Error(
                                `Cannot fill ${model.side} ${OrderModel.prettyName} for ${symbolModel.name} because there is no position for this symbol`
                            );
                        }
                        // If it does, make sure the position quantity is greater than or equal to the order quantity
                        const position = positions[0];
                        if (position.quantity < model.quantity) {
                            throw new Error(
                                `Cannot fill ${model.side} ${OrderModel.prettyName} for ${symbolModel.name} because the position quantity is less than the order quantity`
                            );
                        }
                        // Update position quantity
                        // Check whether the position quantity will be zero after this fill
                        if (position.quantity - model.quantity === 0) {
                            // If it will be zero, delete the position
                            await PositionModel.query(trx).deleteById(position.id);
                        } else {
                            // If it will not be zero, decrement the quantity
                            await PositionModel.query(trx).patchAndFetchById(
                                position.id,
                                {
                                    quantity: position.quantity - model.quantity,
                                    // Do not update averagePriceInCents because placing a sell order does not change it, filling a sell order does not change it, and neither does cancelling a sell order.
                                }
                            );
                        }
                        // Update strategy's cashInCents
                        // Check if related strategy exists
                        const strategy = await StrategyModel.query(
                            trx
                        ).findById(model.strategyId);
                        if (!strategy) {
                            throw new Errors.ModelNotFoundError(
                                `Unable to find ${StrategyModel.prettyName} with id ${model.strategyId}`
                            );
                        }
                        const orderCashInCents = bankersRoundingTruncateToInt(
                            model.quantity * model.averagePriceInCents
                        );
                        // Increase strategy's cashInCents
                        await StrategyModel.query(trx).patchAndFetchById(
                            strategy.id,
                            {
                                cashInCents:
                                    strategy.cashInCents + orderCashInCents,
                            }
                        );
                    }
                    // Close the order
                    model = await OrderModel.query(trx).patchAndFetchById(
                        model.id,
                        {
                            status: OrderTypes.StatusSchema.Enum.closed,
                        }
                    );
                    const strategyLogModelProps: StrategyLogTypes.StrategyLogModelProps =
                        {
                            strategyId: model.strategyId,
                            level: 'info',
                            message: `Filled ${model.side} ${
                                OrderModel.prettyName
                            } for ${model.quantity} shares of ${
                                SymbolModel.prettyName
                            } ${symbolModel.name} with id ${
                                symbolModel.id
                            } at an average price of $${bankersRounding(
                                model.averagePriceInCents / 100
                            ).toFixed(2)} each`,
                            data: { rawData: model },
                            timestamp: Date.now(),
                        };
                    await StrategyLogModel.query(trx).insert(
                        strategyLogModelProps
                    );
                },
                { isolationLevel: 'serializable' }
            );
            if (!model) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${OrderModel.prettyName} with id ${params.id}`
                );
            }
            return res.json(validateResponse(() => OrderTypes.OrderFillPostSingleResponseBodyFromRaw({
                status: 'success',
                message: `${OrderModel.prettyName} instance filled successfully`,
                data: model,
            })));
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
                            `Unable to find ${OrderModel.prettyName} with id ${params.id}`
                        );
                    }
                    if (model.status !== 'open') {
                        throw new Error(
                            `Unable to cancel ${OrderModel.prettyName} with id ${params.id} because it is no longer open`
                        );
                    }
                    if (!(model.side in OrderTypes.SideSchema.Enum)) {
                        throw new Error(
                            `Unable to cancel ${OrderModel.prettyName} with id ${params.id} because it has an invalid side`
                        );
                    }
                    // If buy order, update strategy's cashInCents
                    if (model.side === OrderTypes.SideSchema.Enum.buy) {
                        // Check if this amount can be added to related strategy's cashInCents
                        const strategy = await StrategyModel.query(
                            trx
                        ).findById(model.strategyId);
                        if (!strategy) {
                            throw new Errors.ModelNotFoundError(
                                `Unable to find Strategy with id ${model.strategyId}`
                            );
                        }
                        const orderCashInCents = bankersRoundingTruncateToInt(
                            model.quantity * model.averagePriceInCents
                        );
                        // Increase strategy's cashInCents
                        await StrategyModel.query(trx).patchAndFetchById(
                            strategy.id,
                            {
                                cashInCents:
                                    strategy.cashInCents + orderCashInCents,
                            }
                        );
                    }
                    // If sell order, do nothing. Cancelling a sell order means our positions and holdings will not change. This is because placing a sell order doesn't alter anything about the strategy or positions themselves.
                    model = await OrderModel.query(trx).patchAndFetchById(
                        model.id,
                        {
                            status: OrderTypes.StatusSchema.Enum.closed,
                        }
                    );
                    const strategyLogModelProps: StrategyLogTypes.StrategyLogModelProps =
                        {
                            strategyId: model.strategyId,
                            level: 'info',
                            message: `Canceled ${model.side} ${
                                OrderModel.prettyName
                            } for ${model.quantity} shares of ${
                                SymbolModel.prettyName
                            } at an average price of $${bankersRounding(
                                model.averagePriceInCents / 100
                            ).toFixed(2)} each`,
                            data: { rawData: model },
                            timestamp: Date.now(),
                        };
                    await StrategyLogModel.query(trx).insert(
                        strategyLogModelProps
                    );
                },
                { isolationLevel: 'serializable' }
            );
            if (!model) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${OrderModel.prettyName} with id ${params.id}`
                );
            }
            return res.json(validateResponse(() => OrderTypes.OrderCancelPostSingleResponseBodyFromRaw({
                status: 'success',
                message: `${OrderModel.prettyName} instance canceled successfully`,
                data: model,
            })));
        } catch (err) {
            next(err);
        }
    }
);

export default router;
