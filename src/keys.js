module.exports = {
    database: {
        connectionLimit: 10,
        host: 'localhost',
        user: 'root',
        /* password: 'infoita123', */
        password: '',
        database: 'db_multip',
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
};