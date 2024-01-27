import { Knex } from 'knex';
import {
    Strategy as StrategyTypes,
    StrategyTemplate as StrategyTemplateTypes,
    StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Strategy as StrategyModel } from '../models/Strategy.js';
import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeModel } from '../models/StrategyTemplateSeaDogDiscountScheme.js';
export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex(StrategyTemplateSeaDogDiscountSchemeModel.tableName).del();
    await knex(StrategyModel.tableName).del();

    // Inserts seed entries
    await knex<StrategyTypes.StrategyProps & { id: number }>(
        StrategyModel.tableName
    ).insert([
        {
            id: 1,
            title: 'My First NoOp Strategy',
            status: StrategyTypes.StatusSchema.Enum.active,
            strategyTemplateName:
                StrategyTemplateTypes.StrategyTemplateNameSchema.Enum.NoOp,
        },
        {
            id: 2,
            title: 'My Second SeaDogDiscountScheme Strategy',
            status: StrategyTypes.StatusSchema.Enum.active,
            strategyTemplateName:
                StrategyTemplateTypes.StrategyTemplateNameSchema.Enum
                    .SeaDogDiscountScheme,
        },
        {
            id: 3,
            title: 'My Third SeaDogDiscountScheme Strategy',
            status: StrategyTypes.StatusSchema.Enum.inactive,
            strategyTemplateName:
                StrategyTemplateTypes.StrategyTemplateNameSchema.Enum
                    .SeaDogDiscountScheme,
        },
    ]);
    await knex<
        StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeProps & {
            id: number;
        }
    >(StrategyTemplateSeaDogDiscountSchemeModel.tableName).insert([
        {
            id: 1,
            strategyId: 2,
            status: StrategyTemplateSeaDogDiscountSchemeTypes.StatusSchema.Enum
                .active,
            cashInCents: 100,
            sellAtPercentile: 50,
        },
        {
            id: 2,
            strategyId: 2,
            status: StrategyTemplateSeaDogDiscountSchemeTypes.StatusSchema.Enum
                .inactive,
            cashInCents: 200,
            sellAtPercentile: 75,
        },
        {
            id: 3,
            strategyId: 3,
            status: StrategyTemplateSeaDogDiscountSchemeTypes.StatusSchema.Enum
                .active,
            cashInCents: 300,
            sellAtPercentile: 100,
        },
    ]);
    // process.env?.BLACKDOG_CONFIGURATOR_BACKEND_DEV_ALPACA_API_KEY ?? ''
}
