export type ResponseBase<T> =
    | { status: 'success'; message: string; data: T }
    | { status: 'error'; message: string };

export interface GetConfigsRequestInterface {
    isActive?: boolean;
}
export interface NewConfigRequestInterface {
    isActive: boolean;
    sellAtPercentile: number;
    buyAtPercentile: number;
    buyTrailingPercent: number;
    sellTrailingPercent: number;
    minimumGainPercent: number;
    timeframeInDays: number;
    alpacaApiKey: string;
    alpacaApiSecret: string;
    cashInDollars: number;
    configSymbols: NewConfigSymbolForConfigRequestInterface[];
}

export interface NewConfigInterface {
    isActive: boolean;
    sellAtPercentile: number;
    buyAtPercentile: number;
    sellTrailingPercent: number;
    buyTrailingPercent: number;
    minimumGainPercent: number;
    timeframeInDays: number;
    alpacaApiKey: string;
    alpacaApiSecret: string;
    cashInCents: number;
    // configSymbols: NewConfigSymbolForConfigRequestInterface[];
}

export interface UpdateConfigRequestInterface {
    isActive?: boolean;
    sellAtPercentile?: number;
    buyAtPercentile?: number;
    buyTrailingPercent?: number;
    sellTrailingPercent?: number;
    minimumGainPercent?: number;
    timeframeInDays?: number;
    alpacaApiKey?: string;
    alpacaApiSecret?: string;
    cashInDollars?: number;
    configSymbols?: NewConfigSymbolForConfigRequestInterface[];
}
export interface UpdateConfigInterface {
    isActive?: boolean;
    sellAtPercentile?: number;
    buyAtPercentile?: number;
    sellTrailingPercent?: number;
    buyTrailingPercent?: number;
    minimumGainPercent?: number;
    timeframeInDays?: number;
    alpacaApiKey?: string;
    alpacaApiSecret?: string;
    cashInCents?: number;
    // configSymbols?: NewConfigSymbolRequestInterface[];
}
export interface ConfigInterface {
    id: number;
    createdAt: string;
    isActive: boolean;
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
    configSymbols: ConfigSymbolInterface[];
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
export interface GetSymbolsRequestInterface {
    name?: string;
}
export interface NewConfigSymbolRequestInterface {
    configId: number;
    symbolId: number;
    order: number;
}

export interface NewConfigSymbolForConfigRequestInterface {
    symbolId: number;
    order: number;
}

export interface NewConfigSymbolInterface {
    configId: number;
    symbolId: number;
    order: number;
}

export interface UpdateConfigSymbolRequestInterface {
    configId?: number;
    symbolId?: number;
    order?: number;
}

export interface UpdateConfigSymbolInterface {
    configId?: number;
    symbolId?: number;
    order?: number;
}

export interface ConfigSymbolInterface {
    id: number;
    createdAt: string;
    configId: number;
    symbolId: number;
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

export interface GetBuyOrdersRequestInterface {
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

export interface PatchBuyOrderRequestInterface {
    status?: OrderStatusEnum;
}

export interface UpdateBuyOrderInterface {
    status?: OrderStatusEnum;
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

export interface GetPositionsRequestInterface {
    status?: PositionStatusEnum;
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
