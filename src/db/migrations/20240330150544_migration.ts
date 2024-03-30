import { Knex } from 'knex';
import { StrategyLog as StrategyLogModel } from '../models/StrategyLog.js';
import { Strategy as StrategyModel } from '../models/Strategy.js';
import { Log as LogTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { ifTableDoesNotExist } from '../../utils/index.js';
export async function up(knex: Knex): Promise<void> {
    await knex.transaction(async trx => {
        await trx.schema.dropTableIfExists(`tmp_${StrategyLogModel.tableName}`);
        await ifTableDoesNotExist(
            `tmp_${StrategyLogModel.tableName}`,
            trx,
            async () => {
                await trx.schema.createTable(
                    `tmp_${StrategyLogModel.tableName}`,
                    table => {
                        table.increments('id').primary();
                        table
                            .integer('strategyId')
                            .unsigned()
                            .notNullable()
                            .references('id')
                            .inTable(StrategyModel.tableName)
                            .onDelete('CASCADE')
                            .withKeyName('strategyLog_strategyId_fkey_v2');
                        table
                            .enu('level', LogTypes.LogLevelSchema.options)
                            .notNullable();
                        table.string('message').notNullable();
                        table.json('data').nullable();
                        table.bigInteger('timestamp').notNullable();
                    }
                );
            }
        );
        await trx.raw(`
                    INSERT INTO tmp_${StrategyLogModel.tableName} (id, strategyId, level, message, data, timestamp)
                    SELECT id, strategyId, level, message, data, (SELECT UNIX_TIMESTAMP(CURTIME(3)) * 1000)
                    FROM \`${StrategyLogModel.tableName}\`
                `);
        await trx.schema.dropTable(StrategyLogModel.tableName);
        await trx.schema.renameTable(
            `tmp_${StrategyLogModel.tableName}`,
            StrategyLogModel.tableName
        );
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.transaction(async trx => {
        await trx.schema.dropTableIfExists(`tmp_${StrategyLogModel.tableName}`);
        await ifTableDoesNotExist(
            `tmp_${StrategyLogModel.tableName}`,
            trx,
            async () => {
                await trx.schema.createTable(
                    `tmp_${StrategyLogModel.tableName}`,
                    table => {
                        table.increments('id').primary();
                        table
                            .integer('strategyId')
                            .unsigned()
                            .notNullable()
                            .references('id')
                            .inTable(StrategyModel.tableName)
                            .onDelete('CASCADE')
                            .withKeyName('strategyLog_strategyId_fkey');
                        table
                            .enu('level', LogTypes.LogLevelSchema.options)
                            .notNullable();
                        table.string('message').notNullable();
                        table.json('data').nullable();
                    }
                );
            }
        );
        await trx.raw(`
                    INSERT INTO tmp_${StrategyLogModel.tableName} (id, strategyId, level, message, data)
                    SELECT id, strategyId, level, message, data
                    FROM \`${StrategyLogModel.tableName}\`
                `);
        await trx.schema.dropTable(StrategyLogModel.tableName);
        await trx.schema.renameTable(
            `tmp_${StrategyLogModel.tableName}`,
            StrategyLogModel.tableName
        );
    });
}
