import { Knex } from 'knex';
import {
    Strategy as StrategyTypes,
    StrategyTemplate as StrategyTemplateTypes,
    StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeTypes,
    StrategyTemplateSeaDogDiscountSchemeSymbol as StrategyTemplateSeaDogDiscountSchemeSymbolTypes,
    Symbol as SymbolTypes,
    Order as OrderTypes,
    Position as PositionTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Strategy as StrategyModel } from '../models/Strategy.js';
import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeModel } from '../models/StrategyTemplateSeaDogDiscountScheme.js';
import { Symbol as SymbolModel } from '../models/Symbol.js';
import { Order as OrderModel } from '../models/Order.js';
import { Position as PositionModel } from '../models/Position.js';
async function truncateTableIfExists(tableName: string, knex: Knex) {
    if (await knex.schema.hasTable(tableName)) {
        await knex(tableName).del();
    }
}
export async function seed(knex: Knex): Promise<void> {
    await truncateTableIfExists(
        StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol,
        knex
    );
    await truncateTableIfExists(
        StrategyTemplateSeaDogDiscountSchemeModel.tableName,
        knex
    );
    await truncateTableIfExists(PositionModel.tableName, knex);
    await truncateTableIfExists(OrderModel.tableName, knex);
    await truncateTableIfExists(StrategyModel.tableName, knex);
    await truncateTableIfExists(SymbolModel.tableName, knex);

    // Inserts seed entries
    await knex<SymbolTypes.SymbolProps & { id: number }>(
        SymbolModel.tableName
    ).insert([
        {
            id: 1,
            name: 'AAPL',
        },
        {
            id: 2,
            name: 'MSFT',
        },
        {
            id: 3,
            name: 'GOOG',
        },
    ]);
    await knex<StrategyTypes.StrategyProps & { id: number }>(
        StrategyModel.tableName
    ).insert([
        {
            id: 1,
            title: 'My First NoOp Strategy',
            status: StrategyTypes.StatusSchema.Enum.active,
            strategyTemplateName:
                StrategyTemplateTypes.StrategyTemplateNameSchema.Enum.NoOp,
        },
        {
            id: 2,
            title: 'My Second SeaDogDiscountScheme Strategy',
            status: StrategyTypes.StatusSchema.Enum.active,
            strategyTemplateName:
                StrategyTemplateTypes.StrategyTemplateNameSchema.Enum
                    .SeaDogDiscountScheme,
        },
        {
            id: 3,
            title: 'My Third SeaDogDiscountScheme Strategy',
            status: StrategyTypes.StatusSchema.Enum.inactive,
            strategyTemplateName:
                StrategyTemplateTypes.StrategyTemplateNameSchema.Enum
                    .SeaDogDiscountScheme,
        },
    ]);
    await knex<OrderTypes.OrderProps & { id: number }>(
        OrderModel.tableName
    ).insert([
        {
            id: 1,
            strategyId: 1,
            symbolId: 1,
            alpacaOrderId: '1',
            status: OrderTypes.StatusSchema.Enum.open,
        },
        {
            id: 2,
            strategyId: 1,
            symbolId: 2,
            alpacaOrderId: '2',
            status: OrderTypes.StatusSchema.Enum.open,
        },
        {
            id: 3,
            strategyId: 2,
            symbolId: 2,
            alpacaOrderId: '3',
            status: OrderTypes.StatusSchema.Enum.closed,
        },
        {
            id: 4,
            strategyId: 2,
            symbolId: 3,
            alpacaOrderId: '4',
            status: OrderTypes.StatusSchema.Enum.open,
        },
        {
            id: 5,
            strategyId: 3,
            symbolId: 3,
            alpacaOrderId: '5',
            status: OrderTypes.StatusSchema.Enum.open,
        },
        {
            id: 6,
            strategyId: 3,
            symbolId: 1,
            alpacaOrderId: '6',
            status: OrderTypes.StatusSchema.Enum.closed,
        },
    ]);
    await knex<PositionTypes.PositionProps & { id: number }>(
        PositionModel.tableName
    ).insert([
        {
            id: 1,
            strategyId: 1,
            symbolId: 1,
        },
        {
            id: 2,
            strategyId: 1,
            symbolId: 2,
        },
        {
            id: 3,
            strategyId: 2,
            symbolId: 2,
        },
        {
            id: 4,
            strategyId: 2,
            symbolId: 3,
        },
        {
            id: 5,
            strategyId: 3,
            symbolId: 3,
        },
        {
            id: 6,
            strategyId: 3,
            symbolId: 1,
        },
    ]);
    await knex<
        StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeProps & {
            id: number;
        }
    >(StrategyTemplateSeaDogDiscountSchemeModel.tableName).insert([
        {
            id: 1,
            strategyId: 2,
            status: StrategyTemplateSeaDogDiscountSchemeTypes.StatusSchema.Enum
                .inactive,
            cashInCents: 100,
            sellAtPercentile: 50,
            alpacaAPIKey: process.env.ALPACA_CLIENT_CREDENTIALS_KEY ?? '',
            alpacaAPISecret: process.env.ALPACA_CLIENT_CREDENTIALS_SECRET ?? '',
            alpacaAPIPaper: true,
        },
        {
            id: 2,
            strategyId: 2,
            status: StrategyTemplateSeaDogDiscountSchemeTypes.StatusSchema.Enum
                .active,
            cashInCents: 200,
            sellAtPercentile: 75,
            alpacaAPIKey: process.env.ALPACA_CLIENT_CREDENTIALS_KEY ?? '',
            alpacaAPISecret: process.env.ALPACA_CLIENT_CREDENTIALS_SECRET ?? '',
            alpacaAPIPaper: true,
        },
        {
            id: 3,
            strategyId: 3,
            status: StrategyTemplateSeaDogDiscountSchemeTypes.StatusSchema.Enum
                .active,
            cashInCents: 300,
            sellAtPercentile: 100,
            alpacaAPIKey: process.env.ALPACA_CLIENT_CREDENTIALS_KEY ?? '',
            alpacaAPISecret: process.env.ALPACA_CLIENT_CREDENTIALS_SECRET ?? '',
            alpacaAPIPaper: true,
        },
    ]);
    await knex<
        StrategyTemplateSeaDogDiscountSchemeSymbolTypes.StrategyTemplateSeaDogDiscountSchemeSymbolProps & {
            id: number;
        }
    >(StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol).insert(
        [
            {
                id: 1,
                strategyTemplateSeaDogDiscountSchemeId: 1,
                symbolId: 1,
            },
            {
                id: 2,
                strategyTemplateSeaDogDiscountSchemeId: 1,
                symbolId: 2,
            },
            {
                id: 3,
                strategyTemplateSeaDogDiscountSchemeId: 2,
                symbolId: 2,
            },
            {
                id: 4,
                strategyTemplateSeaDogDiscountSchemeId: 2,
                symbolId: 3,
            },
            {
                id: 5,
                strategyTemplateSeaDogDiscountSchemeId: 3,
                symbolId: 3,
            },
            {
                id: 6,
                strategyTemplateSeaDogDiscountSchemeId: 3,
                symbolId: 1,
            },
        ]
    );
}
