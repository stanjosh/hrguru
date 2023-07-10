import inquirer from "inquirer";
import db from "./remote_db.js"
import Table from "cli-table"
const usd = new Intl.NumberFormat('en-US');

const showMenu = async () => {

    const goBack = () => {
        
    }
    const goMainMenu = () => {
        
    }
    const exit = () => {
    
    }

    const menuOptions = [
        {
            name: "Go back",
            value: goBack
        },
        {
            name: "Main menu",
            value: goMainMenu
        },
        {
            name: "Exit application",
            value: exit
        }
    ]
    
    const employeeMenu = await inquirer.prompt([
        {
            type: "list",
            name: "employeeMenu",
            message: "Employee Menu",
            choices: [
                {
                    name: "View employees",
                    value: 'showEmployees'
                },
                {
                    name: "Add employee",
                    value: 'createEmployee'
                },
                {
                    name: "Edit employee",
                    value: 'editEmployee'
                },
                ...menuOptions
            ]
        }
    ])

    const roleMenu = await inquirer.prompt([
        {
            type: "list",
            name: "roleMenu",
            message: "Role Menu",
            choices: [
                {
                    name: "View roles",
                    value: 'showRoles'
                },
                {
                    name: "Add role",
                    value: 'createRole'
                },
                {
                    name: "Edit role",
                    value: 'editRole'
                },
                ...menuOptions
            ]
        }
    ])

    const departmentMenu = await inquirer.prompt([
        {
            type: "list",
            name: "departmentMenu",
            message: "department Menu",
            choices: [
                {
                    name: "View departments",
                    value: 'showDepartments'
                },
                {
                    name: "Add department",
                    value: 'createdepartment'
                },
                {
                    name: "Edit department",
                    value: 'editRole'
                },
                ...menuOptions
            ]
        }
    ])

    const mainMenu = await inquirer.prompt ([
        {
            type: "list",
            name: "main",
            message: "Main Menu",
            choices: [
                {
                    name: "Employees",
                    value: 'employeeMenu'
                },
                {
                    name: "Roles",
                    value: 'roleMenu'
                },
                {
                    name: "Departments",
                    value: 'departmentMenu'
                },
                ...menuOptions
            ]

        }
    ])

    console.log({...mainMenu})
    
}






const showDepartments = async () => {
    let list = []
    return await db.departments.getAll()
    .then(data => {
        data.map((i) => {
            list.push({ 
                name:`${i.name}`, 
                value: `${i.id}`
            })
        })
    })
    .then(() => {
        return list
    })
}

const getRoles = async () => {
    let list = []
    return await db.roles.getAll()
    .then(data => {
        data.map((i) => {
            list.push({ 
                name:`${i.title}`, 
                value: `${i.id}`
            })
        })
    })
    .then(() => {
        return list
    })
}


const createEmployee = async () => {
    const getDeptMgrsByRole = async (role) => {
        let list = []
        return await db.departments.getManagersByRole(role)
        .then(data => {
            data.map((i) => {
                list.push({ 
                    name:`${i.first_name} ${i.last_name}, ${i.role} in ${i.department}`, 
                    value: `${i.id}`
                })
            })
        })
        .then(() => {
            return list
        })
    }

    const employeeNameQuestions = await inquirer.prompt([
        {
            type: "input",
            name: "first_name",
            message: "First Name:"
        },
        {
            type: "input",
            name: "last_name",
            message: "Last Name:"
        },
    ])

    const employeeRoleQuestions = await inquirer.prompt([
        {   
            type: "list",
            name: "role_id",
            message: "Role:",
            choices: await getRoles()
        }
    ])

    const employeeManagerQuestions = await inquirer.prompt([
        {
            type: "list",
            name: "manager_id",
            message: "Direct Manager:",
            choices: await getDeptMgrsByRole(employeeRoleQuestions.role_id)
        }
    ])

    db.employees.create({
        ...employeeNameQuestions, 
        ...employeeRoleQuestions, 
        ...employeeManagerQuestions})



}   



const showEmployees = async () => {
    let list = []
    return await db.employees.getAll()
    .then(data => {
        data.map((i) => {
            list.push({ 
                name:`${i.name}`, 
                value: `${i.id}`
            })
        })
    })
    .then(() => {
        return list
    })
}







const showRoles = async () => {
    var table = new Table({
        head: ['Role', 'Department', 'Salary']
    })
   
    return await db.roles.getAllInfo()
    .then(data => {
        table.push(...data.map((i) => {
            return [`${i.title}`, 
            `${i.name}`, 
            `$${usd.format(i.salary)}`
            ]
        }))
    })
    .then(() => {
        return table.toString()
    })
}




export default { showMenu }

const todo = `
viewAllEmployees, 
addDepartment, 
addRole, 
updateEmployee`