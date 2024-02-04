import { Model } from 'objection';
import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Strategy as StrategyModel } from './Strategy.js';
import { Symbol as SymbolModel } from './Symbol.js';
import { SymbolModelInterface } from '@umerx/umerx-blackdog-configurator-types-typescript/build/src/symbol.js';

export class StrategyTemplateSeaDogDiscountScheme
    extends Model
    implements
        StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeModelInterface
{
    id!: number;
    strategyId!: number;
    status!: StrategyTemplateSeaDogDiscountSchemeTypes.Status;
    cashInCents!: number;
    sellAtPercentile!: number;
    alpacaAPIKey!: string;
    alpacaAPISecret!: string;
    alpacaAPIPaper!: boolean;
    symbols?: SymbolModelInterface[];
    // symbolIds!: number[];
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    static get tableName() {
        return 'strategyTemplateSeaDogDiscountScheme';
    }
    static get tableNameJunctionSymbol() {
        return 'strategyTemplateSeaDogDiscountSchemeSymbol';
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
                strategyId: { type: 'number' },
                status: { type: 'string' },
                cashInCents: { type: 'number' },
                sellAtPercentile: { type: 'number' },
                symbolIds: { type: 'array' },
            },
        };
    }
    static relationMappings = () => {
        return {
            strategy: {
                relation: Model.HasOneRelation,
                modelClass: StrategyModel,
                join: {
                    from: `${StrategyTemplateSeaDogDiscountScheme.tableName}.strategyId`,
                    to: 'strategy.id',
                },
            },
            symbols: {
                relation: Model.ManyToManyRelation,
                modelClass: SymbolModel,
                join: {
                    from: `${StrategyTemplateSeaDogDiscountScheme.tableName}.id`,
                    through: {
                        from: `${StrategyTemplateSeaDogDiscountScheme.tableNameJunctionSymbol}.strategyTemplateSeaDogDiscountSchemeId`,
                        to: `${StrategyTemplateSeaDogDiscountScheme.tableNameJunctionSymbol}.symbolId`,
                    },
                    to: `${SymbolModel.tableName}.id`,
                },
            },
        };
    };
}
