import { Knex } from 'knex';
import {
    Strategy as StrategyTypes,
    StrategyTemplate as StrategyTemplateTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';

import { Strategy as StrategyModel } from '../models/Strategy.js';
import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeModel } from '../models/StrategyTemplateSeaDogDiscountScheme.js';

export async function up(knex: Knex): Promise<void> {
    return await knex.schema
        .createTableIfNotExists(StrategyModel.tableName, table => {
            table.increments('id').primary();
            table.string('title').notNullable();
            table
                .enu('status', StrategyTypes.StatusSchema.options)
                .notNullable();
            table
                .enu(
                    'strategyTemplateName',
                    StrategyTemplateTypes.StrategyTemplateNameSchema.options
                )
                .notNullable();
        })
        .createTableIfNotExists(
            StrategyTemplateSeaDogDiscountSchemeModel.tableName,
            table => {
                table.increments('id').primary();
                table
                    .integer('strategyId')
                    .unsigned()
                    .notNullable()
                    .references('id')
                    .inTable(StrategyModel.tableName);
                table
                    .enu('status', StrategyTypes.StatusSchema.options)
                    .notNullable();
                table.integer('cashInCents').notNullable();
                table.integer('sellAtPercentile').notNullable();
            }
        );
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema
        .dropTableIfExists(StrategyTemplateSeaDogDiscountSchemeModel.tableName)
        .dropTableIfExists(StrategyModel.tableName);
}
