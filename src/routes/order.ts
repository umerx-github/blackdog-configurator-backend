import { Order as OrderModel } from '../db/models/Order.js';
import { Position as PositionModel } from '../db/models/Position.js';
import { Order as OrderTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
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

const router = Router();

async function postSingle(
    modelProps: OrderTypes.OrderProps,
    trx: Knex.Transaction
) {
    // Validate that a symbol with symbolId exists
    const symbol = await SymbolModel.query(trx).findById(modelProps.symbolId);
    if (!symbol) {
        throw new Errors.ModelNotFoundError(
            `Unable to find ${SymbolModel.prettyName} with id ${modelProps.symbolId}`
        );
    }
    // Check if this amount can be subtracted from related strategy's cashInCents
    const strategy = await StrategyModel.query(trx).findById(
        modelProps.strategyId
    );
    if (!strategy) {
        throw new Errors.ModelNotFoundError(
            `Unable to find ${StrategyModel.prettyName} with id ${modelProps.strategyId}`
        );
    }
    // If buy order update strategy's cashInCents
    if (modelProps.side === OrderTypes.SideSchema.Enum.buy) {
        const orderCashInCents = bankersRoundingTruncateToInt(
            modelProps.quantity * modelProps.averagePriceInCents
        );
        if (strategy.cashInCents < orderCashInCents) {
            throw new Error(
                `Unable to create ${OrderModel.prettyName} instance because it would result in a negative cashInCents`
            );
        }
        // Decrease strategy's cashInCents
        await StrategyModel.query(trx).patchAndFetchById(strategy.id, {
            cashInCents: strategy.cashInCents - orderCashInCents,
        });
    }
    // If sell order, update position quantity
    if (modelProps.side === OrderTypes.SideSchema.Enum.sell) {
        const positions = await PositionModel.query(trx).where({
            symbolId: symbol.id,
            strategyId: strategy.id,
        });
        if (positions.length === 0) {
            throw new Errors.ModelNotFoundError(
                `Unable to find ${PositionModel.prettyName} for ${SymbolModel.prettyName} with id ${symbol.id} and name ${symbol.name} and ${StrategyModel.prettyName} with id ${strategy.id}`
            );
        }
        const position = positions[0];
        if (position.quantity < modelProps.quantity) {
            throw new Error(
                `Unable to create ${OrderModel.prettyName} instance because it would result in a negative position quantity`
            );
        }
        // Decrease position quantity
        await PositionModel.query(trx).patchAndFetchById(position.id, {
            quantity: position.quantity - modelProps.quantity,
            // Do not update averagePriceInCents becuase it is a sell order
        });
    }
    // insert into order table
    const model = await OrderModel.query(trx).insert({
        ...modelProps,
        status: OrderTypes.StatusSchema.Enum.open,
    });
    if (!model) {
        throw new Error(`Unable to create ${OrderModel.prettyName} instance`);
    }
    await StrategyLogModel.query(trx).insert({
        strategyId: strategy.id,
        level: 'info',
        message: `Placed ${modelProps.side} order for ${
            modelProps.quantity
        } shares of ${SymbolModel.prettyName} with id ${symbol.id} and name ${
            symbol.name
        } at an average price of $${bankersRounding(
            modelProps.averagePriceInCents / 100
        )} each`,
        data: modelProps,
        timestamp: Date.now(),
    });
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
            return res.json({
                status: 'success',
                message: `${OrderModel.prettyName} instances retrieved successfully`,
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
                    `Unable to find ${OrderModel.prettyName} with id ${params.id}`
                );
            }
            return res.json({
                status: 'success',
                message: `${OrderModel.prettyName} instance retrieved successfully`,
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
                                `Unable to create ${OrderModel.prettyName} instance`
                            );
                        }
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${OrderModel.prettyName} instances created successfully`,
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
                    // If buy order, update position quantity
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
                    // If sell order, update strategy's cashInCents
                    if (model.side === OrderTypes.SideSchema.Enum.sell) {
                        // Check if this amount can be added to related strategy's cashInCents
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
                    model = await OrderModel.query(trx).patchAndFetchById(
                        model.id,
                        {
                            status: OrderTypes.StatusSchema.Enum.closed,
                        }
                    );
                    await StrategyLogModel.query(trx).insert({
                        strategyId: model.strategyId,
                        level: 'info',
                        message: `Filled ${model.side} order for ${
                            model.quantity
                        } shares of ${SymbolModel.prettyName} with id ${
                            model.symbolId
                        } at an average price of $${bankersRounding(
                            model.averagePriceInCents / 100
                        )} each`,
                        data: model,
                        timestamp: Date.now(),
                    });
                },
                { isolationLevel: 'serializable' }
            );
            if (!model) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${OrderModel.prettyName} with id ${params.id}`
                );
            }
            return res.json({
                status: 'success',
                message: `${OrderModel.prettyName} instance filled successfully`,
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
                    // If sell order, update position quantity
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
                            const position = positions[0];
                            await PositionModel.query(trx).patchAndFetchById(
                                position.id,
                                {
                                    quantity:
                                        position.quantity + model.quantity,
                                    // Do not update averagePriceInCents because placing a sell order does not change it, so canceling a sell order should not change it either.
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
                    await StrategyLogModel.query(trx).insert({
                        strategyId: model.strategyId,
                        level: 'info',
                        message: `Canceled ${model.side} order for ${
                            model.quantity
                        } shares of ${SymbolModel.prettyName} with id ${
                            model.symbolId
                        } at an average price of $${bankersRounding(
                            model.averagePriceInCents / 100
                        )} each`,
                        data: model,
                        timestamp: Date.now(),
                    });
                },
                { isolationLevel: 'serializable' }
            );
            if (!model) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${OrderModel.prettyName} with id ${params.id}`
                );
            }
            return res.json({
                status: 'success',
                message: `${OrderModel.prettyName} instance canceled successfully`,
                data: model,
            });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
