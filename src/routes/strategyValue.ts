import { StrategyValue as StrategyValueModel } from '../db/models/StrategyValue.js';
import { StrategyValue as StrategyValueTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
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
            StrategyValueTypes.StrategyValueGetManyRequestQueryRaw
        >,
        res: Response<StrategyValueTypes.StrategyValueGetManyResponseBody>,
        next: NextFunction
    ) => {
        try {
            const expectedStrategyValueGetManyRequestQuery: StrategyValueTypes.StrategyValueGetManyRequestQuery =
                StrategyValueTypes.StrategyValueGetManyRequestQueryFromRaw(
                    req.query
                );
            const query = StrategyValueModel.query().orderBy('id', 'desc');
            const pageSize =
                expectedStrategyValueGetManyRequestQuery.pageSize ?? 10;
            const pageNumber =
                expectedStrategyValueGetManyRequestQuery.pageNumber ?? 1;
            // convert 1-indexed pageNumber to 0-indexed pageNumber
            if (
                undefined !==
                expectedStrategyValueGetManyRequestQuery.strategyIds
            ) {
                query.whereIn(
                    'strategyId',
                    expectedStrategyValueGetManyRequestQuery.strategyIds
                );
            }
            if (undefined !== expectedStrategyValueGetManyRequestQuery.ids) {
                query.whereIn(
                    'id',
                    expectedStrategyValueGetManyRequestQuery.ids
                );
            }
            if (
                undefined !==
                expectedStrategyValueGetManyRequestQuery.startTimestamp
            ) {
                query.where(
                    'timestamp',
                    '>=',
                    expectedStrategyValueGetManyRequestQuery.startTimestamp
                );
            }
            if (
                undefined !==
                expectedStrategyValueGetManyRequestQuery.endTimestamp
            ) {
                query.where(
                    'timestamp',
                    '<=',
                    expectedStrategyValueGetManyRequestQuery.endTimestamp
                );
            }
            const queryResults = await query.page(pageNumber - 1, pageSize);
            const data = queryResults.results.map(dataItem => {
                return dataItem;
            });
            return res.json(validateResponse(() => StrategyValueTypes.StrategyValueGetManyResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyValueModel.prettyName} instances retrieved successfully`,
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
        req: Request<StrategyValueTypes.StrategyValueGetSingleRequestParamsRaw>,
        res: Response<StrategyValueTypes.StrategyValueGetSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params =
                StrategyValueTypes.StrategyValueGetSingleRequestParamsFromRaw(
                    req.params
                );
            const modelData = await StrategyValueModel.query().findById(
                params.id
            );
            if (!modelData) {
                throw new ModelNotFoundError(
                    `Unable to find ${StrategyValueModel.prettyName} with id ${params.id}`
                );
            }
            return res.json(validateResponse(() => StrategyValueTypes.StrategyValueGetSingleResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyValueModel.prettyName} instance retrieved successfully`,
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
        req: Request<
            any,
            any,
            StrategyValueTypes.StrategyValuePostManyRequestBody
        >,
        res: Response<StrategyValueTypes.StrategyValuePostManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: StrategyValueTypes.StrategyValuePostManyRequestBody =
                StrategyValueTypes.StrategyValuePostManyRequestBodyFromRaw(
                    req.body
                );
            const modelData: StrategyValueTypes.StrategyValuePostManyResponseBodyData =
                [];
            await KNEXION.transaction(
                async trx => {
                    for (const dataToInsert of parsedRequest) {
                        // Check if the symbol already exists
                        let model: StrategyValueModel | undefined;
                        model = await StrategyValueModel.query(trx).insert({
                            ...dataToInsert,
                            timestamp: Date.now(),
                        });
                        if (undefined === model) {
                            throw new UnableToCreateInstanceError(
                                `Unable to create ${StrategyValueModel.prettyName} instance`
                            );
                        }
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json(validateResponse(() => StrategyValueTypes.StrategyValuePostManyResponseBodyFromRaw({
                status: 'success',
                message: `${StrategyValueModel.prettyName} instances created successfully`,
                data: modelData,
            })));
        } catch (err) {
            next(err);
        }
    }
);

export default router;
