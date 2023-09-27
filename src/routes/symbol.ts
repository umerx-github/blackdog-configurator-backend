import { Router, Request } from 'express';
import { Symbol } from '../db/models/Symbol.js';

const router = Router();

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

interface SymbolRequestPost {
    name: string;
}

router.get('/', async (req, res) => {
    const symbols = await Symbol.query();
    return res.json(symbols);
});

router.post('/', async (req: Request<{}, {}, SymbolRequestPost>, res) => {
    // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries
    if (typeof req?.body?.name !== 'string') {
        return res.status(400).json({
            message: 'Invalid request body: "name" is required string',
        });
    }
    const symbol = await Symbol.query().insertAndFetch({ name: req.body.name });
    return res.json(symbol);
});

export default router;
