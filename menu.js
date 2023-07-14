import inquirer from "inquirer";
import db from "./remote_db.js"
import Table from "cli-table"
const usd = new Intl.NumberFormat('en-US');
const ui = new inquirer.ui.BottomBar();


const appMenu = async () => {

    let choice = await mainMenu()
    await choice.action()
    
    
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

const exitApp = async () => {
    db.endConnections()
    return 'Goodbye!'
}


const mainMenu = async (userMenu) => {
    
    const employeeMenu = [
        {
            type: "list",
            name: "action",
            message: "Employee Menu",
            choices: [
                {
                    name: "View employees",
                    value: showEmployeeTable
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
                    value: appMenu
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
                    value: showRoleTable
                },
                {
                    name: "Add role",
                    value: createRole
                },
                {
                    name: "Edit role",
                    value: 'editRole'
                },
                {
                    name: "Main menu",
                    value: appMenu
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
                    value: showDepartmentTable
                },
                {
                    name: "Add department",
                    value: createDepartment
                },
                {
                    name: "Edit department",
                    value: 'editDepartment'
                },
                {
                    name: "Main menu",
                    value: appMenu
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
                    value: exitApp
                }
            ]

        }
    ]
    switch(userMenu) {
        case 'departmentMenu':
            return await inquirer.prompt(departmentMenu).main
        case 'employeeMenu':
            return await inquirer.prompt(employeeMenu).main
        case 'roleMenu':
            return await inquirer.prompt(roleMenu).main
        default:
            return inquirer.prompt({...await inquirer.prompt(userMenu? userMenu: mainMenu)}.main)
    }

    
}
    
 

const showDepartmentTable = async () => {
    console.clear()
    let table = new Table({
        head: ['ID', 'Deparment']
    })
    return await db.departments.getAll()
    .then(data => {
        data.map((i) => {
            table.push({ 
                name:`${i.name}`, 
                value: `${i.id}`
            })
        })
    })
    .then(() => {
        console.info(table.toString())
    })
    .then(() => {
        return mainMenu('departmentMenu')
    })
    .catch((err) => console.info(err))
}

const listRoles = async () => {
    let list = [];
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

const listDepartments = async () => {
    let list = [];
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


const showRoleTable = async () => {
    console.clear()
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
        console.info(table.toString())
    })
    .then(() => {
        return mainMenu('roleMenu')
    })
    .catch((err) => console.info(err))
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
            choices: await listRoles()
        }
    ])

    const employeeManagerQuestions = await inquirer.prompt([
        {
            type: "list",
            name: "manager_id",
            message: "Direct Manager:",
            choices: await listDeptMgrsByRole(employeeRoleQuestions.role_id)
        }
    ])

    db.employees.create({
        ...employeeNameQuestions, 
        ...employeeRoleQuestions, 
        ...employeeManagerQuestions})

    return mainMenu('employeeMenu')

}  


const createRole = async () => {

    const roleTitleQuestions = await inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "Role title:"
        },
    ])

    const roleSalaryQuestions = await inquirer.prompt([
        {   
            type: "Input",
            name: "salary",
            message: "Salary:",
        }
    ])

    const roleDepartmentQuestions = await inquirer.prompt([
        {   
            type: "list",
            name: "department_id",
            message: "Department:",
            choices: await listDepartments()
        }
    ])

    await db.roles.create({
        ...roleTitleQuestions,
        ...roleSalaryQuestions,
        ...roleDepartmentQuestions,
 
    })
    .then(() => mainMenu('roleMenu'))
    .catch((err) => console.log(err))
}

const createDepartment = async () => {

    const departmentNameQuestions = await inquirer.prompt([
        {
            type: "input",
            name: "department_name",
            message: "Department title:"
        },
    ])

    db.roles.create({
        ...departmentNameQuestions
    })

    return mainMenu('departmentMenu')

}



const showEmployeeTable = async () => {
    console.clear()
    let table = new Table({
        head: ['Role', 'Title', 'Department', 'Salary']
    })
    return await db.employees.getAllInfo()
    .then(data => {
        table.push(...data.map((i) => {
            return [`${i.first_name} ${i.last_name}`,
            `${i.role}`,
             `${i.department}`,
            
            `$${usd.format(i.salary)}`
            ]
        
        }));
    })
    .then(() => {
        console.info(table.toString())
    })
    .then(() => {
        return mainMenu('employeeMenu')
    })
    .catch((err) => console.info(err))
}


const listDeptMgrsByRole = async (role) => {
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




export default { appMenu }

const todo = `

addDepartment, 
addRole, 
updateEmployee`