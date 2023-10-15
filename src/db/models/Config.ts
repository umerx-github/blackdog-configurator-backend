import { Model } from 'objection';
import { Symbol } from './Symbol.js';
import {
    ConfigInterface,
    OrderedSymbolInterface,
} from '../../interfaces/db/models/index.js';

export type OrderedSymbolModel = Symbol & OrderedSymbolInterface;
// Person model.
export class Config extends Model implements ConfigInterface {
    id!: number;
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    createdAt!: string;
    isActive!: boolean;
    cashInCents!: number;
    sellAtPercentile!: number;
    buyAtPercentile!: number;
    sellTrailingPercent!: number;
    buyTrailingPercent!: number;
    timeframeInDays!: number;
    symbols!: OrderedSymbolInterface[];
    alpacaApiKey!: string;
    alpacaApiSecret!: string;
    static get tableName() {
        return 'config';
    }
    static get virtualAttributes() {
        return ['cashInDollars'];
    }
    get cashInDollars() {
        return this.cashInCents / 100;
    }
    static get jsonSchema() {
        return {
            type: 'object',
            // required: ['createdAt'],
            properties: {
                id: { type: 'number' },
                createdAt: { type: 'string' },
                isActive: { type: 'boolean' },
                cashInCents: { type: 'number' },
                sellAtPercentile: { type: 'number' },
                buyAtPercentile: { type: 'number' },
                sellTrailingPercent: { type: 'number' },
                buyTrailingPercent: { type: 'number' },
                timeframeInDays: { type: 'number' },
                alpacaApiKey: { type: 'string' },
                alpacaApiSecret: { type: 'string' },
            },
        };
    }
    static relationMappings = () => {
        return {
            symbols: {
                relation: Model.ManyToManyRelation,
                modelClass: Symbol,
                join: {
                    from: 'config.id',
                    through: {
                        // configSymbol is the join table
                        from: 'configSymbol.configId',
                        to: 'configSymbol.symbolId',
                        extra: ['order'],
                    },
                    to: 'symbol.id',
                },
            },
        };
    };
}
