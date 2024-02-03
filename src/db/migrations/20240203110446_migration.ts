import { Knex } from 'knex';
import {
    Strategy as StrategyTypes,
    StrategyTemplate as StrategyTemplateTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';

import { Strategy as StrategyModel } from '../models/Strategy.js';
import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeModel } from '../models/StrategyTemplateSeaDogDiscountScheme.js';
import { Symbol as SymbolModel } from '../models/Symbol.js';
import { Order } from '../models/Order.js';

async function ifTableDoesNotExist(
    tableName: string,
    knex: Knex,
    callback: () => void
) {
    await knex.schema.hasTable(tableName).then(async exists => {
        if (!exists) {
            await callback();
        }
    });
}

export async function up(knex: Knex): Promise<void> {
    await ifTableDoesNotExist(SymbolModel.tableName, knex, async () => {
        await knex.schema.createTable(SymbolModel.tableName, table => {
            table.increments('id').primary();
            table.string('name').notNullable();
        });
    });
    await ifTableDoesNotExist(StrategyModel.tableName, knex, async () => {
        await knex.schema.createTable(StrategyModel.tableName, table => {
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
        });
    });
    await ifTableDoesNotExist(Order.tableName, knex, async () => {
        await knex.schema.createTable(Order.tableName, table => {
            table.increments('id').primary();
            table
                .integer('strategyId')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable(StrategyModel.tableName)
                .withKeyName('order_strategyId_fkey');
            table
                .integer('symbolId')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable(SymbolModel.tableName)
                .withKeyName('order_symbolId_fkey');
            table.string('alpacaOrderId').notNullable();
        });
    });
    await ifTableDoesNotExist(
        StrategyTemplateSeaDogDiscountSchemeModel.tableName,
        knex,
        async () => {
            await knex.schema.createTable(
                StrategyTemplateSeaDogDiscountSchemeModel.tableName,
                table => {
                    table.increments('id').primary();
                    table
                        .integer('strategyId')
                        .unsigned()
                        .notNullable()
                        .references('id')
                        .inTable(StrategyModel.tableName)
                        .withKeyName('stsdss_strategyId_fkey');
                    table
                        .enu('status', StrategyTypes.StatusSchema.options)
                        .notNullable();
                    table.integer('cashInCents').notNullable();
                    table.integer('sellAtPercentile').notNullable();
                }
            );
        }
    );
    await ifTableDoesNotExist(
        StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol,
        knex,
        async () => {
            await knex.schema.createTable(
                StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol,
                table => {
                    table.increments('id').primary();
                    table
                        .integer('strategyTemplateSeaDogDiscountSchemeId')
                        .unsigned()
                        .notNullable()
                        .references('id')
                        .inTable(
                            StrategyTemplateSeaDogDiscountSchemeModel.tableName
                        )
                        .withKeyName('stsdsss_stsdssId_fkey');
                    table
                        .integer('symbolId')
                        .unsigned()
                        .notNullable()
                        .references('id')
                        .inTable(SymbolModel.tableName)
                        .withKeyName('stsdsss_symbolId_fkey');
                }
            );
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema
        .dropTableIfExists(
            StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol
        )
        .dropTableIfExists(StrategyTemplateSeaDogDiscountSchemeModel.tableName)
        .dropTableIfExists(Order.tableName)
        .dropTableIfExists(StrategyModel.tableName)
        .dropTableIfExists(SymbolModel.tableName);
}