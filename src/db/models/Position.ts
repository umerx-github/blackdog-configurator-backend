import { Model } from 'objection';
import { Symbol } from './Symbol.js';
import {
    PositionInterface,
    StatusEnum,
} from '../../interfaces/db/models/index.js';
import { BuyOrder } from './BuyOrder.js';

// Person model.
export class Position extends Model implements PositionInterface {
    id!: number;
    status!: StatusEnum;
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    // configId!: number;
    buyOrderId!: number;
    buyOrder!: BuyOrder;
    symbolId!: number;
    symbol!: Symbol;
    createdAt!: string;
    static get tableName() {
        return 'position';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            // required: ['createdAt'],
            properties: {
                id: { type: 'number' },
                status: { type: 'number', enum: Object.values(StatusEnum) },
                buyOrderId: { type: 'number' },
                symbolId: { type: 'number' },
                createdAt: { type: 'string' },
            },
        };
    }
    static relationMappings = () => {
        return {
            symbol: {
                relation: Model.BelongsToOneRelation,
                modelClass: Symbol,
                join: {
                    from: 'position.symbolId',
                    to: 'symbol.id',
                },
            },
            buyOrder: {
                relation: Model.BelongsToOneRelation,
                modelClass: BuyOrder,
                join: {
                    from: 'position.buyOrderId',
                    to: 'buyOrder.id',
                },
            },
        };
    };
}
