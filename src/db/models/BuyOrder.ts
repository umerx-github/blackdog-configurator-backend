import { Model } from 'objection';
import { Symbol } from './Symbol.js';
import {
    ConfigInterface,
    OrderInterface,
    OrderTypeEnum,
    SideEnum,
    StatusEnum,
} from '../../interfaces/db/models/index.js';
import { Config } from './Config.js';

// Person model.
export class BuyOrder extends Model implements OrderInterface {
    id!: number;
    status!: StatusEnum;
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    configId!: number;
    symbolId!: number;
    config!: ConfigInterface;
    symbol!: Symbol;
    alpacaOrderId!: string;
    side!: SideEnum;
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
                    enum: Object.values(StatusEnum),
                },
                configId: { type: 'number' },
                symbolId: { type: 'number' },
                createdAt: { type: 'string' },
                side: {
                    type: 'string',
                    enum: Object.values(SideEnum),
                },
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
                    from: 'order.configId',
                    to: 'config.id',
                },
            },
            symbol: {
                relation: Model.BelongsToOneRelation,
                modelClass: Symbol,
                join: {
                    from: 'order.symbolId',
                    to: 'symbol.id',
                },
            },
        };
    };
}
