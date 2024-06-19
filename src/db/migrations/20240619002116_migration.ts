import { Knex } from 'knex';
import { Position as PositionModel } from '../models/Position.js';
import { Strategy as StrategyModel } from '../models/Strategy.js';
import { Symbol as SymbolModel } from '../models/Symbol.js';
import { ifTableDoesNotExist } from '../../utils/index.js';
export async function up(knex: Knex): Promise<void> {
    await knex.transaction(async trx => {
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
                            .onDelete('CASCADE')
                            .withKeyName('position_strategyId_fkey');
                        table
                            .integer('symbolId')
                            .unsigned()
                            .notNullable()
                            .references('id')
                            .inTable(SymbolModel.tableName)
                            .onDelete('CASCADE')
                            .withKeyName('position_symbolId_fkey');
                        table.bigInteger('quantity').notNullable();
                        table.check(
                            '?? > 0',
                            ['quantity'],
                            'position_quantity_greater_than_zero_check'
                        );
                        table.bigInteger('averagePriceInCents').notNullable();
                        // Ensure that the combination of strategyId and symbolId is unique
                        table.unique(['strategyId', 'symbolId']);
                    }
                );
            }
        );
        await trx.raw(
            `INSERT INTO tmp_${PositionModel.tableName} (id, strategyId, symbolId, quantity, averagePriceInCents) SELECT id, strategyId, symbolId, quantity, averagePriceInCents FROM \`${PositionModel.tableName}\` WHERE quantity > 0`
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
        await trx.schema.alterTable(PositionModel.tableName, table => {
            table.dropChecks(['position_quantity_greater_than_zero_check']);
        });
    });
}
