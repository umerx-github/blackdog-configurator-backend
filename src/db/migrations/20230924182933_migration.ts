import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return await knex.schema
        .createTableIfNotExists('config', table => {
            table.increments('id').primary();
            table
                .dateTime('createdAt')
                .notNullable()
                .defaultTo(knex.raw('CURRENT_TIMESTAMP'));
            table.boolean('isActive').notNullable().defaultTo(false).index();
            table.bigint('cashInCents').notNullable().defaultTo(0);
            // - Percentile to sell
            table.double('sellAtPercentile', 8, 2).notNullable().defaultTo(0.0);
            // - Percentile to buy
            table.double('buyAtPercentile', 8, 2).notNullable().defaultTo(0.0);
            // - Limit order sell trailing percent
            table
                .double('sellTrailingPercent', 8, 2)
                .notNullable()
                .defaultTo(0.0);
            // - Limit order buy trailing percent
            table
                .double('buyTrailingPercent', 8, 2)
                .notNullable()
                .defaultTo(0.0);
            // - Timeframe (days) to evaluate
            table.integer('timeframeInDays').notNullable().defaultTo(1);
            // alpaca api key
            table.string('alpacaApiKey').notNullable().defaultTo('');
            // alpaca api secret
            table.string('alpacaApiSecret').notNullable().defaultTo('');
        })
        .createTableIfNotExists('symbol', table => {
            table.increments('id').primary();
            table.string('name').notNullable().index();
            table
                .dateTime('createdAt')
                .notNullable()
                .defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        })
        .createTableIfNotExists('configSymbol', table => {
            table.increments('id').primary();
            table
                .integer('configId')
                .unsigned()
                .references('id')
                .inTable('config')
                .notNullable()
                .onDelete('CASCADE')
                .index();
            table
                .integer('symbolId')
                .unsigned()
                .references('id')
                .inTable('symbol')
                .notNullable()
                .onDelete('CASCADE')
                .index();
            table
                .dateTime('createdAt')
                .notNullable()
                .defaultTo(knex.raw('CURRENT_TIMESTAMP'));
            table
                .integer('order')
                .unsigned()
                .notNullable()
                .defaultTo(0)
                .index();
        })
        .createTableIfNotExists('order', table => {
            table.increments('id').primary();
            table
                .integer('configId')
                .unsigned()
                .references('id')
                .inTable('config')
                .notNullable()
                .onDelete('CASCADE')
                .index();
            table
                .integer('symbolId')
                .unsigned()
                .references('id')
                .inTable('symbol')
                .notNullable()
                .onDelete('CASCADE')
                .index();
            table.string('alpacaOrderId').notNullable().index();
            table
                .dateTime('createdAt')
                .notNullable()
                .defaultTo(knex.raw('CURRENT_TIMESTAMP'));
            table.enum('side', ['buy', 'sell']).notNullable().index();
            table
                .enum('type', [
                    'market',
                    'limit',
                    'stop',
                    'stop_limit',
                    'trailing_stop',
                ])
                .notNullable()
                .index();
            table.bigInteger('priceInCents').notNullable();
        })
        .createTableIfNotExists('position', table => {
            table.increments('id').primary();
            table
                .integer('symbolId')
                .unsigned()
                .references('id')
                .inTable('symbol')
                .notNullable()
                .onDelete('CASCADE')
                .index();
            table
                .dateTime('createdAt')
                .notNullable()
                .defaultTo(knex.raw('CURRENT_TIMESTAMP'));
            table.bigInteger('priceInCents').notNullable();
        });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema
        .dropTableIfExists('order')
        .dropTableIfExists('position')
        .dropTableIfExists('configSymbol')
        .dropTableIfExists('config')
        .dropTableIfExists('symbol');
}
