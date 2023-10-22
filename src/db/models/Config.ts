import { Model } from 'objection';
import {
    ConfigInterface,
    ConfigSymbolInterface,
} from '../../interfaces/db/models/index.js';
import { ConfigSymbol } from './ConfigSymbol.js';

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
    minimumGainPercent!: number;
    timeframeInDays!: number;
    alpacaApiKey!: string;
    alpacaApiSecret!: string;
    configSymbols!: ConfigSymbolInterface[];
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
                minimumGainPercent: { type: 'number' },
                timeframeInDays: { type: 'number' },
                alpacaApiKey: { type: 'string' },
                alpacaApiSecret: { type: 'string' },
            },
        };
    }
    static relationMappings = () => {
        return {
            configSymbols: {
                relation: Model.HasManyRelation,
                modelClass: ConfigSymbol,
                join: {
                    from: 'config.id',
                    to: 'configSymbol.configId',
                },
            },
        };
    };
}
