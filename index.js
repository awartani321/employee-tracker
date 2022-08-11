const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
require('console.table');

let connection = null;
async function connectDatabase() {
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'employees',
            port: 3307
        });
        

        connection.close();
    } catch (err) {
        console.log("Database connection is failed");
    }
}
connectDatabase();

