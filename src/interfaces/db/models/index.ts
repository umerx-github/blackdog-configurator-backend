export interface NewConfigRequestInterface {
    isActive?: boolean;
    symbols?: OrderedSymbolInterface[];
    sellAtPercentile: number;
    buyAtPercentile: number;
    buyTrailingPercent: number;
    sellTrailingPercent: number;
    minimumGainPercent: number;
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
    minimumGainPercent?: number;
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
    minimumGainPercent: number;
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

export enum PositionStatusEnum {
    open = 'open',
    closed = 'closed',
}

export enum OrderStatusEnum {
    open = 'open',
    closed = 'closed',
    cancelled = 'cancelled',
}

export enum OrderTypeEnum {
    market = 'market',
    limit = 'limit',
    stop = 'stop',
    stop_limit = 'stop_limit',
    trailing_stop = 'trailing_stop',
}

export interface GetBuyOrderManyRequestInterface {
    status?: OrderStatusEnum;
}
export interface NewBuyOrderRequestInterface {
    status: OrderStatusEnum;
    configId: number;
    symbolId: number;
    alpacaOrderId: string;
    type: OrderTypeEnum;
    priceInDollars: number;
}
export interface NewBuyOrderInterface {
    status: OrderStatusEnum;
    configId: number;
    symbolId: number;
    alpacaOrderId: string;
    type: OrderTypeEnum;
    priceInCents: number;
}

export interface BuyOrderInterface {
    id: number;
    createdAt: string;
    status: OrderStatusEnum;
    configId: number;
    config: ConfigInterface;
    symbolId: number;
    symbol: SymbolInterface;
    alpacaOrderId: string;
    type: OrderTypeEnum;
    priceInCents: number;
    priceInDollars: number;
}

export interface NewPositionRequestInterface {
    status: PositionStatusEnum;
    buyOrderId: number;
    symbolId: number;
}
export interface NewPositionInterface {
    status: PositionStatusEnum;
    buyOrderId: number;
    symbolId: number;
}

export interface PositionInterface {
    id: number;
    createdAt: string;
    status: PositionStatusEnum;
    buyOrderId: number;
    buyOrder: BuyOrderInterface;
    symbolId: number;
    symbol: SymbolInterface;
}

export interface NewSellOrderRequestInterface {
    status: OrderStatusEnum;
    positionId: number;
    configId: number;
    symbolId: number;
    alpacaOrderId: string;
    type: OrderTypeEnum;
    priceInDollars: number;
}
export interface NewSellOrderInterface {
    status: OrderStatusEnum;
    positionId: number;
    configId: number;
    symbolId: number;
    alpacaOrderId: string;
    type: OrderTypeEnum;
    priceInCents: number;
}

export interface SellOrderInterface {
    id: number;
    createdAt: string;
    status: OrderStatusEnum;
    positionId: number;
    position: PositionInterface;
    configId: number;
    config: ConfigInterface;
    symbolId: number;
    symbol: SymbolInterface;
    alpacaOrderId: string;
    type: OrderTypeEnum;
    priceInCents: number;
    priceInDollars: number;
}
