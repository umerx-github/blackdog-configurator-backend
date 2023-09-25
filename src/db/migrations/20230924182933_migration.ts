import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return await knex.schema.createTable('config', table => {
        // id
        table.increments('id').primary();
        // createdAt
        table
            .dateTime('createdAt')
            .notNullable()
            .defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('config');
}
