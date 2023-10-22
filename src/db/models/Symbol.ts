import { Model } from 'objection';
import { Config } from './Config.js';
import {
    ConfigSymbolInterface,
    SymbolInterface,
} from '../../interfaces/db/models/index.js';

// Person model.
export class Symbol extends Model implements SymbolInterface {
    id!: number;
    name!: string;
    createdAt!: string;
    configSymbols!: ConfigSymbolInterface[];
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
            configSymbols: {
                relation: Model.HasManyRelation,
                modelClass: Config,
                join: {
                    from: 'symbol.id',
                    to: 'configSymbol.symbolId',
                },
            },
        };
    };
}
