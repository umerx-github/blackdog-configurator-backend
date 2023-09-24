import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return await knex.schema.createTable('config', table => {
        // id
        table.increments('id').primary();
        // email
        table.string('email').notNullable().index();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('config');
}
