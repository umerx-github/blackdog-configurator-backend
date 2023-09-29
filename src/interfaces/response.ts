export type ResponseBase<T> =
    | { status: 'success'; message: string; data: T }
    | { status: 'error'; message: string };
