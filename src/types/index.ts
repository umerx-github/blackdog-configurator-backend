import { Order as OrderTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';

/* class decorator */
export function staticImplements<T>() {
    return <U extends T>(constructor: U) => {
        constructor;
    };
}

export interface MyTypeStatic<T> {
    new (): T;
    staticMethod(): string;
}
