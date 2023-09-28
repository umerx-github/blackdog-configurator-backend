import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('configSymbol').del();
    await knex('config').del();
    await knex('symbol').del();
    await knex('config').insert([
        { id: 1 },
        { id: 2 },
        { id: 3, isActive: true },
    ]);
    // Inserts seed entries
    await knex('symbol').insert([
        { id: 1, name: 'TSLA' },
        { id: 2, name: 'AAPL' },
        { id: 3, name: 'AMZN' },
    ]);
    await knex('configSymbol').insert([
        { id: 1, configId: 1, symbolId: 1 },
        { id: 2, configId: 1, symbolId: 2 },
        { id: 3, configId: 1, symbolId: 3 },
    ]);
}
