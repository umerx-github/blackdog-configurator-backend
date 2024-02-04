import { Model } from 'objection';
import { Order as OrderTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';

export class Order extends Model implements OrderTypes.OrderModelInterface {
    id!: number;
    strategyId!: number;
    symbolId!: number;
    alpacaOrderId!: string;
    status!: OrderTypes.Status;
    side!: OrderTypes.Side;
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    static get tableName() {
        return 'order';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            properties: {
                id: { type: 'number' },
                strategyId: { type: 'number' },
                symbolId: { type: 'number' },
                alpacaOrderId: { type: 'string' },
                status: { type: 'string' },
                side: { type: 'string' },
            },
        };
    }
    static relationMappings = () => {
        return {};
    };
}
