import { Knex } from 'knex';
import {
    NewBuyOrderInterface,
    NewConfigInterface,
    NewConfigSymbolInterface,
    NewPositionInterface,
    NewSellOrderInterface,
    NewSymbolInterface,
    OrderStatusEnum,
    PositionStatusEnum,
} from '../../interfaces/db/models/index.js';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('sellOrder').del();
    await knex('position').del();
    await knex('buyOrder').del();
    await knex('configSymbol').del();
    await knex('config').del();
    await knex('symbol').del();

    // Inserts seed entries
    await knex<NewSymbolInterface & { id: number }>('symbol').insert([
        { id: 1, name: 'TSLA' },
        { id: 2, name: 'AAPL' },
        { id: 3, name: 'AMZN' },
    ]);
    await knex<NewConfigInterface & { id: number }>('config').insert([
        {
            id: 1,
            isActive: false,
            cashInCents: 100000,
            sellAtPercentile: 0.9,
            buyAtPercentile: 0.1,
            sellTrailingPercent: 0.05,
            buyTrailingPercent: 0.05,
            minimumGainPercent: 0.05,
            timeframeInDays: 1,
            alpacaApiKey: process.env?.alpacaApiKey ?? '',
            alpacaApiSecret: process.env?.alpacaApiSecret ?? '',
        },
        {
            id: 2,
            isActive: false,
            cashInCents: 100000,
            sellAtPercentile: 0.9,
            buyAtPercentile: 0.1,
            sellTrailingPercent: 0.05,
            buyTrailingPercent: 0.05,
            minimumGainPercent: 0.05,
            timeframeInDays: 1,
            alpacaApiKey: process.env?.alpacaApiKey ?? '',
            alpacaApiSecret: process.env?.alpacaApiSecret ?? '',
        },
        {
            id: 3,
            isActive: true,
            cashInCents: 100000,
            sellAtPercentile: 0.9,
            buyAtPercentile: 0.1,
            sellTrailingPercent: 0.05,
            buyTrailingPercent: 0.05,
            minimumGainPercent: 0.05,
            timeframeInDays: 1,
            alpacaApiKey: process.env?.alpacaApiKey ?? '',
            alpacaApiSecret: process.env?.alpacaApiSecret ?? '',
        },
    ]);
    await knex<NewConfigSymbolInterface & { id: number }>(
        'configSymbol'
    ).insert([
        { id: 1, configId: 3, symbolId: 1, order: 2 },
        { id: 2, configId: 3, symbolId: 2, order: 1 },
        { id: 3, configId: 3, symbolId: 3, order: 0 },
    ]);
    await knex<NewBuyOrderInterface & { id: number }>('buyOrder').insert([
        {
            id: 1,
            configId: 3,
            symbolId: 1,
            alpacaOrderId: 'testAlpacaOrderId',
            status: OrderStatusEnum.closed,
            priceInCents: 10000,
        },
        {
            id: 2,
            configId: 3,
            symbolId: 2,
            alpacaOrderId: 'testAlpacaOrderId',
            status: OrderStatusEnum.closed,
            priceInCents: 20000,
        },
        {
            id: 3,
            configId: 3,
            symbolId: 3,
            alpacaOrderId: 'testAlpacaOrderId',
            status: OrderStatusEnum.open,
            priceInCents: 30000,
        },
    ]);
    await knex<NewPositionInterface & { id: number }>('position').insert([
        {
            id: 1,
            buyOrderId: 1,
            symbolId: 1,
            status: PositionStatusEnum.closed,
        },
        {
            id: 2,
            buyOrderId: 2,
            symbolId: 2,
            status: PositionStatusEnum.open,
        },
    ]);
    await knex<NewSellOrderInterface & { id: number }>('sellOrder').insert([
        {
            id: 1,
            configId: 3,
            symbolId: 1,
            positionId: 1,
            alpacaOrderId: 'testAlpacaOrderId',
            status: OrderStatusEnum.closed,
            priceInCents: 10000,
        },
        {
            id: 2,
            configId: 3,
            symbolId: 2,
            positionId: 2,
            alpacaOrderId: 'testAlpacaOrderId',
            status: OrderStatusEnum.open,
            priceInCents: 20000,
        },
    ]);
}
