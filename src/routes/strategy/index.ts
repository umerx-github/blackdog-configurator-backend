import { Strategy as StrategyModel } from '../../db/models/Strategy.js';
import { Strategy as StrategyTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import { parse } from 'path';
import { z, ZodError } from 'zod';
import { KNEXION } from '../../index.js';

const router = Router();
const modelName = 'Strategy';

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
        res: Response<StrategyTypes.StrategyGetManyResponseBody>
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
            const data = await query;
            return res.json({
                status: 'success',
                message: `${modelName} instances retrieved successfully`,
                data: data,
            });
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request query: ${err.message}`,
                });
            }
            throw err;
        }
    }
);

router.get(
    '/:id',
    async (
        req: Request<StrategyTypes.StrategyGetSingleRequestParamsRaw>,
        res: Response<StrategyTypes.StrategyGetSingleResponseBody>
    ) => {
        try {
            const params = StrategyTypes.StrategyGetSingleRequestParamsFromRaw(
                req.params
            );
            const modelData = await StrategyModel.query().findById(params.id);
            if (!modelData) {
                return res.status(404).json({
                    status: 'error',
                    message: `${modelName} not found`,
                });
            }
            return res.json({
                status: 'success',
                message: `${modelName} retrieved successfully`,
                data: modelData,
            });
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request params: ${err.message}`,
                });
            }
        }
    }
);

router.post(
    '/',
    async (
        req: Request<any, any, StrategyTypes.StrategyPostManyRequestBody>,
        res: Response<StrategyTypes.StrategyPostManyResponseBody>
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
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${modelName} created successfully`,
                data: modelData,
            });
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request body: ${e.message}`,
                });
            }
            throw e;
        }
    }
);

router.patch(
    '/',
    async (
        req: Request<any, any, StrategyTypes.StrategyPatchManyRequestBody>,
        res: Response<StrategyTypes.StrategyPatchManyResponseBody>
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
                        modelData.push(model);
                    }
                },
                { isolationLevel: 'serializable' }
            );
            return res.json({
                status: 'success',
                message: `${modelName} created successfully`,
                data: modelData,
            });
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request body: ${e.message}`,
                });
            }
            throw e;
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
        res: Response<StrategyTypes.StrategyPatchSingleResponseBody>
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const params = StrategyTypes.StrategyGetSingleRequestParamsFromRaw(
                req.params
            );
            const parsedRequest: StrategyTypes.StrategyPatchSingleRequestBody =
                StrategyTypes.StrategyPatchSingleRequestBodyFromRaw(req.body);
            const modelData = await StrategyModel.query().patchAndFetchById(
                params.id,
                parsedRequest
            );
            if (!modelData) {
                return res.status(404).json({
                    status: 'error',
                    message: `${modelName} not found`,
                });
            }
            return res.json({
                status: 'success',
                message: `${modelName} created successfully`,
                data: modelData,
            });
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid request body: ${e.message}`,
                });
            }
            throw e;
        }
    }
);

// router.patch(
//     '/:id',
//     async (
//         req: Request<{ id: string }, {}, UpdateConfigRequestInterface>,
//         res: Response<ResponseBase<StrategyTemplateSeaDogDiscountScheme>>
//     ) => {
//         const id = parseInt(req.params.id);
//         if (isNaN(id)) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid request params: "id" is required number',
//             });
//         }
//         // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
//         try {
//             const parsedRequest: UpdateConfigRequestInterface =
//                 ExpectedRequestConfigPatch.parse(req.body);
//             const modelData: UpdateConfigInterface = {
//                 ...parsedRequest,
//             };
//             if (parsedRequest.cashInDollars) {
//                 modelData.cashInCents = parsedRequest.cashInDollars * 100;
//             }
//             const initialModelInstance =
//                 await StrategyTemplateSeaDogDiscountScheme.query().patchAndFetchById(
//                     id,
//                     modelData
//                 );
//             if (!initialModelInstance) {
//                 throw new Error(`Failed to update ${modelName}`);
//             }
//             if (parsedRequest.configSymbols) {
//                 // Delete existing
//                 await initialModelInstance
//                     .$relatedQuery<ConfigSymbol>('configSymbols')
//                     .delete();
//                 // Add new
//                 parsedRequest.configSymbols.forEach(async configSymbol => {
//                     await initialModelInstance
//                         .$relatedQuery<ConfigSymbol>('configSymbols')
//                         .insert(configSymbol);
//                 });
//             }
//             const modelInstance =
//                 await StrategyTemplateSeaDogDiscountScheme.query()
//                     .findById(initialModelInstance.id)
//                     .withGraphFetched('configSymbols');
//             if (!modelInstance) {
//                 throw new Error(`Failed to update ${modelName}`);
//             }
//             return res.json({
//                 status: 'success',
//                 message: `${modelName} updated successfully`,
//                 data: modelInstance,
//             });
//         } catch (e) {
//             if (e instanceof ZodError) {
//                 return res.status(400).json({
//                     status: 'error',
//                     message: `Invalid request body: ${e.message}`,
//                 });
//             }
//             throw e;
//         }
//     }
// );

export default router;
