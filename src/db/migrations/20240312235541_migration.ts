import { Knex } from 'knex';
import { ifTableDoesNotExist } from '../../utils/index.js';
import { Strategy as StrategyModel } from '../models/Strategy.js';
import { Order as OrderModel } from '../models/Order.js';
import { Position as PositionModel } from '../models/Position.js';
import { Symbol as SymbolModel } from '../models/Symbol.js';
import {
    Strategy as StrategyTypes,
    StrategyTemplate as StrategyTemplateTypes,
    Order as OrderTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';
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
        await trx.schema.alterTable(`${OrderModel.tableName}`, table => {
            table.dropForeign('strategyId', 'order_strategyId_fkey');
        });
        await trx.schema.alterTable(`${OrderModel.tableName}`, table => {
            table.dropForeign('symbolId', 'order_symbolId_fkey');
        });
        await ifTableDoesNotExist(
            `tmp_${OrderModel.tableName}`,
            trx,
            async () => {
                await trx.schema.createTable(
                    `tmp_${OrderModel.tableName}`,
                    table => {
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
                        table
                            .enu('status', OrderTypes.StatusSchema.options)
                            .notNullable();
                        table
                            .enu('side', OrderTypes.SideSchema.options)
                            .notNullable();
                        table.bigInteger('quantity').notNullable();
                        table.bigInteger('averagePriceInCents').notNullable();
                    }
                );
            }
        );
        await trx.raw(`
            INSERT INTO tmp_${OrderModel.tableName} (id, strategyId, symbolId, alpacaOrderId, status, side, quantity, averagePriceInCents)
            SELECT id, strategyId, symbolId, alpacaOrderId, status, side, quantity, averagePriceInCents
            FROM \`${OrderModel.tableName}\`
            `);
        await trx.schema.dropTable(OrderModel.tableName);
        await trx.schema.renameTable(
            `tmp_${OrderModel.tableName}`,
            OrderModel.tableName
        );
        await trx.schema.alterTable(PositionModel.tableName, table => {
            table.dropForeign('strategyId', 'position_strategyId_fkey');
        });
        await trx.schema.alterTable(PositionModel.tableName, table => {
            table.dropForeign('symbolId', 'position_symbolId_fkey');
        });
        await ifTableDoesNotExist(
            `tmp_${PositionModel.tableName}`,
            trx,
            async () => {
                await trx.schema.createTable(
                    `tmp_${PositionModel.tableName}`,
                    table => {
                        table.increments('id').primary();
                        table
                            .integer('strategyId')
                            .unsigned()
                            .notNullable()
                            .references('id')
                            .inTable(StrategyModel.tableName)
                            .withKeyName('position_strategyId_fkey');
                        table
                            .integer('symbolId')
                            .unsigned()
                            .notNullable()
                            .references('id')
                            .inTable(SymbolModel.tableName)
                            .withKeyName('position_symbolId_fkey');
                        table.bigInteger('quantity').notNullable();
                        table.bigInteger('averagePriceInCents').notNullable();
                        // Ensure that the combination of strategyId and symbolId is unique
                        table.unique(['strategyId', 'symbolId']);
                    }
                );
            }
        );
        await trx.raw(
            `INSERT INTO tmp_${PositionModel.tableName} (id, strategyId, symbolId, quantity, averagePriceInCents) SELECT id, strategyId, symbolId, quantity, averagePriceInCents FROM \`${PositionModel.tableName}\``
        );
        await trx.schema.dropTable(PositionModel.tableName);
        await trx.schema.renameTable(
            `tmp_${PositionModel.tableName}`,
            PositionModel.tableName
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
        // does not work - Out of range value for column 'cashInCents' at row 3
        // await trx.raw(`
        //     INSERT INTO tmp_${StrategyModel.tableName} (id, title, status, strategyTemplateName, cashInCents)
        //     SELECT id, title, status, strategyTemplateName, CONVERT(cashInCents, SIGNED)
        //     FROM ${StrategyModel.tableName}
        // `);
        // does not work - Out of range value for column 'cashInCents' at row 3
        // await trx.raw(`
        //     INSERT INTO tmp_${StrategyModel.tableName} (id, title, status, strategyTemplateName, cashInCents)
        //     SELECT id, title, status, strategyTemplateName, CAST(cashInCents AS SIGNED)
        //     FROM ${StrategyModel.tableName}
        // `);
        // https://dev.mysql.com/doc/refman/8.0/en/out-of-range-and-overflow.html
        await trx.raw(`
        SET SQL_MODE = ''`);
        await trx.raw(`
            INSERT INTO tmp_${StrategyModel.tableName} (id, title, status, strategyTemplateName, cashInCents)
            SELECT id, title, status, strategyTemplateName, cashInCents
            FROM ${StrategyModel.tableName}
        `);
        await trx.raw(`
        SET SQL_MODE = 'TRADITIONAL'`);
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
        await trx.schema.alterTable(OrderModel.tableName, table => {
            table.dropForeign('strategyId', 'order_strategyId_fkey');
        });
        await trx.schema.alterTable(OrderModel.tableName, table => {
            table.dropForeign('symbolId', 'order_symbolId_fkey');
        });
        await ifTableDoesNotExist(
            `tmp_${OrderModel.tableName}`,
            trx,
            async () => {
                await trx.schema.createTable(
                    `tmp_${OrderModel.tableName}`,
                    table => {
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
                        table
                            .enu('status', OrderTypes.StatusSchema.options)
                            .notNullable();
                        table
                            .enu('side', OrderTypes.SideSchema.options)
                            .notNullable();
                        table.integer('quantity').notNullable();
                        table.integer('averagePriceInCents').notNullable();
                    }
                );
            }
        );
        await trx.raw(`
        SET SQL_MODE = ''`);
        await trx.raw(`
            INSERT INTO tmp_${OrderModel.tableName} (id, strategyId, symbolId, alpacaOrderId, status, side, quantity, averagePriceInCents)
            SELECT id, strategyId, symbolId, alpacaOrderId, status, side, quantity, averagePriceInCents
            FROM \`${OrderModel.tableName}\`
        `);
        await trx.raw(`
        SET SQL_MODE = 'TRADITIONAL'`);
        // Drop and rename
        await trx.schema.dropTable(OrderModel.tableName);
        await trx.schema.renameTable(
            `tmp_${OrderModel.tableName}`,
            OrderModel.tableName
        );
        await trx.schema.alterTable(PositionModel.tableName, table => {
            table.dropForeign('strategyId', 'position_strategyId_fkey');
        });
        await trx.schema.alterTable(PositionModel.tableName, table => {
            table.dropForeign('symbolId', 'position_symbolId_fkey');
        });
        await ifTableDoesNotExist(
            `tmp_${PositionModel.tableName}`,
            trx,
            async () => {
                await trx.schema.createTable(
                    `tmp_${PositionModel.tableName}`,
                    table => {
                        table.increments('id').primary();
                        table
                            .integer('strategyId')
                            .unsigned()
                            .notNullable()
                            .references('id')
                            .inTable(StrategyModel.tableName)
                            .withKeyName('position_strategyId_fkey');
                        table
                            .integer('symbolId')
                            .unsigned()
                            .notNullable()
                            .references('id')
                            .inTable(SymbolModel.tableName)
                            .withKeyName('position_symbolId_fkey');
                        table.integer('quantity').notNullable();
                        table.integer('averagePriceInCents').notNullable();
                        // Ensure that the combination of strategyId and symbolId is unique
                        table.unique(['strategyId', 'symbolId']);
                    }
                );
            }
        );
        await trx.raw(`
        SET SQL_MODE = ''`);
        await trx.raw(
            `INSERT INTO tmp_${PositionModel.tableName} (id, strategyId, symbolId, quantity, averagePriceInCents) SELECT id, strategyId, symbolId, quantity, averagePriceInCents FROM \`${PositionModel.tableName}\``
        );
        await trx.raw(`
        SET SQL_MODE = 'TRADITIONAL'`);
        await trx.schema.dropTable(PositionModel.tableName);
        await trx.schema.renameTable(
            `tmp_${PositionModel.tableName}`,
            PositionModel.tableName
        );
    });
}
