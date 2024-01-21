import { Strategy as StrategyModel } from '../../db/models/Strategy.js';
import { Strategy as StrategyTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Router, Request, Response } from 'express';
import { z, ZodError } from 'zod';

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
            StrategyTypes.StrategyGetManyRequestParamsRaw
        >,
        res: Response<StrategyTypes.StrategyGetManyResponseBody>
    ) => {
        const query = StrategyModel.query().orderBy('id', 'desc');
        // .withGraphFetched('configSymbols');
        try {
            const expectedStrategyGetManyRequestParams: StrategyTypes.StrategyGetManyRequestParams =
                StrategyTypes.StrategyGetManyRequestParamsFromRaw(req.query);
            if (undefined !== expectedStrategyGetManyRequestParams.status) {
                query.where(
                    'status',
                    expectedStrategyGetManyRequestParams.status
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

// router.get(
//     '/:id',
//     async (
//         req: Request,
//         res: Response<ResponseBase<StrategyTemplateSeaDogDiscountScheme>>
//     ) => {
//         const id = parseInt(req.params.id);
//         if (isNaN(id)) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Invalid request params: "id" is required number',
//             });
//         }
//         const modelInstance = await StrategyTemplateSeaDogDiscountScheme.query()
//             .findById(id)
//             .withGraphFetched('configSymbols');
//         if (!modelInstance) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: `${modelName} not found`,
//             });
//         }
//         return res.json({
//             status: 'success',
//             message: `${modelName} retrieved successfully`,
//             data: modelInstance,
//         });
//     }
// );

// router.post(
//     '/',
//     async (
//         req: Request<{}, {}, NewConfigRequestInterface>,
//         res: Response<ResponseBase<StrategyTemplateSeaDogDiscountScheme>>
//     ) => {
//         // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
//         try {
//             const parsedRequest: NewConfigRequestInterface =
//                 ExpectedRequestConfigPost.parse(req.body);
//             const modelData: NewConfigInterface = {
//                 ...parsedRequest,
//                 cashInCents: parsedRequest.cashInDollars * 100,
//             };
//             const initialModelInstance =
//                 await StrategyTemplateSeaDogDiscountScheme.query().insert({
//                     ...modelData,
//                 });
//             parsedRequest.configSymbols.forEach(async configSymbol => {
//                 await initialModelInstance
//                     .$relatedQuery<ConfigSymbol>('configSymbols')
//                     .insert(configSymbol);
//             });
//             const modelInstance =
//                 await StrategyTemplateSeaDogDiscountScheme.query()
//                     .findById(initialModelInstance.id)
//                     .withGraphFetched('configSymbols');
//             if (!modelInstance) {
//                 throw new Error(`Failed to create ${modelName}`);
//             }
//             return res.json({
//                 status: 'success',
//                 message: `${modelName} created successfully`,
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
