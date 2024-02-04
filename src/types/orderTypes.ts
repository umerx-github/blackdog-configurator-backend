import { z } from 'zod';
import {
    Order as OrderTypes,
    Position as PositionTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';

export interface OrderFillPostSingleRequestParamsRaw {
    id: string;
}

export interface OrderFillPostSingleRequestParams {
    id: number;
}

export type OrderFillPostSingleRequestBody = never;
export interface OrderFillPostSingleResponseBody {
    status: string;
    message: string;
    data: {
        order: OrderTypes.OrderResponseBodyDataInstance;
        position: PositionTypes.PositionResponseBodyDataInstance;
    };
}

export const OrderFillPostSingleRequestParamsExpected = z.object({
    id: z.string().regex(/^\d+$/),
});

export function OrderFillPostSingleRequestParamsFromRaw(
    raw: OrderFillPostSingleRequestParamsRaw
): OrderFillPostSingleRequestParams {
    const parsed = OrderFillPostSingleRequestParamsExpected.parse(raw);
    return { id: parseInt(parsed.id) };
}
