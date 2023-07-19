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
    remove : async (id) => {
        await db.query(`
        delete
        from
            employee
        where
            id = ${id}
        `)
    },

    create : async (employee) => {
        await db.query(`
        INSERT INTO
            employee
            (first_name, last_name, role_id, manager_id)
        VALUES
            ("${employee.first_name}", "${employee.last_name}", "${employee.role_id}", ${employee.manager_id ? '"' + employee.manager_id + '"' : 'null'})
        `)

    },

    getByRole : async (role) => {
        let [rows, fields] = await db.query(
            `SELECT
                employee.first_name as 'First Name',
                employee.last_name as 'Last Name',
                role.title as 'Role',
                department.name as 'Name'
            FROM
                employee, role, department
            WHERE
                role.title like %${role}%
            `)

        return rows
    },
   
    getByDepartment : async (department) => {
        let [rows, fields] = await db.query(
            `
            select 
                *,
                role.title as 'role',
                department.name as 'department',
                department.id,
                role.department_id,
                role.id,
                employee.id                          
            from 
                employee
            left join 
                role 
            on
                role.id = employee.role_id
            left join
                department
            on
                department.id = role.department_id
            where
                department.name like '%${department}%'
            `)
        return rows
    },
    
    getByManager : async (manager_id) => {
        let [rows, fields] = await db.query(
            `
            select 
                *,
                role.title as 'role',
                department.name as 'department',
                department.id,
                role.department_id,
                role.id,
                employee.id                          
            from 
                employee
            left join 
                role 
            on
                role.id = employee.role_id
            left join
                department
            on
                department.id = role.department_id
            where
                employee.manager_id = ${manager_id}'
            `
        )
        return rows
    }


    getById : async (id) => {
        let [rows, fields] = await db.query(`SELECT * FROM employee WHERE id = ${id}`)
        return rows
    },

    getAll : async () => {
        let [rows, fields] = await db.query(`SELECT * FROM employee`)
        return rows
    },

    getInfoByID : async (...id) => {
        let [rows, fields] = await db.query(
            `
            select 
                employee.id as 'Employee ID',
                employee.first_name as 'First Name', 
                employee.last_name as 'Last Name', 
                role.title as 'Role', 
                role.salary as 'Salary'
                department.name as 'Department',
                manager.last_name as 'Manager',
            from employee, role, department, employee manager
            where employee.id in (${id})
            and role.id = employee.role_id
            and department.id = role.department_id
            and manager.id = employee.manager_id
            `
        )
        return rows
    },

    getAllInfo : async () => {
        let [rows, fields] = await db.query(
            `
            select 
                a.first_name,
                a.last_name,
                a.id as 'employee_id',
                a.manager_id,
                role.title as 'role',
                department.name as 'department',
                department.id as 'department_id',
                role.department_id,
                role.id as 'role_id',
                role.salary,
                b.id as 'manager_employee_id',
                b.last_name as 'manager'
            from 
                employee a
            left join 
                role 
            on
                role.id = a.role_id
            left join
                department
            on
                department.id = role.department_id
            left join
                employee b
            on
                b.id = a.manager_id
            `
        )
        return rows
    },

    updateInfo : async (data) => {
        await db.query(`
        update
            employee
        set
            first_name = '${data.first_name}',
            last_name = '${data.last_name}',
            role_id = '${data.role_id}',
            manager_id = ${data.manager_id ? "'" + data.manager_id + "'" : 'null'}
        where
            id = ${data.id}

        `)
    }

}

const roles = {
    remove : async (id) => {
        await db.query(`
        delete from
            role
        where
            id = ${id}
        `)
    },


    updateInfo : async (data) => {
        await db.query(`
        update
            role
        set
            title = '${data.title}',
            salary = '${data.salary}',
            department_id = '${data.department_id}'
        where
            id = '${data.id}'
        `)

    },

    getAll : async () => {
        let [rows, fields] = await db.query(`SELECT * FROM role`)
        return rows
    },

    getTitleById : async (id) => {
        let [rows, fields] = await db.query(`SELECT * FROM role WHERE id = ${id}`)
        return rows[0].title
    },

    create : async (role) => {
        await db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${role.title}', '${role.salary}', '${role.department_id}')`)
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
    remove : async (id) => {
        await db.query(`
        delete from
            department
        where
            id = ${id}
        `)
    },
    
    getAll : async () => {
        let [rows, fields] = await db.query(`SELECT * FROM department`)
        return rows
    },

    getById : async (id) => {
        let [rows, fields] = await db.query(`SELECT * FROM department WHERE id = ${id}`)
        return rows
    },

    getDepartmentManagers : async (department) => {
        let [rows, fields] = await db.query(
            `
            select
                employee.id,
                employee.first_name,
                employee.last_name,
                role.title as 'role',
                department.name as 'department'
            from
                employee, department, role
            where
                employee.role_id = role.id
                and department.id = ${department}
                and role.title like "%manager%"
            `
        )
        return rows
    },

    getManagersByRole : async (role) => {
        let [rows, fields] = await db.query(
            `

            select 
                employee.id as 'employee_id',
                employee.first_name,
                employee.last_name,
                department.id as 'department_id',
                role.department_id as 'role_department_id',
                role.title as 'role',
                department.name as 'department',
                role.id as 'role_id'
            from
                employee
            join
                department
            on
                department.id = (select department_id from role where role.id = ${role})
            join
                role
            on  
                role.department_id = department.id
                and role.title like '%manager%'
            where
                employee.role_id = role.id    
                
            `
        )
        return rows
    },

    getDepartmentByRole : async (role) => {
        let [rows, fields] = await db.query(
            `
            select
                department.name as 'department'
            from
                department, role
            where
                role.id = department.id
            `
        )
        return rows
    },

    create : async (department) => {
        await db.query(`INSERT INTO department (name) VALUES ('${department.name}')`)
    },


}


function endConnections() {
    db.end()
}

export default { db, employees, roles, departments, endConnections }
