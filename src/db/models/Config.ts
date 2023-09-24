import { Model } from 'objection';
import knex from 'knex';

// Person model.
class Config extends Model {
    id!: number;
    name!: string;
    static get tableName() {
        return 'config';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name'],
            properties: {
                id: { type: 'number' },
                name: { type: 'string', minLength: 1, maxLength: 255 },
            },
        };
    }
}
