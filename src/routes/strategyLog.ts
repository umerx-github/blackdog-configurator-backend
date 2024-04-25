import { StrategyLog as StrategyLogModel } from '../db/models/StrategyLog.js';
import { StrategyLog as StrategyLogTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import { KNEXION } from '../index.js';
import { NextFunction } from 'express';
import { ModelNotFoundError, UnableToCreateInstanceError } from '../errors/index.js';
import { validateResponse } from '../utils/response.js';

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
            const expectedStrategyLogGetManyRequestQuery: StrategyLogTypes.StrategyLogGetManyRequestQuery =
                StrategyLogTypes.StrategyLogGetManyRequestQueryFromRaw(
                    req.query
                );
            const query = StrategyLogModel.query().orderBy('id', 'desc');
            const pageSize =
                expectedStrategyLogGetManyRequestQuery.pageSize ?? 10;
            const pageNumber =
                expectedStrategyLogGetManyRequestQuery.pageNumber ?? 1;
            // convert 1-indexed pageNumber to 0-indexed pageNumber
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
            if (undefined !== expectedStrategyLogGetManyRequestQuery.levels) {
                query.whereIn(
                    'level',
                    expectedStrategyLogGetManyRequestQuery.levels
                );
            }
            const queryResults = await query.page(pageNumber - 1, pageSize);
            const data = queryResults.results.map(dataItem => {
                return dataItem;
            });
            return res.json(validateResponse(() => StrategyLogTypes.StrategyLogGetManyResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyLogModel.prettyName} instances retrieved successfully`,
                data: data,
                pageSize: pageSize,
                pageNumber: pageNumber,
                totalResults: queryResults.total,
                totalPages: Math.ceil(queryResults.total / pageSize),
            })));
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
                throw new ModelNotFoundError(
                    `Unable to find ${StrategyLogModel.prettyName} with id ${params.id}`
                );
            }
            return res.json(validateResponse(() => StrategyLogTypes.StrategyLogGetSingleResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyLogModel.prettyName} instance retrieved successfully`,
                data: {
                    ...modelData,
                    // data: JSON.stringify(modelData.data),
                },
            })));
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
                            throw new UnableToCreateInstanceError(
                                `Unable to create ${StrategyLogModel.prettyName} instance`
                            );
                        }
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json(validateResponse(() => StrategyLogTypes.StrategyLogPostManyResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyLogModel.prettyName} instances created successfully`,
                data: modelData,
            })));
        } catch (err) {
            next(err);
        }
    }
);

export default router;
