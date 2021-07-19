require('dotenv').config();

const {
    DB_CONNECTION,
    DB_HOST,
    DB_PORT,
    DB_DATABASE,
    DB_USERNAME,
    DB_PASSWORD
} = process.env;

module.exports = {
    development: {
        client: DB_CONNECTION,
        connection: {
            host: DB_HOST,
            user: DB_USERNAME,
            password: DB_PASSWORD,
            database: DB_DATABASE,
            port: DB_PORT,
            timezone: 'utc',
        },
        migrations: {
            directory: __dirname + '/knex/migrations',
            tableName: 'migrations',
        }
    }
}