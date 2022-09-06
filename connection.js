const { Client, DatabaseError } = require("pg");

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "12345678",
    database: "teeBay_DB",
});

module.exports = client;