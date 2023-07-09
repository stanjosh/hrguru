import mysql2 from "mysql2/promise"


const db = mysql2.createPool({
    host: 'stanj.link',
    user: 'bootcamp',
    password: 'public',
    database: 'hrguru',
    connectionLimit: 10,
    queueLimit: 0,
    waitForConnections: false

})

const employees = {
    create : async (first_name, last_name, role_id, manager_id) => {
        await db.query(`INSERT INTO employee \
        (first_name, last_name, role_id, manager_id) VALUES \
        ('${first_name}', '${last_name}', '${role_id}', '${manager_id}')`)
    },

    getByRole : async (role) => {
        let [rows, fields] = await db.query(
        `SELECT
        *
        FROM
        employee
        JOIN
        role
        ON
        (employee.role_id = role.id and role.title LIKE "%${role}%")
        `)

        return rows.map((i) => {
            return `${i.id} ${i.last_name}, ${i.first_name}`
        })
    },
   
    getById : async (id) => {
        let [rows, fields] = await db.query(`SELECT * FROM employee WHERE id = ${id}`)
        return rows
    },

    getAll : async () => {
        let [rows, fields] = await db.query(`SELECT * FROM employee`)
        return rows
    },

    getAllInfo : async (...id) => {
        let [rows, fields] = await db.query(
            `
            select 
                employee.id as 'Employee ID',
                employee.first_name as 'First Name', 
                employee.last_name as 'Last Name', 
                role.title as 'Role', 
                department.name as 'Department',
                manager.last_name as 'Manager'
            from employee, role, department, employee manager
            where employee.id in (${id})
            and role.id = employee.role_id
            and department.id = role.department_id
            and manager.id = employee.manager_id
            `
        )
        return rows
    }

}

const roles = {
    getAll : async () => {
        let [rows, fields] = await db.query(`SELECT * FROM role`)
        return rows.map((i) => {
            return `${i.id} ${i.title}`
        })
    },

    getById : async (id) => {
        let [rows, fields] = await db.query(`SELECT * FROM role WHERE id = ${id}`)
        return rows[0]
    },

    create : async (title, salary, department_id) => {
        await db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${title}', '${salary}', '${department_id}')`)
    },

    getAllInfo : async (id) => {
        let [rows, fields] = await db.query(
            `SELECT
            *
            FROM
            role
            JOIN
            department
            ON
            role.department_id = department.id
            
            `
        )
        return rows
    }
}

const departments = {

    getAll : async () => {
        let [rows, fields] = await db.query(`SELECT * FROM department`)
        return rows
    },

    getById : async (id) => {
        let [rows, fields] = await db.query(`SELECT * FROM department WHERE id = ${id}`)
        return rows[0]
    },

    create : async (name) => {
        await db.query(`INSERT INTO department VALUES (name, '${name}')`)
    },

}

export default { db, employees, roles, departments  }



