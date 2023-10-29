import { Router, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { Config } from '../db/models/Config.js';
import {
    GetConfigsRequestInterface,
    ResponseBase,
} from '../interfaces/db/models/index.js';
import {
    NewConfigRequestInterface,
    NewConfigInterface,
    UpdateConfigRequestInterface,
    UpdateConfigInterface,
} from '../interfaces/db/models/index.js';
import { parse } from 'path';
import { ConfigSymbol } from '..//db/models/ConfigSymbol.js';

const router = Router();
const modelName = 'Config';

const ExpectedGetConfigsRequest = z
    .object({
        isActive: z
            .string()
            .optional()
            .transform(str => {
                if (str === 'true') {
                    return true;
                }
                if (str === 'false') {
                    return false;
                }
                return undefined;
            }),
    })
    .transform(obj => {
        if (obj.isActive === undefined) {
            delete obj.isActive;
        }
        return obj;
    });

const ExpectedRequestConfigPost = z.object({
    isActive: z.boolean(),
    sellAtPercentile: z.number(),
    buyAtPercentile: z.number(),
    sellTrailingPercent: z.number(),
    buyTrailingPercent: z.number(),
    minimumGainPercent: z.number(),
    timeframeInDays: z.number(),
    alpacaApiKey: z.string(),
    alpacaApiSecret: z.string(),
    cashInDollars: z.number(),
    configSymbols: z.array(
        z.object({
            symbolId: z.number(),
            order: z.number(),
        })
    ),
});

const ExpectedRequestConfigPatch = z.object({
    isActive: z.boolean().optional(),
    sellAtPercentile: z.number().optional(),
    buyAtPercentile: z.number().optional(),
    sellTrailingPercent: z.number().optional(),
    buyTrailingPercent: z.number().optional(),
    minimumGainPercent: z.number().optional(),
    timeframeInDays: z.number().optional(),
    alpacaApiKey: z.string().optional(),
    alpacaApiSecret: z.string().optional(),
    cashInDollars: z.number().optional(),
    configSymbols: z
        .array(
            z.object({
                symbolId: z.number(),
                order: z.number(),
            })
        )
        .optional(),
});

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

router.get('/', async (req, res: Response<ResponseBase<Config[]>>) => {
    const query = Config.query()
        .orderBy('id', 'desc')
        .withGraphFetched('configSymbols');
    try {
        const expectedGetConfigsRequest: GetConfigsRequestInterface =
            ExpectedGetConfigsRequest.parse(req.query);
        if (undefined !== expectedGetConfigsRequest.isActive) {
            query.where('isActive', expectedGetConfigsRequest.isActive);
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
});

router.get(
    '/:id',
    async (req: Request, res: Response<ResponseBase<Config>>) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request params: "id" is required number',
            });
        }
        const modelInstance = await Config.query()
            .findById(id)
            .withGraphFetched('configSymbols');
        if (!modelInstance) {
            return res.status(404).json({
                status: 'error',
                message: `${modelName} not found`,
            });
        }
        return res.json({
            status: 'success',
            message: `${modelName} retrieved successfully`,
            data: modelInstance,
        });
    }
);

router.post(
    '/',
    async (
        req: Request<{}, {}, NewConfigRequestInterface>,
        res: Response<ResponseBase<Config>>
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: NewConfigRequestInterface =
                ExpectedRequestConfigPost.parse(req.body);
            const modelData: NewConfigInterface = {
                ...parsedRequest,
                cashInCents: parsedRequest.cashInDollars * 100,
            };
            const initialModelInstance = await Config.query().insert({
                ...modelData,
            });
            parsedRequest.configSymbols.forEach(async configSymbol => {
                await initialModelInstance
                    .$relatedQuery<ConfigSymbol>('configSymbols')
                    .insert(configSymbol);
            });
            const modelInstance = await Config.query()
                .findById(initialModelInstance.id)
                .withGraphFetched('configSymbols');
            if (!modelInstance) {
                throw new Error(`Failed to create ${modelName}`);
            }
            return res.json({
                status: 'success',
                message: `${modelName} created successfully`,
                data: modelInstance,
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
        req: Request<{ id: string }, {}, UpdateConfigRequestInterface>,
        res: Response<ResponseBase<Config>>
    ) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request params: "id" is required number',
            });
        }
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: UpdateConfigRequestInterface =
                ExpectedRequestConfigPatch.parse(req.body);
            const modelData: UpdateConfigInterface = {
                ...parsedRequest,
            };
            if (parsedRequest.cashInDollars) {
                modelData.cashInCents = parsedRequest.cashInDollars * 100;
            }
            const initialModelInstance = await Config.query().patchAndFetchById(
                id,
                modelData
            );
            if (!initialModelInstance) {
                throw new Error(`Failed to update ${modelName}`);
            }
            if (parsedRequest.configSymbols) {
                // Delete existing
                await initialModelInstance
                    .$relatedQuery<ConfigSymbol>('configSymbols')
                    .delete();
                // Add new
                parsedRequest.configSymbols.forEach(async configSymbol => {
                    await initialModelInstance
                        .$relatedQuery<ConfigSymbol>('configSymbols')
                        .insert(configSymbol);
                });
            }
            const modelInstance = await Config.query()
                .findById(initialModelInstance.id)
                .withGraphFetched('configSymbols');
            if (!modelInstance) {
                throw new Error(`Failed to update ${modelName}`);
            }
            return res.json({
                status: 'success',
                message: `${modelName} updated successfully`,
                data: modelInstance,
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

export default router;
