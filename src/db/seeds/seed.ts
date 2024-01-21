import { Knex } from 'knex';
import {
    Strategy as StrategyTypes,
    StrategyTemplate as StrategyTemplateTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';
export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('strategy').del();

    // Inserts seed entries
    await knex<StrategyTypes.StrategyProps & { id: number }>('strategy').insert(
        [
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
        ]
    );
    // process.env?.BLACKDOG_CONFIGURATOR_BACKEND_DEV_ALPACA_API_KEY ?? ''
}
