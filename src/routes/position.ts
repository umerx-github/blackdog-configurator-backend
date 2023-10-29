import { ZodError, z } from 'zod';
import { Router, Request, Response } from 'express';
import { Position } from '../db/models/Position.js';
import {
    GetPositionsRequestInterface,
    ResponseBase,
} from '../interfaces/db/models/index.js';
import {
    NewPositionRequestInterface,
    NewPositionInterface,
    PositionStatusEnum,
} from '../interfaces/db/models/index.js';

const router = Router();
const modelName = 'Position';

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body
const ExpectedPositionsGetRequest = z.object({
    status: z.nativeEnum(PositionStatusEnum).optional(),
});

router.get('/', async (req, res: Response<ResponseBase<Position[]>>) => {
    const query = Position.query()
        .orderBy('id', 'desc')
        .withGraphFetched('symbol');
    try {
        const getPositionsManyRequestParsed: GetPositionsRequestInterface =
            ExpectedPositionsGetRequest.parse(req.query);
        if (getPositionsManyRequestParsed.status) {
            query.where('status', getPositionsManyRequestParsed.status);
        }
        const data = await query;
        return res.json({
            status: 'success',
            message: 'Position retrieved successfully',
            data,
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

router.post(
    '/',
    async (
        req: Request<{}, {}, NewPositionRequestInterface>,
        res: Response<ResponseBase<Position>>
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);
        if (
            typeof req?.body?.status !== 'string' ||
            !Object.values(PositionStatusEnum).includes(req?.body?.status)
        ) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid request body: "status" is required string and must be one of ${Object.values(
                    PositionStatusEnum
                ).join(',')}`,
            });
        }
        if (typeof req?.body?.buyOrderId !== 'number') {
            return res.status(400).json({
                status: 'error',
                message:
                    'Invalid request body: "buyOrderId" is required number',
            });
        }
        if (typeof req?.body?.symbolId !== 'number') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request body: "symbolId" is required number',
            });
        }
        const newPosition: NewPositionInterface = {
            status: req.body.status,
            buyOrderId: req.body.buyOrderId,
            symbolId: req.body.symbolId,
        };
        let responseObj = await Position.query()
            .insertAndFetch(newPosition)
            .withGraphFetched('buyOrder')
            .withGraphFetched('symbol');
        if (!responseObj) {
            return res.status(404).json({
                status: 'error',
                message: 'Position not found',
            });
        }
        return res.json({
            status: 'success',
            message: 'Position created successfully',
            data: responseObj,
        });
    }
);

export default router;
