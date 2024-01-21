import { Model } from 'objection';
import {
    Strategy as StrategyTypes,
    StrategyTemplate as StrategyTemplateTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';

export class Strategy
    extends Model
    implements StrategyTypes.StrategyModelInterface
{
    id!: number;
    status!: StrategyTypes.Status;
    title!: string;
    strategyTemplateName!: StrategyTemplateTypes.StrategyTemplateName;
    // https://www.reddit.com/r/node/comments/7hxie6/objectionjs_and_timestamps/
    // https://github.com/Vincit/objection.js/issues/647
    static get tableName() {
        return 'strategy';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            properties: {
                id: { type: 'number' },
                status: { type: 'string' },
                title: { type: 'string' },
                strategyTemplateName: { type: 'string' },
            },
        };
    }
    static relationMappings = () => {
        return {};
    };
}
