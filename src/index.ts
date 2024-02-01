import express from 'express';
import cors from 'cors';
import knex from 'knex';
import knexConfig from './db/knexfile.js';
import { Model } from 'objection';
import strategyRouter from './routes/strategy/index.js';
import strategyTemplateRouter from './routes/strategyTemplate/index.js';
import orderRouter from './routes/order.js';
import symbolRouter from './routes/symbol.js';
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import * as Errors from './errors/index.js';
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
        origin: /^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?/,
    })
);
app.use(express.json());

app.get('/', (req, res) => {
    return res.send('Hello World');
});
app.use('/symbol', symbolRouter);
app.use('/strategy', strategyRouter);
app.use('/strategyTemplate', strategyTemplateRouter);
app.use('/order', orderRouter);
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'error',
            message: `Invalid request params: ${err.message}`,
        });
    }
    if (err instanceof Errors.ModelNotFoundError) {
        return res.status(404).json({
            status: 'error',
            message: err.message,
        });
    }
    return res.status(500).json({
        status: 'error',
        message: err.message,
    });
});

// app.use('/config', configRouter);
// app.use('/symbol', symbolRouter);
// app.use('/buy-order', buyOrderRouter);
// app.use('/position', positionRouter);
// app.use('/sell-order', sellOrderRouter);

app.listen(PORT, HOST, () => {
    console.log(`Running on ${SCHEME}://${HOST}:${PORT}`);
});
