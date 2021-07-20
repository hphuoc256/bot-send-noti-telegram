require('dotenv').config();

const {
    DB_CONNECTION,
    DB_HOST,
    DB_PORT,
    DB_DATABASE,
    DB_USERNAME,
    DB_PASSWORD,
    DB_FILENAME
} = process.env;

let connection = {};
if (DB_CONNECTION === 'mysql') {
    connection = {
        host: DB_HOST,
        user: DB_USERNAME,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        port: DB_PORT,
        timezone: 'utc',
    }
} else if (DB_CONNECTION === 'sqlite3') {
    connection = {
        filename: DB_FILENAME
    }
}

module.exports = {
    development: {
        client: DB_CONNECTION,
        connection: connection,
        useNullAsDefault: true,
        migrations: {
            directory: __dirname + '/knex/migrations',
            tableName: 'migrations',
        }
    }
}
