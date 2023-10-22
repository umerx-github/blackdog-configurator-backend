import { Router, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { ConfigSymbol } from '../db/models/ConfigSymbol.js';
import { ResponseBase } from '../interfaces/response.js';
import {
    NewConfigSymbolRequestInterface,
    NewConfigSymbolInterface,
    UpdateConfigSymbolRequestInterface,
    UpdateConfigSymbolInterface,
} from '../interfaces/db/models/index.js';

const router = Router();
const modelName = 'ConfigSymbol';

const ExpectedRequestConfigSymbolPost = z.object({
    configId: z.number(),
    symbolId: z.number(),
    order: z.number(),
});

const ExpectedRequestConfigSymbolPatch = z.object({
    configId: z.number().optional(),
    symbolId: z.number().optional(),
    order: z.number().optional(),
});

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

router.get('/', async (req, res: Response<ResponseBase<ConfigSymbol[]>>) => {
    const modelInstances = await ConfigSymbol.query().orderBy('id', 'desc');
    return res.json({
        status: 'success',
        message: `${modelName} instances retrieved successfully`,
        data: modelInstances,
    });
});

router.get(
    '/:id',
    async (req: Request, res: Response<ResponseBase<ConfigSymbol>>) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request params: "id" is required number',
            });
        }
        const modelInstance = await ConfigSymbol.query().findById(id);
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
        req: Request<{}, {}, NewConfigSymbolRequestInterface>,
        res: Response<ResponseBase<ConfigSymbol>>
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        try {
            const parsedRequest: NewConfigSymbolRequestInterface =
                ExpectedRequestConfigSymbolPost.parse(req.body);
            const modelData: NewConfigSymbolInterface = {
                ...parsedRequest,
            };
            const modelInstance = await ConfigSymbol.query().insertAndFetch(
                modelData
            );
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
        req: Request<{ id: string }, {}, UpdateConfigSymbolRequestInterface>,
        res: Response<ResponseBase<ConfigSymbol>>
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
            const parsedRequest: UpdateConfigSymbolRequestInterface =
                ExpectedRequestConfigSymbolPatch.parse(req.body);
            const modelData: UpdateConfigSymbolInterface = {
                ...parsedRequest,
            };
            const modelInstance = await ConfigSymbol.query().patchAndFetchById(
                id,
                modelData
            );
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
