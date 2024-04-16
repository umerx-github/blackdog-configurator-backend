import { ZodError, ZodIssue } from "zod";

// Define the custom exception
export class ModelNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ModelNotFoundError';
    }
}

export class ZodErrorWithMessage extends ZodError {
    public customMessage: string;
    constructor(customMessage: string, issues: ZodIssue[]) {
        super(issues);
        this.name = 'ZodErrorWithMessage';
        this.customMessage = customMessage;
    }
    get message() {
        return this.customMessage;
    }
}
