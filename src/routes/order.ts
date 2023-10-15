import { Router, Request, Response } from 'express';
import { Order } from '../db/models/Order.js';
import { ResponseBase } from '../interfaces/response.js';
import {
    NewOrderRequestInterface,
    NewOrderInterface,
    OrderTypeEnum,
    SideEnum,
} from '../interfaces/db/models/index.js';

const router = Router();

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

router.get('/', async (req, res: Response<ResponseBase<Order[]>>) => {
    const data = await Order.query()
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
        req: Request<{}, {}, NewOrderRequestInterface>,
        res: Response<ResponseBase<Order>>
    ) => {
        // https://vincit.github.io/objection.js/guide/query-examples.html#relation-relate-queries);

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
            typeof req?.body?.side !== 'string' &&
            Object.values(SideEnum).includes(req?.body?.side)
        ) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid request body: "side" is required string and must be one of ${Object.values(
                    SideEnum
                ).join(',')}`,
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

        const newOrder: NewOrderInterface = {
            configId: req.body.configId,
            symbolId: req.body.symbolId,
            alpacaOrderId: req.body.alpacaOrderId,
            side: req.body.side,
            type: req.body.type,
            priceInCents: req.body.priceInDollars * 100,
        };

        let responseObj = await Order.query()
            .insertAndFetch(newOrder)
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
