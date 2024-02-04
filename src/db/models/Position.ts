import { Model } from 'objection';
import { Position as PositionTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';

export class Position
    extends Model
    implements PositionTypes.PositionModelInterface
{
    id!: number;
    strategyId!: number;
    symbolId!: number;
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    static get tableName() {
        return 'position';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            properties: {
                id: { type: 'number' },
                strategyId: { type: 'number' },
                symbolId: { type: 'number' },
            },
        };
    }
    static relationMappings = () => {
        return {};
    };
}
