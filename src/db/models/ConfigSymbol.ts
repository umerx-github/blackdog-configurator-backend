import { Model } from 'objection';
import { Symbol } from './Symbol.js';
import { StrategyTemplateSeaDogDiscountScheme } from './StrategyTemplateSeaDogDiscountScheme.js';
import { ConfigSymbolInterface } from '../../interfaces/db/models/index.js';
import { symbol } from 'zod';

// Person model.
export class ConfigSymbol extends Model implements ConfigSymbolInterface {
    id!: number;
    createdAt!: string;
    configId!: number;
    config!: StrategyTemplateSeaDogDiscountScheme;
    symbolId!: number;
    symbol!: Symbol;
    order!: number;
    static get tableName() {
        return 'configSymbol';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            // required: ['createdAt'],
            properties: {
                id: { type: 'number' },
                configId: { type: 'number' },
                symbolId: { type: 'number' },
                order: { type: 'number' },
            },
        };
    }
    static relationMappings = () => {
        return {
            config: {
                relation: Model.BelongsToOneRelation,
                modelClass: StrategyTemplateSeaDogDiscountScheme,
                join: {
                    from: 'configSymbol.configId',
                    to: 'config.id',
                },
            },
            symbol: {
                relation: Model.BelongsToOneRelation,
                modelClass: Symbol,
                join: {
                    from: 'configSymbol.symbolId',
                    to: 'symbol.id',
                },
            },
        };
    };
}
