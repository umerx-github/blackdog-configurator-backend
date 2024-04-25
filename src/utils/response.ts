import { Response as ResponseTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { PersistedDataSchemaValidationError } from '../errors/index.js';
import { ZodError, z } from 'zod';
export function getResponseError(
    message: string,
    issues: (z.ZodIssueBase & { code: z.ZodIssueCode })[] = []
): ResponseTypes.ResponseBaseError {
    return {
        status: 'error',
        message,
        issues,
    };
}

export function validateResponse<T>(callback: () => T): T {
    try {
        return callback();
    } catch (err) {
        if (err instanceof ZodError) {
            throw new PersistedDataSchemaValidationError("Persisted data schema validation error", err.issues);
        }
        throw err;
    }
}
