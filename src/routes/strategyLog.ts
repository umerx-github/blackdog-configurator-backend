import { StrategyLog as StrategyLogModel } from '../db/models/StrategyLog.js';
import { StrategyLog as StrategyLogTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import * as Errors from '../errors/index.js';
import { KNEXION } from '../index.js';
import { Knex } from 'knex';
import { NextFunction } from 'express';

const router = Router();

router.get(
    '/',
    async (
        req: Request<
            any,
            any,
            any,
            StrategyLogTypes.StrategyLogGetManyRequestQueryRaw
        >,
        res: Response<StrategyLogTypes.StrategyLogGetManyResponseBody>,
        next: NextFunction
    ) => {
        try {
            const query = StrategyLogModel.query().orderBy('id', 'desc');
            const expectedStrategyLogGetManyRequestQuery: StrategyLogTypes.StrategyLogGetManyRequestQuery =
                StrategyLogTypes.StrategyLogGetManyRequestQueryFromRaw(
                    req.query
                );
            if (
                undefined !== expectedStrategyLogGetManyRequestQuery.strategyIds
            ) {
                query.whereIn(
                    'strategyId',
                    expectedStrategyLogGetManyRequestQuery.strategyIds
                );
            }
            if (undefined !== expectedStrategyLogGetManyRequestQuery.ids) {
                query.whereIn('id', expectedStrategyLogGetManyRequestQuery.ids);
            }
            const queryResults = await query;
            const data = queryResults.map(dataItem => {
                return dataItem;
            });
            return res.json({
                status: 'success',
                message: `${StrategyLogModel.prettyName} instances retrieved successfully`,
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
        req: Request<StrategyLogTypes.StrategyLogGetSingleRequestParamsRaw>,
        res: Response<StrategyLogTypes.StrategyLogGetSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params =
                StrategyLogTypes.StrategyLogGetSingleRequestParamsFromRaw(
                    req.params
                );
            const modelData = await StrategyLogModel.query().findById(
                params.id
            );
            if (!modelData) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${StrategyLogModel.prettyName} with id ${params.id}`
                );
            }
            return res.json({
                status: 'success',
                message: `${StrategyLogModel.prettyName} instance retrieved successfully`,
                data: {
                    ...modelData,
                    // data: JSON.stringify(modelData.data),
                },
            });
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    '/',
    async (
        req: Request<any, any, StrategyLogTypes.StrategyLogPostManyRequestBody>,
        res: Response<StrategyLogTypes.StrategyLogPostManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: StrategyLogTypes.StrategyLogPostManyRequestBody =
                StrategyLogTypes.StrategyLogPostManyRequestBodyFromRaw(
                    req.body
                );
            const modelData: StrategyLogTypes.StrategyLogPostManyResponseBodyData =
                [];
            await KNEXION.transaction(
                async trx => {
                    for (const dataToInsert of parsedRequest) {
                        // Check if the symbol already exists
                        let model: StrategyLogModel | undefined;
                        model = await StrategyLogModel.query(trx).insert({
                            ...dataToInsert,
                            timestamp: Date.now(),
                        });
                        if (undefined === model) {
                            throw new Error(
                                `Unable to create ${StrategyLogModel.prettyName} instance`
                            );
                        }
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${StrategyLogModel.prettyName} instances created successfully`,
                data: modelData,
            });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
