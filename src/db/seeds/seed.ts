import { Knex } from 'knex';
import {
    Log as LogTypes,
    Strategy as StrategyTypes,
    StrategyLog as StrategyLogTypes,
    StrategyValue as StrategyValueTypes,
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
import { StrategyLog as StrategyLogModel } from '../models/StrategyLog.js';
import { StrategyValue as StrategyValueModel } from '../models/StrategyValue.js';
async function truncateTableIfExists(tableName: string, knex: Knex) {
    if (await knex.schema.hasTable(tableName)) {
        await knex(tableName).del();
    }
}
export async function seed(knex: Knex): Promise<void> {
    await knex.transaction(async trx => {
        await truncateTableIfExists(
            StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol,
            trx
        );
        await truncateTableIfExists(
            StrategyTemplateSeaDogDiscountSchemeModel.tableName,
            trx
        );
        await truncateTableIfExists(PositionModel.tableName, trx);
        await truncateTableIfExists(OrderModel.tableName, trx);
        await truncateTableIfExists(StrategyModel.tableName, trx);
        await truncateTableIfExists(SymbolModel.tableName, trx);
        await truncateTableIfExists(StrategyLogModel.tableName, trx);
        await truncateTableIfExists(StrategyValueModel.tableName, trx);

        // Inserts seed entries
        await trx<SymbolTypes.SymbolProps & { id: number }>(
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
        await trx<StrategyTypes.StrategyProps & { id: number }>(
            StrategyModel.tableName
        ).insert([
            {
                id: 1,
                title: 'My First NoOp Strategy',
                status: StrategyTypes.StatusSchema.Enum.active,
                strategyTemplateName:
                    StrategyTemplateTypes.StrategyTemplateNameSchema.Enum.NoOp,
                cashInCents: 100000,
            },
            {
                id: 2,
                title: 'My Second SeaDogDiscountScheme Strategy',
                status: StrategyTypes.StatusSchema.Enum.active,
                strategyTemplateName:
                    StrategyTemplateTypes.StrategyTemplateNameSchema.Enum
                        .SeaDogDiscountScheme,
                cashInCents: 200000,
            },
            {
                id: 3,
                title: 'My Third SeaDogDiscountScheme Strategy',
                status: StrategyTypes.StatusSchema.Enum.inactive,
                strategyTemplateName:
                    StrategyTemplateTypes.StrategyTemplateNameSchema.Enum
                        .SeaDogDiscountScheme,
                cashInCents: 300000,
            },
        ]);
        await trx<OrderTypes.OrderRequiredFields & { id: number }>(
            OrderModel.tableName
        ).insert([
            {
                id: 1,
                strategyId: 1,
                symbolId: 1,
                alpacaOrderId: '1',
                status: OrderTypes.StatusSchema.Enum.open,
                side: OrderTypes.SideSchema.Enum.buy,
                quantity: 1,
                averagePriceInCents: 100,
            },
            {
                id: 2,
                strategyId: 1,
                symbolId: 2,
                alpacaOrderId: '2',
                status: OrderTypes.StatusSchema.Enum.open,
                side: OrderTypes.SideSchema.Enum.buy,
                quantity: 2,
                averagePriceInCents: 100,
            },
            {
                id: 3,
                strategyId: 2,
                symbolId: 2,
                alpacaOrderId: '3',
                status: OrderTypes.StatusSchema.Enum.closed,
                side: OrderTypes.SideSchema.Enum.buy,
                quantity: 3,
                averagePriceInCents: 300,
            },
            {
                id: 4,
                strategyId: 2,
                symbolId: 3,
                alpacaOrderId: '4',
                status: OrderTypes.StatusSchema.Enum.open,
                side: OrderTypes.SideSchema.Enum.sell,
                quantity: 4,
                averagePriceInCents: 400,
            },
            {
                id: 5,
                strategyId: 3,
                symbolId: 3,
                alpacaOrderId: '5',
                status: OrderTypes.StatusSchema.Enum.open,
                side: OrderTypes.SideSchema.Enum.sell,
                quantity: 5,
                averagePriceInCents: 500,
            },
            {
                id: 6,
                strategyId: 3,
                symbolId: 1,
                alpacaOrderId: '6',
                status: OrderTypes.StatusSchema.Enum.closed,
                side: OrderTypes.SideSchema.Enum.sell,
                quantity: 6,
                averagePriceInCents: 600,
            },
        ]);
        await trx<PositionTypes.PositionProps & { id: number }>(
            PositionModel.tableName
        ).insert([
            {
                id: 1,
                strategyId: 1,
                symbolId: 1,
                quantity: 1,
                averagePriceInCents: 100,
            },
            {
                id: 2,
                strategyId: 1,
                symbolId: 2,
                quantity: 2,
                averagePriceInCents: 200,
            },
            {
                id: 3,
                strategyId: 2,
                symbolId: 2,
                quantity: 3,
                averagePriceInCents: 300,
            },
            {
                id: 4,
                strategyId: 2,
                symbolId: 3,
                quantity: 4,
                averagePriceInCents: 200,
            },
            {
                id: 5,
                strategyId: 3,
                symbolId: 3,
                quantity: 5,
                averagePriceInCents: 500,
            },
            {
                id: 6,
                strategyId: 3,
                symbolId: 1,
                quantity: 6,
                averagePriceInCents: 600,
            },
            {
                id: 7,
                strategyId: 1,
                symbolId: 3,
                quantity: 10,
                averagePriceInCents: 10000,
            },
        ]);
        await trx<
            StrategyTemplateSeaDogDiscountSchemeTypes.StrategyTemplateSeaDogDiscountSchemeProps & {
                id: number;
            }
        >(StrategyTemplateSeaDogDiscountSchemeModel.tableName).insert([
            {
                id: 1,
                strategyId: 2,
                status: StrategyTemplateSeaDogDiscountSchemeTypes.StatusSchema
                    .Enum.inactive,
                alpacaAPIKey: process.env.ALPACA_CLIENT_CREDENTIALS_KEY ?? '',
                alpacaAPISecret:
                    process.env.ALPACA_CLIENT_CREDENTIALS_SECRET ?? '',
                alpacaAPIPaper: true,
                buyAtPercentile: 25,
                sellAtPercentile: 70,
                minimumGainPercent: 10,
                timeframeInDays: 90,
            },
            {
                id: 2,
                strategyId: 2,
                status: StrategyTemplateSeaDogDiscountSchemeTypes.StatusSchema
                    .Enum.active,
                alpacaAPIKey: process.env.ALPACA_CLIENT_CREDENTIALS_KEY ?? '',
                alpacaAPISecret:
                    process.env.ALPACA_CLIENT_CREDENTIALS_SECRET ?? '',
                alpacaAPIPaper: true,
                buyAtPercentile: 50,
                sellAtPercentile: 75,
                minimumGainPercent: 9,
                timeframeInDays: 100,
            },
            {
                id: 3,
                strategyId: 3,
                status: StrategyTemplateSeaDogDiscountSchemeTypes.StatusSchema
                    .Enum.active,
                alpacaAPIKey: process.env.ALPACA_CLIENT_CREDENTIALS_KEY ?? '',
                alpacaAPISecret:
                    process.env.ALPACA_CLIENT_CREDENTIALS_SECRET ?? '',
                alpacaAPIPaper: true,
                buyAtPercentile: 40,
                sellAtPercentile: 60,
                minimumGainPercent: 10,
                timeframeInDays: 365,
            },
        ]);
        await trx<
            StrategyTemplateSeaDogDiscountSchemeSymbolTypes.StrategyTemplateSeaDogDiscountSchemeSymbolProps & {
                id: number;
            }
        >(
            StrategyTemplateSeaDogDiscountSchemeModel.tableNameJunctionSymbol
        ).insert([
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
        ]);
        await trx<StrategyLogTypes.StrategyLogModelInterface>(
            StrategyLogModel.tableName
        ).insert([
            {
                id: 1,
                strategyId: 1,
                level: LogTypes.LogLevelSchema.Enum.info,
                message: 'My First NoOp Strategy',
                data: {
                    rawData: { message: 'My First NoOp Strategy' },
                },
                timestamp: Date.now(),
            },
            {
                id: 2,
                strategyId: 2,
                level: LogTypes.LogLevelSchema.Enum.debug,
                message: 'My Second SeaDogDiscountScheme Strategy',
                data: {
                    rawData: {
                        message: 'My Second SeaDogDiscountScheme Strategy',
                    },
                },
                timestamp: Date.now(),
            },
            {
                id: 3,
                strategyId: 3,
                level: LogTypes.LogLevelSchema.Enum.notice,
                message: 'My Third SeaDogDiscountScheme Strategy',
                data: {
                    rawData: {
                        message: 'My Third SeaDogDiscountScheme Strategy',
                    },
                },
                timestamp: Date.now(),
            },
            {
                id: 4,
                strategyId: 1,
                level: LogTypes.LogLevelSchema.Enum.warning,
                message: 'My First NoOp Strategy',
                data: {
                    rawData: { message: 'My First NoOp Strategy' },
                },
                timestamp: Date.now(),
            },
            {
                id: 5,
                strategyId: 2,
                level: LogTypes.LogLevelSchema.Enum.error,
                message: 'My Second SeaDogDiscountScheme Strategy',
                data: {
                    rawData: {
                        message: 'My Second SeaDogDiscountScheme Strategy',
                    },
                },
                timestamp: Date.now(),
            },
            {
                id: 6,
                strategyId: 3,
                level: LogTypes.LogLevelSchema.Enum.critical,
                message: 'My Third SeaDogDiscountScheme Strategy',
                data: {
                    rawData: {
                        message: 'My Third SeaDogDiscountScheme Strategy',
                    },
                },
                timestamp: Date.now(),
            },
            {
                id: 7,
                strategyId: 1,
                level: LogTypes.LogLevelSchema.Enum.alert,
                message: 'My First NoOp Strategy',
                data: {
                    rawData: { message: 'My First NoOp Strategy' },
                },
                timestamp: Date.now(),
            },
            {
                id: 8,
                strategyId: 2,
                level: LogTypes.LogLevelSchema.Enum.emergency,
                message: 'My Second SeaDogDiscountScheme Strategy',
                data: {
                    rawData: {
                        message: 'My Second SeaDogDiscountScheme Strategy',
                    },
                },
                timestamp: Date.now(),
            },
            {
                id: 9,
                strategyId: 3,
                level: LogTypes.LogLevelSchema.Enum.info,
                message: 'My Third SeaDogDiscountScheme Strategy',
                data: {
                    rawData: {
                        message: 'My Third SeaDogDiscountScheme Strategy',
                    },
                },
                timestamp: Date.now(),
            },
            {
                id: 10,
                strategyId: 1,
                level: LogTypes.LogLevelSchema.Enum.debug,
                message: 'My First NoOp Strategy',
                data: {
                    rawData: { message: 'My First NoOp Strategy' },
                },
                timestamp: Date.now(),
            },
            {
                id: 11,
                strategyId: 2,
                level: LogTypes.LogLevelSchema.Enum.notice,
                message: 'My Second SeaDogDiscountScheme Strategy',
                data: {
                    rawData: {
                        message: 'My Second SeaDogDiscountScheme Strategy',
                    },
                },
                timestamp: Date.now(),
            },
            {
                id: 12,
                strategyId: 3,
                level: LogTypes.LogLevelSchema.Enum.warning,
                message: 'My Third SeaDogDiscountScheme Strategy',
                data: {
                    rawData: {
                        message: 'My Third SeaDogDiscountScheme Strategy',
                    },
                },
                timestamp: Date.now(),
            },
            {
                id: 13,
                strategyId: 1,
                level: LogTypes.LogLevelSchema.Enum.error,
                message: 'My First NoOp Strategy',
                data: {
                    rawData: { message: 'My First NoOp Strategy' },
                },
                timestamp: Date.now(),
            },
            {
                id: 14,
                strategyId: 2,
                level: LogTypes.LogLevelSchema.Enum.critical,
                message: 'My Second SeaDogDiscountScheme Strategy',
                data: {
                    rawData: {
                        message: 'My Second SeaDogDiscountScheme Strategy',
                    },
                },
                timestamp: Date.now(),
            },
            {
                id: 15,
                strategyId: 3,
                level: LogTypes.LogLevelSchema.Enum.alert,
                message: 'My Third SeaDogDiscountScheme Strategy',
                data: {
                    rawData: {
                        message: 'My Third SeaDogDiscountScheme Strategy',
                    },
                },
                timestamp: Date.now(),
            },
            {
                id: 16,
                strategyId: 1,
                level: LogTypes.LogLevelSchema.Enum.emergency,
                message: 'My First NoOp Strategy',
                data: {
                    rawData: { message: 'My First NoOp Strategy' },
                },
                timestamp: Date.now(),
            },
            {
                id: 17,
                strategyId: 2,
                level: LogTypes.LogLevelSchema.Enum.info,
                message: 'My Second SeaDogDiscountScheme Strategy',
                data: {
                    rawData: {
                        message: 'My Second SeaDogDiscountScheme Strategy',
                    },
                },
                timestamp: Date.now(),
            },
            {
                id: 18,
                strategyId: 3,
                level: LogTypes.LogLevelSchema.Enum.debug,
                message: 'My Third SeaDogDiscountScheme Strategy',
                data: {
                    rawData: {
                        message: 'My Third SeaDogDiscountScheme Strategy',
                    },
                },
                timestamp: Date.now(),
            },
        ]);
        const now = Date.now()
        await trx<StrategyValueTypes.StrategyValueModelInterface>(
            StrategyValueModel.tableName
        ).insert([
            {
                id: 1,
                strategyId: 1,
                timestamp: now - 1000 * 60 * 60 * 24 * 10,
                valueInCents: 100,
            },
            {
                id: 2,
                strategyId: 1,
                timestamp: now - 1000 * 60 * 60 * 24 * 9,
                valueInCents: 200,
            },
            {
                id: 3,
                strategyId: 1,
                timestamp: now - 1000 * 60 * 60 * 24 * 8,
                valueInCents: 300,
            },
            {
                id: 4,
                strategyId: 1,
                timestamp: now - 1000 * 60 * 60 * 24 * 7,
                valueInCents: 400,
            },
            {
                id: 5,
                strategyId: 1,
                timestamp: now - 1000 * 60 * 60 * 24 * 6,
                valueInCents: 500,
            },
            {
                id: 6,
                strategyId: 2,
                timestamp: now - 1000 * 60 * 60 * 24 * 10,
                valueInCents: 600,
            },
            {
                id: 7,
                strategyId: 2,
                timestamp: now - 1000 * 60 * 60 * 24 * 9,
                valueInCents: 700,
            },
            {
                id: 8,
                strategyId: 2,
                timestamp: now - 1000 * 60 * 60 * 24 * 8,
                valueInCents: 800,
            },
            {
                id: 9,
                strategyId: 2,
                timestamp: now - 1000 * 60 * 60 * 24 * 7,
                valueInCents: 900,
            },
            {
                id: 10,
                strategyId: 2,
                timestamp: now - 1000 * 60 * 60 * 24 * 6,
                valueInCents: 1000,
            },
            {
                id: 11,
                strategyId: 3,
                timestamp: now - 1000 * 60 * 60 * 24 * 10,
                valueInCents: 1100,
            },
            {
                id: 12,
                strategyId: 3,
                timestamp: now - 1000 * 60 * 60 * 24 * 9,
                valueInCents: 1200,
            },
            {
                id: 13,
                strategyId: 3,
                timestamp: now - 1000 * 60 * 60 * 24 * 8,
                valueInCents: 1300,
            },
            {
                id: 14,
                strategyId: 3,
                timestamp: now - 1000 * 60 * 60 * 24 * 7,
                valueInCents: 1400,
            },
            {
                id: 15,
                strategyId: 3,
                timestamp: now - 1000 * 60 * 60 * 24 * 6,
                valueInCents: 1500,
            },
            {
                id: 16,
                strategyId: 3,
                timestamp: now - 1000 * 60 * 60 * 24 * 5,
                valueInCents: 1600,
            },
            {
                id: 17,
                strategyId: 3,
                timestamp: now - 1000 * 60 * 60 * 24 * 4,
                valueInCents: 1700,
            },
            {
                id: 18,
                strategyId: 3,
                timestamp: now - 1000 * 60 * 60 * 24 * 3,
                valueInCents: 1800,
            },
            {
                id: 19,
                strategyId: 3,
                timestamp: now - 1000 * 60 * 60 * 24 * 2,
                valueInCents: 1900,
            },
            {
                id: 20,
                strategyId: 3,
                timestamp: now - 1000 * 60 * 60 * 24 * 1,
                valueInCents: 2000,
            },
            {
                id: 21,
                strategyId: 3,
                timestamp: now,
                valueInCents: 2100,
            }
        ]);
    });
}
