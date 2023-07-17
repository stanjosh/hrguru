import inquirer from "inquirer";
import db from "./remote_db.js"
import Table from "cli-table"
const usd = new Intl.NumberFormat('en-US');
const ui = new inquirer.ui.BottomBar();


const appMenu = async (state, message) => {
    ui.log.write(message)
    while (state) {
        switch (state) {
            case 'employeeMenu':
                state = await employeeMenu()
                break
            case 'roleMenu':
                state = await roleMenu()
                break
            case 'departmentMenu':
                state = await departmentMenu()
                break
            case 'exitApp':
                console.log('Goodbye!')
                state = false
                break
            default:
                state = await mainMenu()
                break
        }
    }
    
}

const employeeMenu = async () => {
    let userMenu = {
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
                value: editEmployee
            },
            {
                name: "Delete employee",
                value: removeEmployee
            },
            {
                name: "Main menu",
                value: mainMenu
            },
        ]
    }
    return {...await inquirer.prompt(userMenu)}.action()
}

const roleMenu = async () => {
    let userMenu = {
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
                value: editRole
            },
            {
                name: "Remove role",
                value: removeRole
            },
            {
                name: "Main menu",
                value: mainMenu
            },
        ]
    }
    return {...await inquirer.prompt(userMenu)}.action()
}

const departmentMenu = async () => {
    let userMenu = {
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
                value: mainMenu
            },
        ]
    }
    return {...await inquirer.prompt(userMenu)}.action()
}

const mainMenu = async () => {
    console.clear()
    let userMenu = {
        type: "list",
        name: "action",
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
                value: 'exitApp'
            }
        ]
    }
    return {...await inquirer.prompt(userMenu)}.action()
}



    
const createEmployee = async () => {
    console.clear()
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
            choices: await listAllRoles()
        }
    ])

    const employeeManagerQuestions = await inquirer.prompt([
        {
            type: "list",
            name: "manager_id",
            message: "Direct Manager:",
            choices: [...await listDeptMgrsByRole(employeeRoleQuestions.role_id),
                ...await listEmployeesByDepartment('executive'),
                {
                name:`No direct manager`, 
                value: ''
                }
            ]
        }
    ])

    let employee = {
        ...employeeNameQuestions, 
        ...employeeRoleQuestions, 
        ...employeeManagerQuestions}
    console.log(employee)
    db.employees.create(employee)

    .then(() => {
        let message = (`Employee file for ${employeeNameQuestions.first_name} ${employeeNameQuestions.last_name} created.`);
        showEmployeeTable(message)
        
    })
}  

const editEmployee = async () => {
    console.clear()
    const employeeSelect = await inquirer.prompt([
        {
            type: "list",
            name: "id",
            message: "Select an employee to edit information:",
            choices: await listAllEmployees(),
            pagination: {
                per_page: 15
              }
        }
    ])

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
            choices: await listAllRoles()
        }
    ])

    const employeeManagerQuestions = await inquirer.prompt([
        {
            type: "list",
            name: "manager_id",
            message: "Direct Manager:",
            choices: [...await listDeptMgrsByRole(employeeRoleQuestions.role_id),
                {
                name:`No direct manager`, 
                value: `null`
                }
            ]
        }
    ])
    let employee = {
        ...employeeSelect,
        ...employeeNameQuestions, 
        ...employeeRoleQuestions, 
        ...employeeManagerQuestions}
    db.employees.updateInfo(employee)
    .then(() => {
        let message = 'Employee updated.'
        appMenu('employeeMenu', message)
    })
    .catch((err) => console.log(err))
}

const removeEmployee = async () => {
    console.clear()
    let message = "Operation cancelled."


    const employee = await inquirer.prompt([
        {   
            type: "list",
            name: "id",
            message: "DELETE employee:",
            choices: await listAllEmployees(),
        }
    ])

    const confirm = await inquirer.prompt([
        {
            type: "confirm",
            name: "choice",
            message: `Are you sure you want to delete employee ${employee.id}?`
        }
    ])

    let choices = {...employee, ...confirm}
    if (choices.choice) {
        await db.employees.remove(employee.id)
        message = `Employee ${employee.id} deleted.`
    }    
    
    showEmployeeTable(message)
}


//todo: make the role name show on confimation dialogue
const removeRole = async () => {
    console.clear()
    let message = "Operation cancelled."


    const role = await inquirer.prompt([
        {   
            type: "list",
            name: "id",
            message: "DELETE role:",
            choices: await listAllRoles(),
        }
    ])

    const confirm = await inquirer.prompt([
        {
            type: "confirm",
            name: "choice",
            message: `Are you sure you want to delete role ${await db.roles.getById(role.id).title}?`
        }
    ])

    let choices = {...role, ...confirm}
    if (choices.choice) {
        await db.employees.remove(role.id)
        message = `Role ${role.id} deleted.`
    }    
    
    showEmployeeTable(message)
}

const createRole = async () => {
    console.clear()
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
    let message = `Role '${roleTitleQuestions.title}' created.`
    showRoleTable(message)
}

const editRole = async () => {
    console.clear()
    const roleIdQuestions = await inquirer.prompt([
        {   
            type: "list",
            name: "id",
            message: "Role:",
            choices: await listAllRoles()
        }
    ])

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

    await db.roles.updateInfo({
        ...roleIdQuestions,
        ...roleTitleQuestions,
        ...roleSalaryQuestions,
        ...roleDepartmentQuestions,
 
    })
    let message = `Role '${roleTitleQuestions.title}' edited.`
    showRoleTable(message)
}




const createDepartment = async () => {
    console.clear()
    const departmentNameQuestions = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Department title:"
        },
    ])

    db.departments.create({
        ...departmentNameQuestions
    })
    .catch((err) => console.log(err))
    .then(() => {
        let message = `Department '${departmentNameQuestions.name}' created.`
        showDepartmentTable(message)
    })
    .catch((err) => console.log(err))
}

const showDepartmentTable = async (message='') => {
    console.clear()
    let table = new Table({
        head: ['ID', 'Deparment']
    })
    return await db.departments.getAll()
    .then(data => {
        data.map((i) => {
            table.push([
                `${i.id}`, 
                `${i.name}`
            ])
        })
    })
    .then(() => {
        console.info(table.toString())
    })
    .then(() => {
        appMenu('departmentMenu', message)
    })
}

const listAllRoles = async () => {
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

const listEmployeesByDepartment = async (department) => {
    let list = []
    return await db.employees.getByDepartment(department)
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

const listAllEmployees = async () => {
    let list = []
    return await db.employees.getAllInfo()
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



const showRoleTable = async (message='') => {
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
        appMenu('roleMenu', message)
    })
}





const showEmployeeTable = async (message='') => {
    console.clear()
    let table = new Table({
        head: ['Role', 'Title', 'Department', 'Salary']
    })
    return await db.employees.getAllInfo()
    .then(data => {
        table.push(...data.map((i) => {
            return [`${i.first_name} ${i.last_name}`,
            `${i.title}`,
            `${i.name}`,
            `$${usd.format(i.salary)}`
            ]
        
        }));
    })
    .then(() => {
        console.info(table.toString())
    })
    .then(() => {
        appMenu('employeeMenu', message)
    })
}






appMenu('mainMenu', 'Welcome!')

