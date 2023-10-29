import { Knex } from 'knex';
import {
    OrderStatusEnum,
    OrderTypeEnum,
    PositionStatusEnum,
} from '../../interfaces/db/models/index.js';

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
            // Current price must be a gain of at least this percent over purchase price before selling
            table
                .double('minimumGainPercent', 8, 2)
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
        .createTableIfNotExists('buyOrder', table => {
            table.increments('id').primary();
            table
                .enum('status', Object.values(OrderStatusEnum))
                .notNullable()
                .index();
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
            table
                .enum('type', Object.values(OrderTypeEnum))
                .notNullable()
                .index();
            table.bigInteger('priceInCents').notNullable();
        })
        .createTableIfNotExists('position', table => {
            table.increments('id').primary();
            table
                .enum('status', Object.values(PositionStatusEnum))
                .notNullable()
                .index();
            table
                .integer('buyOrderId')
                .unsigned()
                .references('id')
                .inTable('buyOrder')
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
        })
        .createTable('sellOrder', table => {
            table
                .enum('status', Object.values(OrderStatusEnum))
                .notNullable()
                .index();
            table.increments('id').primary();
            table
                .integer('positionId')
                .unsigned()
                .references('id')
                .inTable('position')
                .onDelete('CASCADE')
                .index();
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
            table
                .enum('type', Object.values(OrderTypeEnum))
                .notNullable()
                .index();
            table.bigInteger('priceInCents').notNullable();
        });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema
        .dropTableIfExists('sellOrder')
        .dropTableIfExists('position')
        .dropTableIfExists('buyOrder')
        .dropTableIfExists('configSymbol')
        .dropTableIfExists('config')
        .dropTableIfExists('symbol');
}
