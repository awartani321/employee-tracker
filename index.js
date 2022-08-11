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

async function promptActions() {
    while (true) {
        const res = await inquirer
            .prompt([
                {
                    type: "list",
                    name: "action",
                    message: "What would you like to do?",
                    choices: [
                        "View All Departments",
                        "View All Roles",
                        "View All Employees",
                        "Add A Department",
                        "Add A Role",
                        "Add An Employee",
                        "Update Employee Role",
                        "Update Employee",
                        "View Employees By Manager",
                        "View Employees By Department",
                        "Delete A Department",
                        "Delete A Role",
                        "Delete An Employee",
                        "Department Budget",
                        "Exit"
                    ],
                },
            ]);

        if (res.action == "Exit")
            break;

        if (res.action == "View All Departments")
            await displayAllDepartments();

        if (res.action == "View All Roles")
            await displayAllRoles();

        if (res.action == "View All Employees")
            await displayAllEmployees();
    }
}

async function displayAllDepartments() {
    const [rows, fields] = await connection.execute('SELECT * FROM `department` Order by id', []);
    console.log("")
    console.table(rows);
}


async function displayAllRoles() {
    const [rows, fields] = await connection.execute('SELECT a.id as `role_id`, a.title, b.name as department, a.salary FROM `role` as a LEFT JOIN `department` as b ON a.department_id = b.id Order by a.id', []);
    console.log("")
    console.table(rows);
}

async function displayAllEmployees() {
    const [rows, fields] = await connection.execute(`
                    SELECT a.id AS employee_id, a.first_name, a.last_name, b.title AS job, c.name AS department, b.salary, CONCAT(d.first_name, " ", d.last_name) AS manager
                    FROM employee AS a
                    LEFT JOIN role AS b ON a.role_id = b.id
                    LEFT JOIN department AS c ON b.department_id = c.id
                    LEFT JOIN employee AS d ON a.manager_id = d.id
                    ORDER BY a.id
            `, []);
    console.log("")
    console.table(rows);
}


connectDatabase();

