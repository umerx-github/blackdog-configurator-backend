import { Knex } from 'knex';
import { ifTableDoesNotExist } from '../../utils/index.js';
import { Strategy as StrategyModel } from '../models/Strategy.js';
import { StrategyLog as StrategyLogModel } from '../models/StrategyLog.js';
import { Log as LogTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';

export async function up(knex: Knex): Promise<void> {
    await knex.transaction(async trx => {
        await ifTableDoesNotExist(
            `${StrategyLogModel.tableName}`,
            trx,
            async () => {
                await trx.schema.createTable(
                    `${StrategyLogModel.tableName}`,
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
                        table.json('message').notNullable();
                    }
                );
            }
        );
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.transaction(async trx => {
        trx.schema.dropTableIfExists(`${StrategyLogModel.tableName}`);
    });
}
