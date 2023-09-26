import { Model } from 'objection';
import { Config } from './Config.js';

// Person model.
export class Symbol extends Model {
    id!: number;
    name!: string;
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    createdAt!: string;
    static get tableName() {
        return 'symbol';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            // required: ['createdAt'],
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                createdAt: { type: 'string' },
            },
        };
    }
    static relationMappings = () => {
        return {
            configs: {
                relation: Model.ManyToManyRelation,
                modelClass: Config,
                join: {
                    from: 'symbol.id',
                    through: {
                        // persons_movies is the join table.
                        from: 'configSymbol.symbolId',
                        to: 'configSymbol.configId',
                    },
                    to: 'config.id',
                },
            },
        };
    };
}
