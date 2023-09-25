import { Model } from 'objection';

// Person model.
export class Config extends Model {
    id!: number;
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    createdAt!: string;
    static get tableName() {
        return 'config';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            // required: ['createdAt'],
            properties: {
                id: { type: 'number' },
                createdAt: { type: 'string' },
            },
        };
    }
}
