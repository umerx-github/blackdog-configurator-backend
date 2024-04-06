import { Knex } from 'knex';
import { StrategyValue as StrategyValueModel } from '../models/StrategyValue.js';
import { Strategy as StrategyModel } from '../models/Strategy.js';
import { ifTableDoesNotExist } from '../../utils/index.js';
export async function up(knex: Knex): Promise<void> {
    await knex.transaction(async trx => {
        await ifTableDoesNotExist(
            `${StrategyValueModel.tableName}`,
            trx,
            async () => {
                await trx.schema.createTable(
                    `${StrategyValueModel.tableName}`,
                    table => {
                        table.increments('id').primary();
                        table
                            .integer('strategyId')
                            .unsigned()
                            .notNullable()
                            .references('id')
                            .inTable(StrategyModel.tableName)
                            .onDelete('CASCADE')
                            .withKeyName('strategyValue_strategyId_fkey');
                        table.bigInteger('timestamp').notNullable();
                        table.bigInteger('valueInCents').notNullable();
                    }
                );
            }
        );
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.transaction(async trx => {
        await trx.schema.dropTableIfExists(`${StrategyValueModel.tableName}`);
    });
}
