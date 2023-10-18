import { Model } from 'objection';
import { Symbol } from './Symbol.js';
import {
    ConfigInterface,
    BuyOrderInterface,
    OrderTypeEnum,
    OrderStatusEnum,
} from '../../interfaces/db/models/index.js';
import { Config } from './Config.js';

// Person model.
export class BuyOrder extends Model implements BuyOrderInterface {
    id!: number;
    status!: OrderStatusEnum;
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    configId!: number;
    symbolId!: number;
    config!: ConfigInterface;
    symbol!: Symbol;
    alpacaOrderId!: string;
    type!: OrderTypeEnum;
    priceInCents!: number;
    createdAt!: string;
    static get tableName() {
        return 'buyOrder';
    }
    static get virtualAttributes() {
        return ['cashInDollars'];
    }
    get priceInDollars() {
        return this.priceInCents / 100;
    }
    static get jsonSchema() {
        return {
            type: 'object',
            // required: ['createdAt'],
            properties: {
                id: { type: 'number' },
                status: {
                    type: 'string',
                    enum: Object.values(OrderStatusEnum),
                },
                configId: { type: 'number' },
                symbolId: { type: 'number' },
                createdAt: { type: 'string' },
                type: {
                    type: 'string',
                    enum: Object.values(OrderTypeEnum),
                },
                priceInCents: { type: 'number' },
            },
        };
    }
    static relationMappings = () => {
        return {
            config: {
                relation: Model.BelongsToOneRelation,
                modelClass: Config,
                join: {
                    from: 'buyOrder.configId',
                    to: 'config.id',
                },
            },
            symbol: {
                relation: Model.BelongsToOneRelation,
                modelClass: Symbol,
                join: {
                    from: 'buyOrder.symbolId',
                    to: 'symbol.id',
                },
            },
        };
    };
}
