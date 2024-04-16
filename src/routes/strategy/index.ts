import { Strategy as StrategyModel } from '../../db/models/Strategy.js';
import {
    Strategy as StrategyTypes,
    StrategyLog as StrategyLogTypes,
    Order as OrderTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';
import { StrategyLog as StrategyLogModel } from '../../db/models/StrategyLog.js';
import { Router, Request, Response, NextFunction } from 'express';
import {ModelNotFoundError} from '../../errors/index.js';
import { KNEXION } from '../../index.js';
import { Position as PositionModel } from '../../db/models/Position.js';
import { bankersRoundingTruncateToInt } from '../../utils/index.js';
import { Order as OrderModel } from '../../db/models/Order.js';
import { StrategyValue as StrategyValueModel } from '../../db/models/StrategyValue.js';
import { rmSync } from 'fs';
import { time } from 'console';
import { ZodIssue, ZodIssueCode } from 'zod';
import { ZodErrorWithMessage } from '../../errors/index.js';

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
                throw new ModelNotFoundError(
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
                        throw new ModelNotFoundError(
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
                throw new ModelNotFoundError(
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
                        throw new ModelNotFoundError(
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
                throw new ModelNotFoundError(
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
                            throw new ModelNotFoundError(
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
                throw new ModelNotFoundError(
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
                throw new ModelNotFoundError(
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

router.get(
    '/:id/aggregateValues',
    async (
        req: Request<
            StrategyTypes.StrategyAggregateValuesGetManyRequestParamsRaw,
            any,
            any,
            StrategyTypes.StrategyAggregateValuesGetManyRequestQueryRaw
        >,
        res: Response<StrategyTypes.StrategyAggregateValuesGetManyResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params =
                StrategyTypes.StrategyAggregateValuesGetManyRequestParamsFromRaw(
                    req.params
                );
            const expectedStrategyAggregateValuesGetManyRequestQuery =
                StrategyTypes.StrategyAggregateValuesGetManyRequestQueryFromRaw(
                    req.query
                );
            const query = StrategyValueModel.query()
                .where('strategyId', params.id)
                .orderBy('timestamp', 'asc');
            // Apply query filters (Start, End)
            if (
                undefined !==
                expectedStrategyAggregateValuesGetManyRequestQuery.startTimestamp
            ) {
                query.where(
                    'timestamp',
                    '>=',
                    expectedStrategyAggregateValuesGetManyRequestQuery.startTimestamp
                );
            }
            if (
                undefined !==
                expectedStrategyAggregateValuesGetManyRequestQuery.endTimestamp
            ) {
                query.where(
                    'timestamp',
                    '<=',
                    expectedStrategyAggregateValuesGetManyRequestQuery.endTimestamp
                );
            }
            // Get all strategy values
            const strategyValues = await query;
            const timeframeValue: number =
                expectedStrategyAggregateValuesGetManyRequestQuery.timeframeValue ??
                1;
            // Build array of objects using timeframe
            let timeframeInMilliseconds: number | null = null;
            const timeframeUnit =
                expectedStrategyAggregateValuesGetManyRequestQuery.timeframeUnit ??
                'days';
            switch (
                expectedStrategyAggregateValuesGetManyRequestQuery.timeframeUnit
            ) {
                case 'minutes':
                    timeframeInMilliseconds = timeframeValue * 60000;
                    break;
                case 'hours':
                    timeframeInMilliseconds = timeframeValue * 3600000;
                    break;
                case 'days':
                    timeframeInMilliseconds = timeframeValue * 86400000;
                    break;
                case 'months':
                    timeframeInMilliseconds = timeframeValue * 2592000000;
                    break;
                case 'years':
                    timeframeInMilliseconds = timeframeValue * 31536000000;
                    break;
                default:
                    // Default to days
                    timeframeInMilliseconds = timeframeValue * 86400000;
                    break;
            }
            // If Start is not provided, use the first recorded timestamp from results as Start
            let startTimestamp: number;
            const now = new Date().getTime();
            if (
                undefined !== expectedStrategyAggregateValuesGetManyRequestQuery.startTimestamp
            ) {
                startTimestamp =
                    expectedStrategyAggregateValuesGetManyRequestQuery.startTimestamp;
            } else if (strategyValues.length > 0) {
                startTimestamp = strategyValues[0].timestamp;
            } else {
                startTimestamp = now - timeframeInMilliseconds;
            }
            // If End is not provided, use current UNIX timestamp as End
            const endTimestamp: number =
                expectedStrategyAggregateValuesGetManyRequestQuery.endTimestamp ??
                now;
            if (!(startTimestamp < endTimestamp)) {
                const issues: ZodIssue[] = [];
                if (undefined !== expectedStrategyAggregateValuesGetManyRequestQuery.startTimestamp) {
                    issues.push({
                        code: ZodIssueCode.custom,
                        message: `Start timestamp must be before end timestamp: startTimestamp: ${startTimestamp}, endTimestamp ${endTimestamp}`,
                        path: ['startTimestamp'],
                    });
                }
                if (undefined !== expectedStrategyAggregateValuesGetManyRequestQuery.endTimestamp) {
                    issues.push({
                        code: ZodIssueCode.custom,
                        message: `Start timestamp must be before end timestamp: startTimestamp: ${startTimestamp}, endTimestamp ${endTimestamp}`,
                        path: ['endTimestamp'],
                    });
                }
                throw new ZodErrorWithMessage(
                    `Start timestamp must be before end timestamp: startTimestamp: ${startTimestamp}, endTimestamp ${endTimestamp}`,
                    issues);
            }
            const maxRecords = 1000000;
            const startEndTimestampDiff = endTimestamp - startTimestamp;
            const estimatedNumberOfRecords = Math.ceil(
                startEndTimestampDiff / timeframeInMilliseconds
            );
            if (estimatedNumberOfRecords > maxRecords) {
                const issues: ZodIssue[] = [];
                if (undefined !== expectedStrategyAggregateValuesGetManyRequestQuery.timeframeUnit) {
                    issues.push({
                        code: ZodIssueCode.custom,
                        message: `Estimated number of records ${estimatedNumberOfRecords} exceeds max number of records ${maxRecords}`,
                        path: ['timeframeUnit'],
                    });
                }
                if (undefined !== expectedStrategyAggregateValuesGetManyRequestQuery.timeframeValue) {
                    issues.push({
                        code: ZodIssueCode.custom,
                        message: `Estimated number of records ${estimatedNumberOfRecords} exceeds max number of records ${maxRecords}`,
                        path: ['timeframeValue'],
                    });
                }
                if (undefined !== expectedStrategyAggregateValuesGetManyRequestQuery.startTimestamp) {
                    issues.push({
                        code: ZodIssueCode.custom,
                        message: `Estimated number of records ${estimatedNumberOfRecords} exceeds max number of records ${maxRecords}`,
                        path: ['startTimestamp'],
                    });
                }
                if (undefined !== expectedStrategyAggregateValuesGetManyRequestQuery.endTimestamp) {
                    issues.push({
                        code: ZodIssueCode.custom,
                        message: `Estimated number of records ${estimatedNumberOfRecords} exceeds max number of records ${maxRecords}`,
                        path: ['endTimestamp'],
                    });
                }
                throw new ZodErrorWithMessage(
                    `Estimated number of records ${estimatedNumberOfRecords} exceeds max number of records ${maxRecords}`,
                    issues);
            }
            // Create an array of “buckets” for each interval span (from start to end) with a “start” and “end” timestamp property for each
            const data: StrategyTypes.StrategyAggregateValuesGetManyResponseBodyDataInstance[] =
                [];
            let currentStartTimestamp = startTimestamp;
            let latestKnownStrategyIndex = 0;
            while (currentStartTimestamp < endTimestamp) {
                const memory = process.memoryUsage();
                const currentEndTimestamp =
                    currentStartTimestamp + timeframeInMilliseconds;
                // Create a new empty array of strategyValuesForPeriod
                const strategyValuesForPeriod: StrategyValueModel[] = [];
                while (
                    undefined !== strategyValues[latestKnownStrategyIndex] &&
                    strategyValues[latestKnownStrategyIndex].timestamp <=
                        currentEndTimestamp
                ) {
                    strategyValuesForPeriod.push(
                        strategyValues[latestKnownStrategyIndex]
                    );
                    latestKnownStrategyIndex++;
                }
                let averageValueInCents = 0;
                let openValueInCents = 0;
                let highestValueInCents = 0;
                let lowestValueInCents = 0;
                let closeValueInCents = 0;
                if (strategyValuesForPeriod.length > 0) {
                    const strategyValuesForPeriodValuesInCents =
                        strategyValuesForPeriod.map(
                            strategyValue => strategyValue.valueInCents
                        );
                    averageValueInCents = bankersRoundingTruncateToInt(
                        strategyValuesForPeriodValuesInCents.reduce(
                            (acc, val) => {
                                return bankersRoundingTruncateToInt(acc + val);
                            },
                            0
                        ) / strategyValuesForPeriodValuesInCents.length
                    );
                    openValueInCents = strategyValuesForPeriodValuesInCents[0];
                    highestValueInCents = Math.max(
                        ...strategyValuesForPeriodValuesInCents
                    );
                    lowestValueInCents = Math.min(
                        ...strategyValuesForPeriodValuesInCents
                    );
                    closeValueInCents =
                        strategyValuesForPeriodValuesInCents[
                            strategyValuesForPeriodValuesInCents.length - 1
                        ];
                } else {
                    // Flatline
                    if (data.length > 0) {
                        averageValueInCents =
                            data[data.length - 1].averageValueInCents;
                        openValueInCents = averageValueInCents;
                        highestValueInCents = averageValueInCents;
                        lowestValueInCents = averageValueInCents;
                        closeValueInCents = averageValueInCents;
                    }
                    // Default to all 0s if we don't have a previous record
                }
                // Push a new dataInstance to data
                data.push({
                    timestamp: currentStartTimestamp,
                    averageValueInCents,
                    openValueInCents,
                    highestValueInCents,
                    lowestValueInCents,
                    closeValueInCents,
                });
                currentStartTimestamp = currentEndTimestamp;
            }
            return res.json({
                status: 'success',
                message: `${StrategyModel.prettyName} instance aggregateValues retrieved successfully`,
                data,
            });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
