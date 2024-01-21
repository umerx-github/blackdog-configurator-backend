// Define the custom exception
export class ModelNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ModelNotFoundError';
    }
}
