import { Response as ResponseTypes } from '@umerx/umerx-blackdog-configurator-types-typescript';
import { z } from 'zod';
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
