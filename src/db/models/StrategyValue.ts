import { Model } from 'objection';
import { StrategyValue as StrategyValueTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';

export class StrategyValue
    extends Model
    implements StrategyValueTypes.StrategyValueModelInterface
{
    id!: number;
    strategyId!: number;
    timestamp!: number;
    valueInCents!: number;
    static get prettyName() {
        return 'StrategyValue';
    }
    static get tableName() {
        return 'StrategyValue';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['strategyId', 'timestamp', 'valueInCents'],
            properties: {
                id: { type: 'number' },
                strategyId: { type: 'number' },
                timestamp: { type: 'number' },
                valueInCents: { type: 'number' },
            },
        };
    }
    static relationMappings = () => {
        return {};
    };
}
