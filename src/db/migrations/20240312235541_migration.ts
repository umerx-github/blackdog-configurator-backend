import { Knex } from 'knex';
import { ifTableDoesNotExist } from '../../utils/index.js';
import { Strategy as StrategyModel } from '../models/Strategy.js';
import { Order as OrderModel } from '../models/Order.js';
import {
    Strategy as StrategyTypes,
    StrategyTemplate as StrategyTemplateTypes,
    Order as OrderTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Position as PositionModel } from '../models/Position.js';
import { table } from 'console';
import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeModel } from '../models/StrategyTemplateSeaDogDiscountScheme.js';

export async function up(knex: Knex): Promise<void> {
    await knex.transaction(async trx => {
        await ifTableDoesNotExist(
            `tmp_${StrategyModel.tableName}`,
            trx,
            async () => {
                await trx.schema.createTable(
                    `tmp_${StrategyModel.tableName}`,
                    table => {
                        table.increments('id').primary();
                        table.string('title').notNullable();
                        table
                            .enu('status', StrategyTypes.StatusSchema.options)
                            .notNullable();
                        table
                            .enu(
                                'strategyTemplateName',
                                StrategyTemplateTypes.StrategyTemplateNameSchema
                                    .options
                            )
                            .notNullable();
                        table.bigInteger('cashInCents').notNullable();
                    }
                );
            }
        );
        await trx.raw(`
            INSERT INTO tmp_${StrategyModel.tableName} (id, title, status, strategyTemplateName, cashInCents)
            SELECT id, title, status, strategyTemplateName, cashInCents
            FROM ${StrategyModel.tableName}
        `);
        // await trx.schema.alterTable(StrategyModel.tableName, table => {
        //     table.increments('id').primary();
        // });
        // Update foreign key constraint 'order_strategyId_fkey' on table 'order' to use the new table name
        await trx.schema.alterTable(OrderModel.tableName, table => {
            table.dropForeign('strategyId', 'order_strategyId_fkey');
            table
                .foreign('strategyId', 'order_strategyId_fkey')
                .references('id')
                .inTable(`tmp_${StrategyModel.tableName}`);
        });
        await trx.schema.alterTable(PositionModel.tableName, table => {
            table.dropForeign('strategyId', 'position_strategyId_fkey');
            table
                .foreign('strategyId', 'position_strategyId_fkey')
                .references('id')
                .inTable(`tmp_${StrategyModel.tableName}`);
        });
        await trx.schema.alterTable(
            StrategyTemplateSeaDogDiscountSchemeModel.tableName,
            table => {
                table.dropForeign('strategyId', 'stsdss_strategyId_fkey');
                table
                    .foreign('strategyId', 'stsdss_strategyId_fkey')
                    .references('id')
                    .inTable(`tmp_${StrategyModel.tableName}`);
            }
        );
        await trx.schema.dropTable(StrategyModel.tableName);
        await trx.schema.renameTable(
            `tmp_${StrategyModel.tableName}`,
            StrategyModel.tableName
        );
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.transaction(async trx => {
        await ifTableDoesNotExist(
            `tmp_${StrategyModel.tableName}`,
            trx,
            async () => {
                await trx.schema.createTable(
                    `tmp_${StrategyModel.tableName}`,
                    table => {
                        table.increments('id').primary();
                        table.string('title').notNullable();
                        table
                            .enu('status', StrategyTypes.StatusSchema.options)
                            .notNullable();
                        table
                            .enu(
                                'strategyTemplateName',
                                StrategyTemplateTypes.StrategyTemplateNameSchema
                                    .options
                            )
                            .notNullable();
                        table.integer('cashInCents').notNullable();
                    }
                );
            }
        );
        await trx.raw(`
            INSERT INTO tmp_${StrategyModel.tableName} (id, title, status, strategyTemplateName, cashInCents)
            SELECT id, title, status, strategyTemplateName, cashInCents
            FROM ${StrategyModel.tableName}
        `);
        // Update foreign key constraint 'order_strategyId_fkey' on table 'order' to use the new table name
        await trx.schema.alterTable(OrderModel.tableName, table => {
            // Check if constraint exists before trying to drop
            table.dropForeign('strategyId', 'order_strategyId_fkey');
            table
                .foreign('strategyId', 'order_strategyId_fkey')
                .references('id')
                .inTable(`tmp_${StrategyModel.tableName}`);
        });
        await trx.schema.alterTable(PositionModel.tableName, table => {
            table.dropForeign('strategyId', 'position_strategyId_fkey');
            table
                .foreign('strategyId', 'position_strategyId_fkey')
                .references('id')
                .inTable(`tmp_${StrategyModel.tableName}`);
        });
        await trx.schema.alterTable(
            StrategyTemplateSeaDogDiscountSchemeModel.tableName,
            table => {
                table.dropForeign('strategyId', 'stsdss_strategyId_fkey');
                table
                    .foreign('strategyId', 'stsdss_strategyId_fkey')
                    .references('id')
                    .inTable(`tmp_${StrategyModel.tableName}`);
            }
        );
        await trx.schema.dropTable(StrategyModel.tableName);
        await trx.schema.renameTable(
            `tmp_${StrategyModel.tableName}`,
            StrategyModel.tableName
        );
    });
}
