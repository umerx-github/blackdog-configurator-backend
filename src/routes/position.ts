import { Position as PositionModel } from '../db/models/Position.js';
import { Position as PositionTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import * as Errors from '../errors/index.js';
import { KNEXION } from '../index.js';
import { Symbol as SymbolModel } from '../db/models/Symbol.js';
import { Knex } from 'knex';
import { NextFunction } from 'express';
import {
    bankersRounding,
    bankersRoundingTruncateToInt,
} from '../utils/index.js';
import { StrategyLog as StrategyLogModel } from '../db/models/StrategyLog.js';
import { Strategy as StrategyModel } from '../db/models/Strategy.js';

const router = Router();

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

function validateQuantity(quantity: number) {
    if (quantity < 0) {
        throw new Error(
            `Unable to create ${PositionModel.prettyName} instance with negative quantity: ${quantity}`
        );
    }
}

/**
 *
 * @param currentQuantity
 * @param currentAveragePriceInCents
 * @param deltaQuantity Change in quantity. If positive, it means the quantity is increasing. If negative, it means the quantity is decreasing.
 * @param transactionAveragePriceInCents
 * @returns
 */
export function calculateExistingPositionNewAveragePriceInCentsForFilledBuyOrder(
    currentQuantity: number,
    currentAveragePriceInCents: number,
    deltaQuantity: number,
    transactionAveragePriceInCents: number
) {
    const newQuantity = currentQuantity + deltaQuantity;
    let averagePriceInCents = currentAveragePriceInCents;
    if (newQuantity > currentQuantity) {
        averagePriceInCents = bankersRoundingTruncateToInt(
            bankersRoundingTruncateToInt(
                bankersRoundingTruncateToInt(
                    currentQuantity * currentAveragePriceInCents
                ) +
                    bankersRoundingTruncateToInt(
                        deltaQuantity * transactionAveragePriceInCents
                    )
            ) / newQuantity
        );
    }
    return averagePriceInCents;
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
            if (undefined !== expectedPositionGetManyRequestQuery.ids) {
                query.whereIn('id', expectedPositionGetManyRequestQuery.ids);
            }
            const queryResults = await query;
            const data = queryResults.map(dataItem => {
                return dataItem;
            });
            return res.json({
                status: 'success',
                message: `${PositionModel.prettyName} instances retrieved successfully`,
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
                    `Unable to find ${PositionModel.prettyName} with id ${params.id}`
                );
            }
            return res.json({
                status: 'success',
                message: `${PositionModel.prettyName} instance retrieved successfully`,
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
                    for (const dataToInsert of parsedRequest) {
                        // Validate the Symbol exists
                        const symbol = await SymbolModel.query(trx).findById(
                            dataToInsert.symbolId
                        );
                        if (!symbol) {
                            throw new Errors.ModelNotFoundError(
                                `Unable to find ${SymbolModel.prettyName} with id ${dataToInsert.symbolId}`
                            );
                        }
                        // Validate the Strategy exists
                        const strategy = await StrategyModel.query(
                            trx
                        ).findById(dataToInsert.strategyId);
                        if (!strategy) {
                            throw new Errors.ModelNotFoundError(
                                `Unable to find ${StrategyModel.prettyName} with id ${dataToInsert.strategyId}`
                            );
                        }
                        // Insert into junction table first
                        // Check to see if a position with the same symbolId and strategyId already exists
                        let model: PositionModel | undefined;
                        const existingPosition = await PositionModel.query(trx)
                            .where('symbolId', dataToInsert.symbolId)
                            .andWhere('strategyId', dataToInsert.strategyId)
                            .first();
                        // If it does exist, update the quantity
                        if (existingPosition) {
                            const newQuantity =
                                existingPosition.quantity +
                                dataToInsert.quantity;
                            let newAveragePriceInCents =
                                calculateExistingPositionNewAveragePriceInCentsForFilledBuyOrder(
                                    existingPosition.quantity,
                                    existingPosition.averagePriceInCents,
                                    dataToInsert.quantity,
                                    dataToInsert.averagePriceInCents
                                );
                            validateQuantity(newQuantity);
                            model = await PositionModel.query(
                                trx
                            ).patchAndFetchById(existingPosition.id, {
                                quantity: newQuantity,
                                averagePriceInCents: newAveragePriceInCents,
                            });
                        } else {
                            validateQuantity(dataToInsert.quantity);
                            model = await PositionModel.query(trx).insert(
                                dataToInsert
                            );
                        }
                        if (!model) {
                            throw new Error(
                                `Unable to create ${PositionModel.prettyName} instance`
                            );
                        }
                        await StrategyLogModel.query(trx).insert({
                            strategyId: dataToInsert.strategyId,
                            level: 'info',
                            message: `Updated ${
                                PositionModel.prettyName
                            } quantity and average price for ${
                                SymbolModel.prettyName
                            } ${symbol.name} with id ${
                                symbol.id
                            }. Previous quantity: ${
                                existingPosition?.quantity ?? 0
                            }, new quantity: ${
                                model.quantity
                            }. Previous average price: $${(
                                bankersRounding(
                                    existingPosition?.averagePriceInCents ?? 0
                                ) / 100
                            ).toFixed(2)}, new average price: ${bankersRounding(
                                model.averagePriceInCents
                            ).toFixed(2)}`,
                            timestamp: Date.now(),
                            data: dataToInsert,
                        });
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${PositionModel.prettyName} instances created successfully`,
                data: modelData,
            });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
