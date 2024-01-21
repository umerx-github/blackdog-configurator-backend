import { Model } from 'objection';
import { Symbol } from './Symbol.js';
import {
    ConfigInterface,
    BuyOrderInterface,
    OrderTypeEnum,
    OrderStatusEnum,
} from '../../interfaces/db/models/index.js';
import { StrategyTemplateSeaDogDiscountScheme } from './StrategyTemplateSeaDogDiscountScheme.js';
import { Position } from './Position.js';

// Person model.
export class SellOrder extends Model implements BuyOrderInterface {
    id!: number;
    status!: OrderStatusEnum;
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    positionId!: number;
    position!: Position;
    configId!: number;
    symbolId!: number;
    config!: ConfigInterface;
    symbol!: Symbol;
    alpacaOrderId!: string;
    type!: OrderTypeEnum;
    priceInCents!: number;
    createdAt!: string;
    static get tableName() {
        return 'sellOrder';
    }
    static get virtualAttributes() {
        return ['priceInDollars'];
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
                positionId: { type: 'number' },
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
                modelClass: StrategyTemplateSeaDogDiscountScheme,
                join: {
                    from: 'sellOrder.configId',
                    to: 'config.id',
                },
            },
            symbol: {
                relation: Model.BelongsToOneRelation,
                modelClass: Symbol,
                join: {
                    from: 'sellOrder.symbolId',
                    to: 'symbol.id',
                },
            },
            position: {
                relation: Model.BelongsToOneRelation,
                modelClass: Position,
                join: {
                    from: 'sellOrder.positionId',
                    to: 'position.id',
                },
            },
        };
    };
}
