import { Model } from 'objection';
import { Symbol as SymbolTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
// Person model.
export class Symbol extends Model implements SymbolTypes.SymbolModelInterface {
    id!: number;
    name!: string;
    static get tableName() {
        return 'symbol';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name'],
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
            },
        };
    }
    static relationMappings = () => {
        return {};
    };
}
