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
    alpacaAPIKey!: string;
    alpacaAPISecret!: string;
    alpacaAPIPaper!: boolean;
    buyAtPercentile!: number;
    sellAtPercentile!: number;
    minimumGainPercent!: number;
    timeframeInDays!: number;
    symbols?: SymbolModelInterface[];
    // symbolIds!: number[];
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    static get prettyName() {
        return 'StrategyTemplateSeaDogDiscountScheme';
    }
    static get tableName() {
        return 'strategyTemplateSeaDogDiscountScheme';
    }
    static get tableNameJunctionSymbol() {
        return 'strategyTemplateSeaDogDiscountSchemeSymbol';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            required: [
                'strategyId',
                'status',
                'alpacaAPIKey',
                'alpacaAPISecret',
                'alpacaAPIPaper',
                'buyAtPercentile',
                'sellAtPercentile',
                'minimumGainPercent',
                'timeframeInDays',
            ],
            properties: {
                id: { type: 'number' },
                strategyId: { type: 'number' },
                status: { type: 'string' },
                alpacaAPIKey: { type: 'string' },
                alpacaAPISecret: { type: 'string' },
                alpacaAPIPaper: { type: 'boolean' },
                buyAtPercentile: { type: 'number' },
                sellAtPercentile: { type: 'number' },
                minimumGainPercent: { type: 'number' },
                timeframeInDays: { type: 'number' },
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
