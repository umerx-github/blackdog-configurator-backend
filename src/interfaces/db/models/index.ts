export interface RequiredConfigInterface {
    sellAtPercentile: number;
    buyAtPercentile: number;
    buyTrailingPercent: number;
    sellTrailingPercent: number;
    timeframeInDays: number;
    alpacaApiKey: string;
    alpacaApiSecret: string;
}

export interface ConfigInterface extends RequiredConfigInterface {
    id: number;
    isActive: boolean;
    createdAt: string;
    symbols: OrderedSymbolInterface[];
}

export interface NewConfigInterface extends RequiredConfigInterface {
    isActive?: boolean;
    symbols?: OrderedSymbolInterface[];
}

export interface RequiredSymbolInterface {
    name: string;
}

export interface SymbolInterface extends RequiredSymbolInterface {
    id: number;
    createdAt: string;
}

export interface NewSymbolInterface extends RequiredSymbolInterface {}

export interface OrderedSymbolInterface extends SymbolInterface {
    order: number;
}
