import express from 'express';
import cors from 'cors';
import knex from 'knex';
import knexConfig from './db/knexfile.js';
import { Model } from 'objection';
import symbolRouter from './routes/symbol.js';
import strategyRouter from './routes/strategy/index.js';
import orderRouter from './routes/order.js';
import positionRouter from './routes/position.js';
import strategyTemplateRouter from './routes/strategyTemplate/index.js';
import strategyLogRouter from './routes/strategyLog.js';
import strategyValueRouter from './routes/strategyValue.js';
import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodIssueCode } from 'zod';
import * as Errors from './errors/index.js';
import {
    ResponseBaseError,
    ResponseBaseErrorExpected,
} from '@umerx/umerx-blackdog-configurator-types-typescript/build/src/response.js';
import { getResponseError } from './utils/response.js';
const ENVIRONMENT = process.env.ENVIRONMENT || 'development';
const SCHEME = process.env.SCHEME || 'http';
const PORT = Number(process.env.PORT) || 80;
const HOST = process.env.HOST || '0.0.0.0';

export const KNEXION = knex.knex(knexConfig[ENVIRONMENT]);

// Bind all Models to a knex instance. If you only have one database in
// your server this is all you have to do. For multi database systems, see
// the Model.bindKnex() method.
Model.knex(KNEXION);

const app = express();

// https://expressjs.com/en/resources/middleware/cors.html#configuration-options
app.use(
    cors({
        origin: [
            /^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?/,
            /^https?:\/\/.*.umerx.app(:[0-9]+)?/,
        ],
        credentials: true,
    })
);
app.use(express.json());

app.get('/', (req, res) => {
    return res.send('Hello World');
});
app.use('/symbol', symbolRouter);
app.use('/strategy', strategyRouter);
app.use('/order', orderRouter);
app.use('/position', positionRouter);
app.use('/strategyTemplate', strategyTemplateRouter);
app.use('/strategyLog', strategyLogRouter);
app.use('/strategyValue', strategyValueRouter);

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof Errors.PersistedDataSchemaValidationError) {
        console.error(err);
        return res
            .status(500)
            .json(getResponseError(err.customMessage, err.issues));
    }
    if (err instanceof Errors.ClientInputDataValidationError) {
        return res
            .status(400)
            .json(getResponseError(err.customMessage, err.issues));
    }
    if (err instanceof ZodError) {
        return res
            .status(400)
            .json(
                getResponseError(
                    `Please correct the following issues`,
                    err.issues
                )
            );
    }
    if (err instanceof Errors.ModelNotFoundError) {
        return res.status(404).json(getResponseError(err.message));
    }
    console.error(err);
    return res.status(500).json(getResponseError(err.message));
});
app.use((req, res, next) => {
    res.status(404).json(getResponseError(`Not found`));
});

// app.use('/config', configRouter);
// app.use('/symbol', symbolRouter);
// app.use('/buy-order', buyOrderRouter);
// app.use('/position', positionRouter);
// app.use('/sell-order', sellOrderRouter);

app.listen(PORT, HOST, () => {
    console.log(`Running on ${SCHEME}://${HOST}:${PORT}`);
});
