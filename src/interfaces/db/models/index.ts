export interface NewConfigRequestInterface {
    isActive?: boolean;
    symbols?: OrderedSymbolInterface[];
    sellAtPercentile: number;
    buyAtPercentile: number;
    buyTrailingPercent: number;
    sellTrailingPercent: number;
    timeframeInDays: number;
    alpacaApiKey: string;
    alpacaApiSecret: string;
    cashInDollars: number;
}
export interface NewConfigInterface {
    isActive?: boolean;
    symbols?: OrderedSymbolInterface[];
    sellAtPercentile?: number;
    buyAtPercentile?: number;
    sellTrailingPercent?: number;
    buyTrailingPercent?: number;
    timeframeInDays?: number;
    alpacaApiKey?: string;
    alpacaApiSecret?: string;
    cashInCents?: number;
}
export interface ConfigInterface {
    id: number;
    createdAt: string;
    isActive: boolean;
    symbols: OrderedSymbolInterface[];
    sellAtPercentile: number;
    buyAtPercentile: number;
    buyTrailingPercent: number;
    sellTrailingPercent: number;
    timeframeInDays: number;
    alpacaApiKey: string;
    alpacaApiSecret: string;
    cashInCents: number;
    cashInDollars: number;
}
export interface NewSymbolRequestInterface {
    name: string;
}
export interface NewSymbolInterface {
    name: string;
}

export interface SymbolInterface {
    id: number;
    createdAt: string;
    name: string;
}

export interface OrderedSymbolInterface extends SymbolInterface {
    order: number;
}

export enum SideEnum {
    buy = 'buy',
    sell = 'sell',
}

export enum StatusEnum {
    open = 'open',
    closed = 'closed',
}

export enum OrderTypeEnum {
    market = 'market',
    limit = 'limit',
    stop = 'stop',
    stop_limit = 'stop_limit',
    trailing_stop = 'trailing_stop',
}
export interface NewOrderRequestInterface {
    configId: number;
    symbolId: number;
    alpacaOrderId: string;
    side: SideEnum;
    type: OrderTypeEnum;
    priceInDollars: number;
}
export interface NewOrderInterface {
    configId: number;
    symbolId: number;
    alpacaOrderId: string;
    side: SideEnum;
    type: OrderTypeEnum;
    priceInCents: number;
}

export interface OrderInterface {
    id: number;
    createdAt: string;
    config: ConfigInterface;
    symbol: SymbolInterface;
    alpacaOrderId: string;
    side: SideEnum;
    type: OrderTypeEnum;
    priceInCents: number;
    priceInDollars: number;
}

export interface NewPositionRequestInterface {
    symbolId: number;
}
export interface NewPositionInterface {
    symbolId: number;
}

export interface PositionInterface {
    id: number;
    createdAt: string;
    symbol: SymbolInterface;
}
