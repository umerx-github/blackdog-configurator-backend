import { Router, Request, Response } from 'express';
import { Position } from '../db/models/Position.js';
import { ResponseBase } from '../interfaces/response.js';
import {
    NewPositionRequestInterface,
    NewPositionInterface,
    PositionStatusEnum,
} from '../interfaces/db/models/index.js';

const router = Router();

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

router.get('/', async (req, res: Response<ResponseBase<Position[]>>) => {
    const data = await Position.query()
        .orderBy('id', 'desc')
        .withGraphFetched('symbol');
    return res.json({
        status: 'success',
        message: 'Position retrieved successfully',
        data,
    });
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
