import { Knex } from 'knex';
import {
    Strategy as StrategyTypes,
    StrategyTemplate as StrategyTemplateTypes,
    StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeTypes,
    StrategyTemplateSeaDogDiscountSchemeSymbol as StrategyTemplateSeaDogDiscountSchemeSymbolTypes,
    Symbol as SymbolTypes,
    Order as OrderTypes,
} from '@umerx/umerx-blackdog-configurator-types-typescript';
import { Strategy as StrategyModel } from '../models/Strategy.js';
import { StrategyTemplateSeaDogDiscountScheme as StrategyTemplateSeaDogDiscountSchemeModel } from '../models/StrategyTemplateSeaDogDiscountScheme.js';
import { Symbol as SymbolModel } from '../models/Symbol.js';
import { Order } from '../models/Order.js';
async function truncateTableIfExists(tableName: string, knex: Knex) {
    // const strategyTemplateSeaDogDiscountSchemeModeTable = await knex(
    //     StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol
    // );
    // if (strategyTemplateSeaDogDiscountSchemeModeTable) {
    //     await knex(StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol).del();
    // }
    console.log('tableName', tableName);
    if (await knex.schema.hasTable(tableName)) {
        console.log('truncateTableIfExists', tableName);
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
    await truncateTableIfExists(Order.tableName, knex);
    await truncateTableIfExists(StrategyModel.tableName, knex);
    await truncateTableIfExists(SymbolModel.tableName, knex);

    // Deletes ALL existing entries
    // const strategyTemplateSeaDogDiscountSchemeModeTable = await knex(
    //     StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol
    // );
    // if (strategyTemplateSeaDogDiscountSchemeModeTable) {
    //     await knex(StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol).del();
    // }
    // await knex(StrategyTemplateSeaDogDiscountSchemeModel.tableName).del();
    // await knex(Order.tableName).del();
    // await knex(StrategyModel.tableName).del();
    // await knex(SymbolModel.tableName).del();

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
    await knex<OrderTypes.OrderProps & { id: number }>(Order.tableName).insert([
        {
            id: 1,
            strategyId: 1,
            symbolId: 1,
            alpacaOrderId: '1',
        },
        {
            id: 2,
            strategyId: 1,
            symbolId: 2,
            alpacaOrderId: '2',
        },
        {
            id: 3,
            strategyId: 2,
            symbolId: 2,
            alpacaOrderId: '3',
        },
        {
            id: 4,
            strategyId: 2,
            symbolId: 3,
            alpacaOrderId: '4',
        },
        {
            id: 5,
            strategyId: 3,
            symbolId: 3,
            alpacaOrderId: '5',
        },
        {
            id: 6,
            strategyId: 3,
            symbolId: 1,
            alpacaOrderId: '6',
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
                .active,
            cashInCents: 100,
            sellAtPercentile: 50,
        },
        {
            id: 2,
            strategyId: 2,
            status: StrategyTemplateSeaDogDiscountSchemeTypes.StatusSchema.Enum
                .inactive,
            cashInCents: 200,
            sellAtPercentile: 75,
        },
        {
            id: 3,
            strategyId: 3,
            status: StrategyTemplateSeaDogDiscountSchemeTypes.StatusSchema.Enum
                .active,
            cashInCents: 300,
            sellAtPercentile: 100,
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
    // process.env?.BLACKDOG_CONFIGURATOR_BACKEND_DEV_ALPACA_API_KEY ?? ''
}
