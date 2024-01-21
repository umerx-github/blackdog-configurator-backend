import { Knex } from 'knex';
import {
    Strategy as StrategyTypes,
    StrategyTemplate as StrategyTemplateTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';

export async function up(knex: Knex): Promise<void> {
    return await knex.schema.createTableIfNotExists('strategy', table => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.enu('status', StrategyTypes.StatusSchema.options).notNullable();
        table
            .enu(
                'strategyTemplateName',
                StrategyTemplateTypes.StrategyTemplateNameSchema.options
            )
            .notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('strategy');
}
