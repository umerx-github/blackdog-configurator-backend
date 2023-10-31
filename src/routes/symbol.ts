import { ZodError, z } from 'zod';
import { Router, Request, Response } from 'express';
import { Symbol } from '../db/models/Symbol.js';
import {
    GetSymbolsRequestInterface,
    ResponseBase,
} from '../interfaces/db/models/index.js';
import { NewSymbolRequestInterface } from '../interfaces/db/models/index.js';

const router = Router();

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body
const ExpectedSymbolsGetRequest = z.object({
    name: z.string().optional(),
    ids: z
        .string()
        .regex(/^\d+(,\d+)*$/)
        .optional(),
});

router.get('/', async (req, res: Response<ResponseBase<Symbol[]>>) => {
    const symbolQuery = Symbol.query();
    try {
        const getSymbolManyRequestParsed: GetSymbolsRequestInterface =
            ExpectedSymbolsGetRequest.parse(req.query);
        if (getSymbolManyRequestParsed.name) {
            symbolQuery.where('name', getSymbolManyRequestParsed.name);
        }
        if (getSymbolManyRequestParsed.ids) {
            symbolQuery.whereIn(
                'id',
                getSymbolManyRequestParsed.ids.split(',')
            );
        }
        const symbols = await symbolQuery;
        return res.json({
            status: 'success',
            message: 'Symbols retrieved successfully',
            data: symbols,
        });
    } catch (e) {
        if (e instanceof ZodError) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid request query: ${e.message}`,
            });
        }
        throw e;
    }
});

router.post(
    '/',
    async (
        req: Request<{}, {}, NewSymbolRequestInterface>,
        res: Response<ResponseBase<Symbol>>
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries
        if (typeof req?.body?.name !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request body: "name" is required string',
            });
        }
        const symbol = await Symbol.query().insertAndFetch({
            name: req.body.name,
        });
        if (!symbol) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to create symbol',
            });
        }
        return res.json({
            status: 'success',
            message: 'Symbol created successfully',
            data: symbol,
        });
    }
);

export default router;
