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
        });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema
        .dropTableIfExists('configSymbol')
        .dropTableIfExists('config')
        .dropTableIfExists('symbol');
}
