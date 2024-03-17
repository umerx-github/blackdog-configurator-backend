import { Knex } from 'knex';
import { ifTableDoesNotExist } from '../../utils/index.js';
import { Strategy as StrategyModel } from '../models/Strategy.js';
import { Order as OrderModel } from '../models/Order.js';
import { Position as PositionModel } from '../models/Position.js';
import { Symbol as SymbolModel } from '../models/Symbol.js';
import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeModel } from '../models/StrategyTemplateSeaDogDiscountScheme.js';
import {
    Strategy as StrategyTypes,
    StrategyTemplate as StrategyTemplateTypes,
    Order as OrderTypes,
    StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';

export async function up(knex: Knex): Promise<void> {
    await knex.transaction(async trx => {
        await trx.schema.alterTable(
            StrategyTemplateSeaDogDiscountSchemeModel.tableName,
            table => {
                table.dropForeign('strategyId', 'stsdss_strategyId_fkey');
            }
        );
        await ifTableDoesNotExist(
            `tmp_${StrategyTemplateSeaDogDiscountSchemeModel.tableName}`,
            trx,
            async () => {
                await trx.schema.createTable(
                    `tmp_${StrategyTemplateSeaDogDiscountSchemeModel.tableName}`,
                    table => {
                        table.increments('id').primary();
                        table
                            .integer('strategyId')
                            .unsigned()
                            .notNullable()
                            .references('id')
                            .inTable(StrategyModel.tableName)
                            .onDelete('CASCADE')
                            .withKeyName('stsdss_strategyId_fkey');
                        table
                            .enu('status', StrategyTypes.StatusSchema.options)
                            .notNullable();
                        table.string('alpacaAPIKey').notNullable();
                        table.string('alpacaAPISecret').notNullable();
                        table.boolean('alpacaAPIPaper').notNullable();
                        table.double('buyAtPercentile').notNullable();
                        table.double('sellAtPercentile').notNullable();
                        table.double('minimumGainPercent').notNullable();
                        table.bigint('timeframeInDays').notNullable();
                    }
                );
            }
        );
        await trx.raw(`
            INSERT INTO tmp_${StrategyTemplateSeaDogDiscountSchemeModel.tableName} (id, strategyId, status, alpacaAPIKey, alpacaAPISecret, alpacaAPIPaper, buyAtPercentile, sellAtPercentile, minimumGainPercent, timeframeInDays)
            SELECT id, strategyId, status, alpacaAPIKey, alpacaAPISecret, alpacaAPIPaper, buyAtPercentile, sellAtPercentile, minimumGainPercent, timeframeInDays
            FROM \`${StrategyTemplateSeaDogDiscountSchemeModel.tableName}\`
        `);
        await trx.schema.alterTable(
            StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol,
            table => {
                table.dropForeign(
                    'strategyTemplateSeaDogDiscountSchemeId',
                    'stsdsss_stsdssId_fkey'
                );
                table
                    .foreign(
                        'strategyTemplateSeaDogDiscountSchemeId',
                        'stsdsss_stsdssId_fkey'
                    )
                    .references('id')
                    .inTable(
                        `tmp_${StrategyTemplateSeaDogDiscountSchemeModel.tableName}`
                    )
                    .onDelete('CASCADE');
            }
        );
        await trx.schema.dropTable(
            StrategyTemplateSeaDogDiscountSchemeModel.tableName
        );
        await trx.schema.renameTable(
            `tmp_${StrategyTemplateSeaDogDiscountSchemeModel.tableName}`,
            StrategyTemplateSeaDogDiscountSchemeModel.tableName
        );
        await trx.schema.alterTable(
            StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol,
            table => {
                table.dropForeign('symbolId', 'stsdsss_symbolId_fkey');
                table
                    .foreign('symbolId', 'stsdsss_symbolId_fkey')
                    .references('id')
                    .inTable(SymbolModel.tableName)
                    .onDelete('CASCADE');
            }
        );
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.transaction(async trx => {
        await trx.schema.alterTable(
            StrategyTemplateSeaDogDiscountSchemeModel.tableName,
            table => {
                table.dropForeign('strategyId', 'stsdss_strategyId_fkey');
            }
        );
        await ifTableDoesNotExist(
            `tmp_${StrategyTemplateSeaDogDiscountSchemeModel.tableName}`,
            trx,
            async () => {
                await trx.schema.createTable(
                    `tmp_${StrategyTemplateSeaDogDiscountSchemeModel.tableName}`,
                    table => {
                        table.increments('id').primary();
                        table
                            .integer('strategyId')
                            .unsigned()
                            .notNullable()
                            .references('id')
                            .inTable(StrategyModel.tableName)
                            .onDelete('CASCADE')
                            .withKeyName('stsdss_strategyId_fkey');
                        table
                            .enu('status', StrategyTypes.StatusSchema.options)
                            .notNullable();
                        table.string('alpacaAPIKey').notNullable();
                        table.string('alpacaAPISecret').notNullable();
                        table.boolean('alpacaAPIPaper').notNullable();
                        table.integer('buyAtPercentile').notNullable();
                        table.integer('sellAtPercentile').notNullable();
                        table.integer('minimumGainPercent').notNullable();
                        table.integer('timeframeInDays').notNullable();
                    }
                );
            }
        );
        await trx.raw(`
        SET SQL_MODE = ''`);
        await trx.raw(`
            INSERT INTO tmp_${StrategyTemplateSeaDogDiscountSchemeModel.tableName} (id, strategyId, status, alpacaAPIKey, alpacaAPISecret, alpacaAPIPaper, buyAtPercentile, sellAtPercentile, minimumGainPercent, timeframeInDays)
            SELECT id, strategyId, status, alpacaAPIKey, alpacaAPISecret, alpacaAPIPaper, buyAtPercentile, sellAtPercentile, minimumGainPercent, timeframeInDays
            FROM \`${StrategyTemplateSeaDogDiscountSchemeModel.tableName}\`
        `);
        await trx.raw(`
        SET SQL_MODE = 'TRADITIONAL'`);
        await trx.schema.alterTable(
            StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol,
            table => {
                table.dropForeign(
                    'strategyTemplateSeaDogDiscountSchemeId',
                    'stsdsss_stsdssId_fkey'
                );
                table
                    .foreign(
                        'strategyTemplateSeaDogDiscountSchemeId',
                        'stsdsss_stsdssId_fkey'
                    )
                    .references('id')
                    .inTable(
                        `tmp_${StrategyTemplateSeaDogDiscountSchemeModel.tableName}`
                    );
            }
        );
        await trx.schema.dropTable(
            StrategyTemplateSeaDogDiscountSchemeModel.tableName
        );
        await trx.schema.renameTable(
            `tmp_${StrategyTemplateSeaDogDiscountSchemeModel.tableName}`,
            StrategyTemplateSeaDogDiscountSchemeModel.tableName
        );
    });
}
