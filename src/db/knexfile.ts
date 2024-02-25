import type { Knex } from 'knex';

// Update with your config settings.
const typeCast = (
    field: {
        type: string;
        length: number;
        string: () => string;
    },
    next: () => void
) => {
    if (field.type === 'TINY' && field.length === 1) {
        const value = field.string();
        return value ? value === '1' : null;
    }
    return next();
};

const config: { [key: string]: Knex.Config } = {
    development: {
        client: 'mysql2',
        connection: {
            host: process.env.BLACKDOG_CONFIGURATOR_BACKEND_DB_HOSTNAME,
            database: process.env.BLACKDOG_CONFIGURATOR_BACKEND_DB_NAME,
            user: process.env.BLACKDOG_CONFIGURATOR_BACKEND_DB_USER,
            password: process.env.BLACKDOG_CONFIGURATOR_BACKEND_DB_PASSWORD,
            typeCast: typeCast,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    },

    staging: {
        client: 'mysql2',
        connection: {
            host: process.env.BLACKDOG_CONFIGURATOR_BACKEND_DB_HOSTNAME,
            database: process.env.BLACKDOG_CONFIGURATOR_BACKEND_DB_NAME,
            user: process.env.BLACKDOG_CONFIGURATOR_BACKEND_DB_USER,
            password: process.env.BLACKDOG_CONFIGURATOR_BACKEND_DB_PASSWORD,
            typeCast: typeCast,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    },

    production: {
        client: 'mysql2',
        connection: {
            host: process.env.BLACKDOG_CONFIGURATOR_BACKEND_DB_HOSTNAME,
            database: process.env.BLACKDOG_CONFIGURATOR_BACKEND_DB_NAME,
            user: process.env.BLACKDOG_CONFIGURATOR_BACKEND_DB_USER,
            password: process.env.BLACKDOG_CONFIGURATOR_BACKEND_DB_PASSWORD,
            typeCast: typeCast,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    },
};

export default config;
