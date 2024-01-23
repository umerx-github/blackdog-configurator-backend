import { Model } from 'objection';
import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Strategy as StrategyModel } from './Strategy.js';

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
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    static get tableName() {
        return 'strategyTemplateSeaDogDiscountScheme';
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
        };
    };
}
