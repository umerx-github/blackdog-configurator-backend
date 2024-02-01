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
function postRequestBodyDataInstanceToRequiredFields(
    requestBodyData: SymbolTypes.SymbolPostRequestBodyDataInstance
): SymbolTypes.SymbolRequiredFields {
    const modelData: SymbolTypes.SymbolRequiredFields = {
        name: requestBodyData.name,
    };
    return modelData;
}
function modelToResponseBodyDataInstance(
    model: SymbolModel
): SymbolTypes.SymbolResponseBodyDataInstance {
    return model;
}

async function patchSingle(
    id: number,
    modelProps: SymbolTypes.SymbolPropsOptional,
    trx: Knex.Transaction
) {
    // Check if there are any properties to update
    let model = await SymbolModel.query(trx).findById(id);
    // get the model's data before deleting it
    if (!model) {
        throw new Errors.ModelNotFoundError(
            `Unable to find ${modelName} with id ${id}`
        );
    }
    if (Object.keys(modelProps).length > 0) {
        model = await SymbolModel.query(trx).patchAndFetchById(id, modelProps);
        if (!model) {
            throw new Error(`Unable to update ${modelName} instance`);
        }
    }
    return modelToResponseBodyDataInstance(model);
}

async function deleteSingle(
    id: number,
    trx: Knex.Transaction
): Promise<SymbolTypes.SymbolResponseBodyDataInstance> {
    let model = await SymbolModel.query(trx).findById(id);
    // get the model's data before deleting it
    if (!model) {
        throw new Errors.ModelNotFoundError(
            `Unable to find ${modelName} with id ${id}`
        );
    }
    // const data = modelToResponseBodyDataInstance(model);
    // Unrelate all symbols without removing them from the model
    await SymbolModel.query(trx).deleteById(id);
    return modelToResponseBodyDataInstance(model);
}

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
                return modelToResponseBodyDataInstance(dataItem);
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
                data: modelToResponseBodyDataInstance(modelData),
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
                    for (const Symbol of parsedRequest) {
                        // Insert into junction table first
                        const dataToInsert =
                            postRequestBodyDataInstanceToRequiredFields(Symbol);
                        const model = await SymbolModel.query(trx).insert(
                            dataToInsert
                        );
                        if (!model) {
                            throw new Error(
                                `Unable to create ${modelName} instance`
                            );
                        }
                        modelData.push(modelToResponseBodyDataInstance(model));
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

router.patch(
    '/',
    async (
        req: Request<any, any, SymbolTypes.SymbolPatchManyRequestBody>,
        res: Response<SymbolTypes.SymbolPatchManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: SymbolTypes.SymbolPatchManyRequestBody =
                SymbolTypes.SymbolPatchManyRequestBodyFromRaw(req.body);
            const modelData: SymbolTypes.SymbolPatchManyResponseBodyData = [];
            await KNEXION.transaction(
                async trx => {
                    for (const Symbol of parsedRequest) {
                        // Insert into junction table first
                        modelData.push(
                            await patchSingle(Symbol.id, Symbol, trx)
                        );
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${modelName} instances updated successfully`,
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
            SymbolTypes.SymbolPatchSingleRequestParamsRaw,
            any,
            SymbolTypes.SymbolPatchSingleRequestBody
        >,
        res: Response<SymbolTypes.SymbolPatchSingleResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const params = SymbolTypes.SymbolGetSingleRequestParamsFromRaw(
                req.params
            );
            const parsedRequest: SymbolTypes.SymbolPatchSingleRequestBody =
                SymbolTypes.SymbolPatchSingleRequestBodyFromRaw(req.body);
            let modelData:
                | SymbolTypes.SymbolPatchSingleResponseBodyData
                | undefined = undefined;
            await KNEXION.transaction(
                async trx => {
                    modelData = await patchSingle(
                        params.id,
                        parsedRequest,
                        trx
                    );
                },
                { isolationLevel: 'serializable' }
            );
            if (!modelData) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${modelName} with id ${params.id}`
                );
            }
            return res.json({
                status: 'success',
                message: `${modelName} instance updated successfully`,
                data: modelData,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.put(
    '/',
    async (
        req: Request<any, any, SymbolTypes.SymbolPutManyRequestBody>,
        res: Response<SymbolTypes.SymbolPutManyResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: SymbolTypes.SymbolPutManyRequestBody =
                SymbolTypes.SymbolPutManyRequestBodyFromRaw(req.body);
            const modelData: SymbolTypes.SymbolPutManyResponseBodyData = [];
            await KNEXION.transaction(
                async trx => {
                    for (const Symbol of parsedRequest) {
                        const modelDataInstance = await patchSingle(
                            Symbol.id,
                            Symbol,
                            trx
                        );
                        modelData.push(modelDataInstance);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${modelName} instances updated successfully`,
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
            SymbolTypes.SymbolPutSingleRequestParamsRaw,
            any,
            SymbolTypes.SymbolPutSingleRequestBody
        >,
        res: Response<SymbolTypes.SymbolPutSingleResponseBody>,
        next: NextFunction
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const params = SymbolTypes.SymbolGetSingleRequestParamsFromRaw(
                req.params
            );
            const parsedRequest: SymbolTypes.SymbolPutSingleRequestBody =
                SymbolTypes.SymbolPutSingleRequestBodyFromRaw(req.body);
            let modelData:
                | SymbolTypes.SymbolPutSingleResponseBodyData
                | undefined = undefined;
            await KNEXION.transaction(
                async trx => {
                    modelData = await patchSingle(
                        params.id,
                        parsedRequest,
                        trx
                    );
                },
                { isolationLevel: 'serializable' }
            );
            if (!modelData) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${modelName} with id ${params.id}`
                );
            }
            return res.json({
                status: 'success',
                message: `${modelName} instance updated successfully`,
                data: modelData,
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
            SymbolTypes.SymbolDeleteManyRequestQueryRaw
        >,
        res: Response<SymbolTypes.SymbolDeleteManyResponseBody>,
        next: NextFunction
    ) => {
        try {
            const query = SymbolModel.query();
            const expectedSymbolDeleteManyRequestQuery: SymbolTypes.SymbolDeleteManyRequestQuery =
                SymbolTypes.SymbolDeleteManyRequestQueryFromRaw(req.query);
            const modelData: SymbolTypes.SymbolPutManyResponseBodyData = [];
            await KNEXION.transaction(
                async trx => {
                    for (const id of expectedSymbolDeleteManyRequestQuery.ids) {
                        const modelDataInstance = await deleteSingle(id, trx);
                        modelData.push(modelDataInstance);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${modelName} instances deleted successfully`,
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
        req: Request<SymbolTypes.SymbolDeleteSingleRequestParamsRaw>,
        res: Response<SymbolTypes.SymbolDeleteSingleResponseBody>,
        next: NextFunction
    ) => {
        try {
            const params = SymbolTypes.SymbolDeleteSingleRequestParamsFromRaw(
                req.params
            );
            let modelData:
                | SymbolTypes.SymbolDeleteSingleResponseBodyData
                | undefined;
            await KNEXION.transaction(
                async trx => {
                    modelData = await deleteSingle(params.id, trx);
                },
                { isolationLevel: 'serializable' }
            );
            if (undefined === modelData) {
                throw new Errors.ModelNotFoundError(
                    `Unable to find ${modelName} with id ${params.id}`
                );
            }
            return res.json({
                status: 'success',
                message: `${modelName} instance deleted successfully`,
                data: modelData,
            });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
