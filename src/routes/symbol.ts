import { Symbol as SymbolModel } from '../db/models/Symbol.js';
import { Symbol as SymbolTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import * as Errors from '../errors/index.js';
import { KNEXION } from '../index.js';
import { Knex } from 'knex';
import { NextFunction } from 'express';

const router = Router();
const modelName = 'Symbol';

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

router.get(
    '/',
    async (
        req: Request<any, any, any, SymbolTypes.SymbolGetManyRequestQueryRaw>,
        res: Response<SymbolTypes.SymbolGetManyResponseBody>,
        next: NextFunction
    ) => {
        try {
            const query = SymbolModel.query().orderBy('id', 'desc');
            const expectedSymbolGetManyRequestQuery: SymbolTypes.SymbolGetManyRequestQuery =
                SymbolTypes.SymbolGetManyRequestQueryFromRaw(req.query);
            if (undefined !== expectedSymbolGetManyRequestQuery.name) {
                query.where('name', expectedSymbolGetManyRequestQuery.name);
            }
            if (undefined !== expectedSymbolGetManyRequestQuery.ids) {
                query.whereIn('id', expectedSymbolGetManyRequestQuery.ids);
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
        req: Request<SymbolTypes.SymbolGetSingleRequestParamsRaw>,
        res: Response<SymbolTypes.SymbolGetSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params = SymbolTypes.SymbolGetSingleRequestParamsFromRaw(
                req.params
            );
            const modelData = await SymbolModel.query().findById(params.id);
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
        req: Request<any, any, SymbolTypes.SymbolPostManyRequestBody>,
        res: Response<SymbolTypes.SymbolPostManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: SymbolTypes.SymbolPostManyRequestBody =
                SymbolTypes.SymbolPostManyRequestBodyFromRaw(req.body);
            const modelData: SymbolTypes.SymbolPostManyResponseBodyData = [];
            await KNEXION.transaction(
                async trx => {
                    for (const dataToInsert of parsedRequest) {
                        // Check if the symbol already exists
                        let model: SymbolModel | undefined;
                        model = await SymbolModel.query(trx).findOne({
                            name: dataToInsert.name,
                        });
                        if (undefined === model) {
                            model = await SymbolModel.query(trx).insert(
                                dataToInsert
                            );
                        }
                        if (undefined === model) {
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

export default router;
