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
