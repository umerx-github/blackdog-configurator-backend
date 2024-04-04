import { Strategy as StrategyModel } from '../../db/models/Strategy.js';
import {
    Strategy as StrategyTypes,
    StrategyLog as StrategyLogTypes,
    Order as OrderTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';
import { StrategyLog as StrategyLogModel } from '../../db/models/StrategyLog.js';
import { Router, Request, Response, NextFunction } from 'express';
import * as Errors from '../../errors/index.js';
import { KNEXION } from '../../index.js';
import { Position as PositionModel } from '../../db/models/Position.js';
import { bankersRoundingTruncateToInt } from '../../utils/index.js';
import { Order as OrderModel } from '../../db/models/Order.js';

const router = Router();

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
        res: Response<StrategyTypes.StrategyGetManyResponseBody>,
        next: NextFunction
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
                message: `${StrategyModel.prettyName} instances retrieved successfully`,
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
        req: Request<StrategyTypes.StrategyGetSingleRequestParamsRaw>,
        res: Response<StrategyTypes.StrategyGetSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params = StrategyTypes.StrategyGetSingleRequestParamsFromRaw(
                req.params
            );
            const modelData = await StrategyModel.query().findById(params.id);
            if (!modelData) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${StrategyModel.prettyName} with id ${params.id}`
                );
            }
            return res.json({
                status: 'success',
                message: `${StrategyModel.prettyName} instance retrieved successfully`,
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
        req: Request<any, any, StrategyTypes.StrategyPostManyRequestBody>,
        res: Response<StrategyTypes.StrategyPostManyResponseBody>,
        next: NextFunction
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
                        const strategyLogModelProps: StrategyLogTypes.StrategyLogModelProps =
                            {
                                strategyId: model.id,
                                level: 'info',
                                message: `${StrategyModel.prettyName} created`,
                                data: { rawData: model },
                                timestamp: Date.now(),
                            };
                        await StrategyLogModel.query(trx).insert(
                            strategyLogModelProps
                        );
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${StrategyModel.prettyName} instances created successfully`,
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
        req: Request<any, any, StrategyTypes.StrategyPatchManyRequestBody>,
        res: Response<StrategyTypes.StrategyPatchManyResponseBody>,
        next: NextFunction
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
                        const strategyLogModelProps: StrategyLogTypes.StrategyLogModelProps =
                            {
                                strategyId: model.id,
                                level: 'info',
                                message: `${StrategyModel.prettyName} updated`,
                                data: { rawData: model },
                                timestamp: Date.now(),
                            };
                        await StrategyLogModel.query(trx).insert(
                            strategyLogModelProps
                        );
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${StrategyModel.prettyName} instances updated successfully`,
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
            StrategyTypes.StrategyPatchSingleRequestParamsRaw,
            any,
            StrategyTypes.StrategyPatchSingleRequestBody
        >,
        res: Response<StrategyTypes.StrategyPatchSingleResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const params = StrategyTypes.StrategyGetSingleRequestParamsFromRaw(
                req.params
            );
            const parsedRequest: StrategyTypes.StrategyPatchSingleRequestBody =
                StrategyTypes.StrategyPatchSingleRequestBodyFromRaw(req.body);
            let model: StrategyModel | undefined;
            await KNEXION.transaction(
                async trx => {
                    model = await StrategyModel.query(trx).patchAndFetchById(
                        params.id,
                        parsedRequest
                    );
                    if (!model) {
                        throw new Errors.ModelNotFoundError(
                            `Unable to find ${StrategyModel.prettyName} with id ${params.id}`
                        );
                    }
                    const strategyLogModelProps: StrategyLogTypes.StrategyLogModelProps =
                        {
                            strategyId: model.id,
                            level: 'info',
                            message: `${StrategyModel.prettyName} updated`,
                            data: { rawData: model },
                            timestamp: Date.now(),
                        };
                    await StrategyLogModel.query(trx).insert(
                        strategyLogModelProps
                    );
                },
                {
                    isolationLevel: 'serializable',
                }
            );
            if (!model) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${StrategyModel.prettyName} with id ${params.id}`
                );
            }
            return res.json({
                status: 'success',
                message: `${StrategyModel.prettyName} instance updated successfully`,
                data: model,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.put(
    '/',
    async (
        req: Request<any, any, StrategyTypes.StrategyPutManyRequestBody>,
        res: Response<StrategyTypes.StrategyPutManyResponseBody>,
        next: NextFunction
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
                        const strategyLogModelProps: StrategyLogTypes.StrategyLogModelProps =
                            {
                                strategyId: model.id,
                                level: 'info',
                                message: `${StrategyModel.prettyName} replaced`,
                                data: { rawData: model },
                                timestamp: Date.now(),
                            };
                        await StrategyLogModel.query(trx).insert(
                            strategyLogModelProps
                        );
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${StrategyModel.prettyName} instances updated successfully`,
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
            StrategyTypes.StrategyPutSingleRequestParamsRaw,
            any,
            StrategyTypes.StrategyPutSingleRequestBody
        >,
        res: Response<StrategyTypes.StrategyPutSingleResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const params = StrategyTypes.StrategyPutSingleRequestParamsFromRaw(
                req.params
            );
            let model: StrategyModel | undefined;
            const parsedRequest: StrategyTypes.StrategyPutSingleRequestBody =
                StrategyTypes.StrategyPutSingleRequestBodyFromRaw(req.body);
            await KNEXION.transaction(
                async trx => {
                    model = await StrategyModel.query().patchAndFetchById(
                        params.id,
                        parsedRequest
                    );
                    if (!model) {
                        throw new Errors.ModelNotFoundError(
                            `Unable to find ${StrategyModel.prettyName} with id ${params.id}`
                        );
                    }
                    const strategyLogModelProps: StrategyLogTypes.StrategyLogModelProps =
                        {
                            strategyId: model.id,
                            level: 'info',
                            message: `${StrategyModel.prettyName} replaced`,
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
                    `Unable to find ${StrategyModel.prettyName} with id ${params.id}`
                );
            }
            return res.json({
                status: 'success',
                message: `${StrategyModel.prettyName} instance updated successfully`,
                data: model,
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
            StrategyTypes.StrategyDeleteManyRequestQueryRaw
        >,
        res: Response<StrategyTypes.StrategyDeleteManyResponseBody>,
        next: NextFunction
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
                                `Unable to find ${StrategyModel.prettyName} with id ${id}`
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
                message: `${StrategyModel.prettyName} instances deleted successfully`,
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
        req: Request<StrategyTypes.StrategyDeleteSingleRequestParamsRaw>,
        res: Response<StrategyTypes.StrategyDeleteSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params =
                StrategyTypes.StrategyDeleteSingleRequestParamsFromRaw(
                    req.params
                );
            const modelData = await StrategyModel.query().findById(params.id);
            if (!modelData) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${StrategyModel.prettyName} with id ${params.id}`
                );
            }
            await StrategyModel.query().deleteById(params.id);
            return res.json({
                status: 'success',
                message: `${StrategyModel.prettyName} instance deleted successfully`,
                data: modelData,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    '/:id/assets',
    async (
        req: Request<StrategyTypes.StrategyAssetsGetSingleRequestParamsRaw>,
        res: Response<StrategyTypes.StrategyAssetsGetSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params =
                StrategyTypes.StrategyAssetsGetSingleRequestParamsFromRaw(
                    req.params
                );
            const modelData = await StrategyModel.query().findById(params.id);
            if (!modelData) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${StrategyModel.prettyName} with id ${params.id}`
                );
            }
            // - Cash in Cents on Strategy
            // - Open Orders value
            // 	- Get all BUY orders
            // 	- Sum up each order's quantity * average price in cents
            // 		- This works because that amount would have been deducated from cash in cents on strategy when order was placed
            // - Holdings/Positions
            // 	- Just return them
            const positions = await PositionModel.query().where({
                strategyId: params.id,
            });
            const openBuyOrders = await OrderModel.query().where({
                strategyId: params.id,
                status: 'open',
                side: OrderTypes.SideSchema.Enum.buy,
            });
            // Reduce open orders, summing up the total value of the orders. Each order's value is its quantity * its average price in cents
            const openBuyOrdersValueInCents = openBuyOrders.reduce(
                (acc, order) => {
                    return bankersRoundingTruncateToInt(
                        acc +
                            bankersRoundingTruncateToInt(
                                order.quantity * order.averagePriceInCents
                            )
                    );
                },
                0
            );
            return res.json({
                status: 'success',
                message: `${StrategyModel.prettyName} instance assets retrieved successfully`,
                data: {
                    cashInCents: modelData.cashInCents,
                    openOrdersValueInCents: openBuyOrdersValueInCents,
                    positions: positions,
                },
            });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
