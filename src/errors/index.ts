import { ZodError, ZodIssue } from "zod";

// Define the custom exception
export class ModelNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ModelNotFoundError';
    }
}

export class UnableToCreateInstanceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnableToCreateInstanceError';
    }
}

export class UnableToUpdateInstanceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnableToUpdateInstanceError';
    }
}

export class MissingRelationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MissingRelationError';
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

export class ClientInputDataValidationError extends ZodErrorWithMessage {
    constructor(customMessage: string, issues: ZodIssue[]) {
        super(customMessage, issues);
        this.name = 'ClientInputDataValidationError';
    }
}

export class PersistedDataSchemaValidationError extends ZodErrorWithMessage {
    constructor(customMessage: string, issues: ZodIssue[]) {
        super(customMessage, issues);
        this.name = 'PersistedDataSchemaValidationError';
    }
}
