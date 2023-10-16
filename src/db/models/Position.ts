import { Model } from 'objection';
import { Symbol } from './Symbol.js';
import { PositionInterface } from '../../interfaces/db/models/index.js';

// Person model.
export class Position extends Model implements PositionInterface {
    id!: number;
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    createdAt!: string;
    // configId!: number;
    symbolId!: number;
    symbol!: Symbol;
    static get tableName() {
        return 'position';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            // required: ['createdAt'],
            properties: {
                id: { type: 'number' },
                symbolId: { type: 'number' },
                createdAt: { type: 'string' },
            },
        };
    }
    static relationMappings = () => {
        return {
            symbol: {
                relation: Model.BelongsToOneRelation,
                modelClass: Symbol,
                join: {
                    from: 'position.symbolId',
                    to: 'symbol.id',
                },
            },
        };
    };
}
