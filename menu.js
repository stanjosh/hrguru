import inquirer from "inquirer";
import db from "./remote_db.js"
import Table from "cli-table"
const usd = new Intl.NumberFormat('en-US');
const ui = new inquirer.ui.BottomBar();


const appMenu = async () => {

    let choice = await mainMenu()
    console.log(await choice.action())
    
    
    // switch (choice.action) {
    //     case 'appExit':

    //         db.endConnections();
    //         console.info("Goodbye!")
    //         break
    //     case 'createEmployee':
    //         console.info(choice.action)
    //         createEmployee()
    //         break
    //     default:
    //         console.clear()
    //         mainMenu()
    //         break
    // }
    
}

const mainMenu = async (menu) => {
    var menu = menu ? menu : 'mainMenu'
    const employeeMenu = [
        {
            type: "list",
            name: "action",
            message: "Employee Menu",
            choices: [
                {
                    name: "View employees",
                    value: 'showEmployees'
                },
                {
                    name: "Add employee",
                    value: createEmployee
                },
                {
                    name: "Edit employee",
                    value: 'editEmployee'
                },
                {
                    name: "Main menu",
                    value: 'mainMenu'
                },
            ]
        }
    ]

    const roleMenu = [
        {
            type: "list",
            name: "action",
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
                {
                    name: "Main menu",
                    value: 'mainMenu'
                },
            ]
        }
    ]

    const departmentMenu = [
        {
            type: "list",
            name: "action",
            message: "department Menu",
            choices: [
                {
                    name: "View departments",
                    value: showDepartments
                },
                {
                    name: "Add department",
                    value: 'createDepartment'
                },
                {
                    name: "Edit department",
                    value: 'editRole'
                },
                {
                    name: "Main menu",
                    value: 'mainMenu'
                },
            ]
        }
    ]

    const mainMenu = [
        {
            type: "list",
            name: "main",
            message: "Main Menu",
            choices: [
                {
                    name: "Employees",
                    value: employeeMenu
                },
                {
                    name: "Roles",
                    value: roleMenu
                },
                {
                    name: "Departments",
                    value: departmentMenu
                },
                {
                    name: "Exit application",
                    value: 'appExit'
                }
            ]

        }
    ]
    return await inquirer.prompt({...await inquirer.prompt(mainMenu)}.main)
}
    
const createEmployee = async () => {

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




export default { appMenu }

const todo = `
viewAllEmployees, 
addDepartment, 
addRole, 
updateEmployee`