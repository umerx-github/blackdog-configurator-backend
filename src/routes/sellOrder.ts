import { Router, Request, Response } from 'express';
import { SellOrder } from '../db/models/SellOrder.js';
import { ResponseBase } from '../interfaces/response.js';
import {
    NewSellOrderRequestInterface,
    NewSellOrderInterface,
    OrderTypeEnum,
    OrderStatusEnum,
} from '../interfaces/db/models/index.js';

const router = Router();

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

router.get('/', async (req, res: Response<ResponseBase<SellOrder[]>>) => {
    const data = await SellOrder.query()
        .orderBy('id', 'desc')
        .withGraphFetched('config')
        .withGraphFetched('symbol');
    return res.json({
        status: 'success',
        message: 'Order retrieved successfully',
        data,
    });
});

router.post(
    '/',
    async (
        req: Request<{}, {}, NewSellOrderRequestInterface>,
        res: Response<ResponseBase<SellOrder>>
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);

        if (
            typeof req?.body?.status !== 'string' ||
            !Object.values(OrderStatusEnum).includes(req?.body?.status)
        ) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid request body: "status" is required string and must be one of ${Object.values(
                    OrderStatusEnum
                ).join(',')}`,
            });
        }
        if (typeof req?.body?.positionId !== 'number') {
            return res.status(400).json({
                status: 'error',
                message:
                    'Invalid request body: "positionId" is required number',
            });
        }
        if (typeof req?.body?.configId !== 'number') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request body: "configId" is required number',
            });
        }
        if (typeof req?.body?.symbolId !== 'number') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request body: "symbolId" is required number',
            });
        }
        if (typeof req?.body?.alpacaOrderId !== 'string') {
            return res.status(400).json({
                status: 'error',
                message:
                    'Invalid request body: "alpacaOrderId" is required string',
            });
        }
        if (
            typeof req?.body?.type !== 'string' &&
            Object.values(OrderTypeEnum).includes(req?.body?.type)
        ) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid request body: "type" is required string and must be one of ${Object.values(
                    OrderTypeEnum
                ).join(',')}`,
            });
        }
        if (typeof req?.body?.priceInDollars !== 'number') {
            return res.status(400).json({
                status: 'error',
                message:
                    'Invalid request body: "priceInDollars" is required number',
            });
        }

        const newOrder: NewSellOrderInterface = {
            status: req.body.status,
            positionId: req.body.positionId,
            configId: req.body.configId,
            symbolId: req.body.symbolId,
            alpacaOrderId: req.body.alpacaOrderId,
            type: req.body.type,
            priceInCents: req.body.priceInDollars * 100,
        };

        let responseObj = await SellOrder.query()
            .insertAndFetch(newOrder)
            .withGraphFetched('position')
            .withGraphFetched('config')
            .withGraphFetched('symbol');
        if (!responseObj) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found',
            });
        }
        return res.json({
            status: 'success',
            message: 'Order created successfully',
            data: responseObj,
        });
    }
);

export default router;
