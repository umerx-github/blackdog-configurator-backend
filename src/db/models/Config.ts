import { Model } from 'objection';
import { Symbol } from './Symbol.js';

export interface OrderedSymbol extends Symbol {
    order: number;
}

// Person model.
export class Config extends Model {
    id!: number;
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    createdAt!: string;
    isActive!: boolean;
    sellAtPercentile!: number;
    buyAtPercentile!: number;
    buyTrailingPercent!: number;
    sellTrailingPercent!: number;
    timeframeInDays!: number;
    symbols!: OrderedSymbol[];
    static get tableName() {
        return 'config';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            // required: ['createdAt'],
            properties: {
                id: { type: 'number' },
                createdAt: { type: 'string' },
                isActive: { type: 'boolean' },
                sellAtPercentile: { type: 'number' },
                buyAtPercentile: { type: 'number' },
                buyTrailingPercent: { type: 'number' },
                sellTrailingPercent: { type: 'number' },
                timeframeInDays: { type: 'number' },
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
