import express from 'express';
import knex from 'knex';
import knexConfig from './db/knexfile.js';
import { Model } from 'objection';

export const KNEXION_DEV = knex.knex(knexConfig.development);

// Bind all Models to a knex instance. If you only have one database in
// your server this is all you have to do. For multi database systems, see
// the Model.bindKnex() method.
Model.knex(KNEXION_DEV);
import configRouter from './routes/config.js';

const app = express();
const PROTOCOL = 'http';
const PORT = 80;
const HOST = '0.0.0.0';

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/config', configRouter);

app.listen(PORT, HOST, () => {
    console.log(`Running on ${PROTOCOL}://${HOST}:${PORT}`);
});
