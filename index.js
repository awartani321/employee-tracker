const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
require('console.table');

let connection = null;
async function connectDatabase() {
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Gscfc123.',
            database: 'employees',
            port: 3306
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

        if (res.action == "Add A Department")
            await addDepartment();

        if (res.action == "Add A Role")
            await addRole();

        if (res.action == "Add An Employee")
            await addEmployee();

        if (res.action == "Update Employee Role")
            await updateEmployeeRole();

        if (res.action == "Update Employee")
            await updateEmployee();

        if (res.action == "View Employees By Manager")
            await displayAllEmployeesByManager();

        if (res.action == "View Employees By Department")
            await displayAllEmployeesByDepartment();

        if (res.action == "Delete A Department")
            await deleteDepartment();

        if (res.action == "Delete A Role")
            await deleteRole();

        if (res.action == "Delete An Employee")
            await deleteEmployee();

        if (res.action == "Department Budget")
            await displayBudgetInDepartment();


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

async function addDepartment() {
    const res = await inquirer
        .prompt([
            //name
            {
                type: "input",
                name: "name",
                message: "What is the name of the department?",
                validate: (val) => {
                    if (val) {
                        return true;
                    } else {
                        console.log("\nDepartment's name again.");
                        return false;
                    }
                },
            }
        ]);

    try {
        await connection.execute(`INSERT INTO department (name) VALUES (?)`, [res.name]);
        console.log(`Added ${res.name} to the database`);
    } catch (err) {
        console.log(`Failed to add department "${res.name}"`);
    }

}


async function addRole() {
    const res = await inquirer
        .prompt([
            //title
            {
                type: "input",
                name: "title",
                message: "What is the title of the role?",
                validate: (val) => {
                    if (val) {
                        return true;
                    } else {
                        console.log("\nRole's title again.");
                        return false;
                    }
                },
            },
            //salary
            {
                type: "input",
                name: "salary",
                message: "What is the salary of the role?",
                validate: (val) => {
                    if (val) {
                        return true;
                    } else {
                        console.log("\nRole's salary again.");
                        return false;
                    }
                },
            },
            //department
            {
                type: "input",
                name: "department",
                message: "Which department does the role belong to?",
                validate: async (val) => {
                    if (val) {
                        const [rows, fields] = await connection.execute(`Select * From department Where name = ?`, [val]);

                        if (rows.length < 1) {
                            console.log("\nDepartment does not exist");
                            return false;
                        }
                        return true;
                    } else {
                        console.log("\nRole's department again.");
                        return false;
                    }
                },
            }
        ]);

    try {
        // find department id
        const [rows, fields] = await connection.execute(`Select * From department Where name = ?`, [res.department]);
        // console.log(rows)
        await connection.execute(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [res.title, res.salary, rows[0]['id']]);
        console.log(`Added ${res.title} to the database`);
    } catch (err) {
        console.log(`Failed to add department "${res.title}"`);
    }

}


async function addEmployee() {
    const res = await inquirer
        .prompt([
            //first_name
            {
                type: "input",
                name: "first_name",
                message: "What is the employee's first name?",
                validate: (val) => {
                    if (val) {
                        return true;
                    } else {
                        console.log("\Employee's First Name again.");
                        return false;
                    }
                },
            },
            //last_name
            {
                type: "input",
                name: "last_name",
                message: "What is the employee's last name?",
                validate: (val) => {
                    if (val) {
                        return true;
                    } else {
                        console.log("\Employee's Last Name again.");
                        return false;
                    }
                },
            },
            //role
            {
                type: "input",
                name: "role",
                message: "What is the employee's role?",
                validate: async (val) => {
                    if (val) {
                        const [rows, fields] = await connection.execute(`Select * From role Where title = ?`, [val]);

                        if (rows.length < 1) {
                            console.log("\nRole does not exist");
                            return false;
                        }
                        return true;
                    } else {
                        console.log("\nEmployee's Role again.");
                        return false;
                    }
                },
            },
            //manager
            {
                type: "input",
                name: "manager",
                message: "What is the employee's manager?"
            }
        ]);

    try {
        // find department id
        const [rows1, fields1] = await connection.execute(`Select * From role Where title = ?`, [res.role]);
        const [rows2, fields2] = await connection.execute(`Select * From employee Where CONCAT(first_name, " ", last_name) = ?`, [res.manager]);
        // console.log(rows1);
        const manager_id = rows2.length > 0 ? rows2[0]['id'] : 0;
        // console.log("manager_id", manager_id);
        await connection.execute(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [res.first_name, res.last_name, rows1[0]['id'], manager_id]);
        console.log(`Added ${res.first_name} ${res.last_name} to the database`);
    } catch (err) {
        console.log(`Failed to add department "${res.first_name} ${res.last_name}"`);
    }

}

async function updateEmployeeRole() {
    const [rows, fields] = await connection.execute(`Select * From employee`, []);
    const res = await inquirer
        .prompt([
            {
                type: "list",
                name: "user",
                message: "What would you like to do?",
                choices: rows.map(row => row['first_name'] + ' ' + row['last_name'])
            },

        ]);

    // console.log(res.user);

    const [rows1, fields1] = await connection.execute(`Select * From role`, []);

    const res1 = await inquirer
        .prompt([
            {
                type: "list",
                name: "title",
                message: "Which role do you want?",
                choices: rows1.map(row => row['title']),
            }
        ]);

    const [rows2, fields2] = await connection.execute(`Select * From employee Where CONCAT(first_name, " ", last_name) = ?`, [res.user]);
    const [rows3, fields3] = await connection.execute(`Select * From role Where title = ?`, [res1.title]);

    const employee_id = rows2.length > 0 ? rows2[0]['id'] : 0;
    const role_id = rows3.length > 0 ? rows3[0]['id'] : 0;

    // console.log(employee_id, role_id);


    await connection.execute(`Update employee Set role_id = ? Where id = ?`, [role_id, employee_id]);

    console.log(`Updated ${res.user}'role to the database`);

}

// Bonus
async function updateEmployee() {
    const [rows, fields] = await connection.execute(`Select * From employee`, []);
    const res = await inquirer
        .prompt([
            {
                type: "list",
                name: "user",
                message: "What would you like to do?",
                choices: rows.map(row => row['first_name'] + ' ' + row['last_name'])
            },

        ]);

    const res1 = await inquirer
        .prompt([
            //first_name
            {
                type: "input",
                name: "first_name",
                message: "What is the employee's first name?",
                validate: (val) => {
                    if (val) {
                        return true;
                    } else {
                        console.log("\Employee's First Name again.");
                        return false;
                    }
                },
            },
            //last_name
            {
                type: "input",
                name: "last_name",
                message: "What is the employee's last name?",
                validate: (val) => {
                    if (val) {
                        return true;
                    } else {
                        console.log("\Employee's Last Name again.");
                        return false;
                    }
                },
            }
        ]);


    const [rows2, fields2] = await connection.execute(`Select * From employee Where CONCAT(first_name, " ", last_name) = ?`, [res.user]);

    const employee_id = rows2.length > 0 ? rows2[0]['id'] : 0;

    await connection.execute(`Update employee Set first_name = ?, last_name = ? Where id = ?`, [res1.first_name, res1.last_name, employee_id]);

    console.log(`Updated Employee ${employee_id}'s info in the database`);

}

async function displayAllEmployeesByManager() {
    const [rows, fields] = await connection.execute(`
                    SELECT a.id AS employee_id, a.first_name, a.last_name, b.title AS job, c.name AS department, b.salary, CONCAT(d.first_name, " ", d.last_name) AS manager
                    FROM employee AS a
                    LEFT JOIN role AS b ON a.role_id = b.id
                    LEFT JOIN department AS c ON b.department_id = c.id
                    LEFT JOIN employee AS d ON a.manager_id = d.id
                    ORDER BY a.manager_id, a.id                    
            `, []);
    console.log("")
    console.table(rows);
}

async function displayAllEmployeesByDepartment() {
    const [rows, fields] = await connection.execute(`
                    SELECT a.id AS employee_id, a.first_name, a.last_name, b.title AS job, c.name AS department, b.salary, CONCAT(d.first_name, " ", d.last_name) AS manager
                    FROM employee AS a
                    LEFT JOIN role AS b ON a.role_id = b.id
                    LEFT JOIN department AS c ON b.department_id = c.id
                    LEFT JOIN employee AS d ON a.manager_id = d.id
                    ORDER BY b.department_id, a.id                    
            `, []);
    console.log("")
    console.table(rows);
}


async function deleteDepartment() {
    const res = await inquirer
        .prompt([
            //name
            {
                type: "input",
                name: "name",
                message: "What is the name of the department for delete?",
                validate: (val) => {
                    if (val) {
                        return true;
                    } else {
                        console.log("\nDepartment's name again.");
                        return false;
                    }
                },
            }
        ]);

    try {
        await connection.execute(`DELETE FROM department Where name = ?`, [res.name]);
        console.log(`Deleted ${res.name} from the database`);
    } catch (err) {
        console.log(`Failed to delete department "${res.name}"`);
    }

}


async function deleteRole() {
    const res = await inquirer
        .prompt([
            //title
            {
                type: "input",
                name: "title",
                message: "What is the title of the role for delete?",
                validate: (val) => {
                    if (val) {
                        return true;
                    } else {
                        console.log("\nRole's title again.");
                        return false;
                    }
                },
            },
        ]);

    try {
        await connection.execute(`DELETE FROM role Where title = ?`, [res.title]);
        console.log(`Deleted ${res.title} from the database`);
    } catch (err) {
        console.log(`Failed to delete role "${res.title}"`);
    }
}


async function deleteEmployee() {
    const res = await inquirer
        .prompt([
            //first_name
            {
                type: "input",
                name: "first_name",
                message: "What is the employee's first name?",
                validate: (val) => {
                    if (val) {
                        return true;
                    } else {
                        console.log("\Employee's First Name again.");
                        return false;
                    }
                },
            },
            //last_name
            {
                type: "input",
                name: "last_name",
                message: "What is the employee's last name?",
                validate: (val) => {
                    if (val) {
                        return true;
                    } else {
                        console.log("\Employee's Last Name again.");
                        return false;
                    }
                },
            },
        ]);

    try {
        await connection.execute(`DELETE FROM employee Where first_name = ? and last_name = ?`, [res.first_name, res.last_name]);
        console.log(`Deleted ${res.first_name} ${res.last_name} from the database`);
    } catch (err) {
        console.log(`Failed to delete employee "${res.first_name} ${res.last_name}"`);
    }
}

async function displayBudgetInDepartment() {
    const res = await inquirer
        .prompt([
            //name
            {
                type: "input",
                name: "name",
                message: "What is the name of the department?",
                validate: (val) => {
                    if (val) {
                        return true;
                    } else {
                        console.log("\nDepartment's name again.");
                        return false;
                    }
                },
            }
        ]);

    try {
        const [rows, fields] = await connection.execute(`
            SELECT SUM(b.salary) as salary
            FROM employee AS a            
            LEFT JOIN role AS b ON a.role_id = b.id
            LEFT JOIN department AS c ON b.department_id = c.id
            WHERE c.name = ?            
        `, [res.name]);
        console.log(`Department ${res.name}'s Total Untilized Budget is ${rows[0]['salary']}`);
    } catch (err) {
        console.log(`Failed to get salary department "${res.name}"`);
    }

}

connectDatabase();

