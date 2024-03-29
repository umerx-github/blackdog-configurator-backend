import { Model } from 'objection';
import {
    StrategyLog as StrategyLogTypes,
    Log as LogTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';

export class StrategyLog
    extends Model
    implements StrategyLogTypes.StrategyLogModelInterface
{
    id!: number;
    strategyId!: number;
    level!: LogTypes.LogLevel;
    message!: string;
    static get tableName() {
        return 'strategyLog';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['strategyId', 'level', 'message'],
            properties: {
                id: { type: 'number' },
                strategyId: { type: 'number' },
                level: { type: 'string' },
                message: { type: 'string' },
            },
        };
    }
    static relationMappings = () => {
        return {};
    };
}
