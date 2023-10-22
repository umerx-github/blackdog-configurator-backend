import { Router, Request, Response } from 'express';
import { Symbol } from '../db/models/Symbol.js';
import { ResponseBase } from '../interfaces/db/models/index.js';
import { NewSymbolRequestInterface } from '../interfaces/db/models/index.js';

const router = Router();

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

router.get('/', async (req, res: Response<ResponseBase<Symbol[]>>) => {
    const symbols = await Symbol.query();
    if (!symbols) {
        return res.status(404).json({
            status: 'error',
            message: 'No symbols found',
        });
    }
    return res.json({
        status: 'success',
        message: 'Symbols retrieved successfully',
        data: symbols,
    });
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
