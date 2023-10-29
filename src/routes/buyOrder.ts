import { ZodError, z } from 'zod';
import { Router, Request, Response } from 'express';
import { BuyOrder } from '../db/models/BuyOrder.js';
import { ResponseBase } from '../interfaces/db/models/index.js';
import {
    NewBuyOrderRequestInterface,
    NewBuyOrderInterface,
    OrderTypeEnum,
    OrderStatusEnum,
    GetBuyOrdersRequestInterface,
    PatchBuyOrderRequestInterface,
    UpdateBuyOrderInterface,
} from '../interfaces/db/models/index.js';

const router = Router();
const modelName = 'BuyOrder';

// Typing Express Request: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body

const ExpectedGetBuyOrderManyRequest = z.object({
    status: z.nativeEnum(OrderStatusEnum).optional(),
});

const ExpectedPathBuyOrderRequest = z.object({
    status: z.nativeEnum(OrderStatusEnum).optional(),
});

router.get(
    '/',
    async (req: Request, res: Response<ResponseBase<BuyOrder[]>>) => {
        const query = BuyOrder.query().orderBy('id', 'desc');
        // .withGraphFetched('config')
        // .withGraphFetched('symbol');
        try {
            const getBuyOrderManyRequestParsed: GetBuyOrdersRequestInterface =
                ExpectedGetBuyOrderManyRequest.parse(req.query);
            if (getBuyOrderManyRequestParsed.status) {
                query.where('status', getBuyOrderManyRequestParsed.status);
            }
            const data = await query;
            return res.json({
                status: 'success',
                message: 'Order retrieved successfully',
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
    }
);

router.post(
    '/',
    async (
        req: Request<{}, {}, NewBuyOrderRequestInterface>,
        res: Response<ResponseBase<BuyOrder>>
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

        const newOrder: NewBuyOrderInterface = {
            status: req.body.status,
            configId: req.body.configId,
            symbolId: req.body.symbolId,
            alpacaOrderId: req.body.alpacaOrderId,
            type: req.body.type,
            priceInCents: req.body.priceInDollars * 100,
        };

        let responseObj = await BuyOrder.query().insertAndFetch(newOrder);
        // .withGraphFetched('config')
        // .withGraphFetched('symbol');
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

router.delete('/:id', async (req, res: Response<ResponseBase<BuyOrder>>) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid request params: "id" is required number',
        });
    }
    const buyOrder = await BuyOrder.query().findById(id);
    // .withGraphFetched('config')
    // .withGraphFetched('symbol');
    if (!buyOrder) {
        return res.status(404).json({
            status: 'error',
            message: 'Order not found',
        });
    }
    const responseObj = await buyOrder.$query().delete();
    return res.json({
        status: 'success',
        message: 'Order deleted successfully',
        data: buyOrder,
    });
});

router.patch(
    '/:id',
    async (
        req: Request<{ id: string }>,
        res: Response<ResponseBase<BuyOrder>>
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
            const parsedRequest: PatchBuyOrderRequestInterface =
                ExpectedPathBuyOrderRequest.parse(req.body);
            const modelData: UpdateBuyOrderInterface = {
                ...parsedRequest,
            };
            const modelInstance = await BuyOrder.query().patchAndFetchById(
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
