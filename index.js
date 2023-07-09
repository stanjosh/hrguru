#!/usr/bin/env node
import inquirer from "inquirer";
import db from "./remote_db.js"
import process from "process"
import Table from "cli-table"
const usd = new Intl.NumberFormat('en-US');

const createEmployee = async () => {
    await inquirer.prompt([
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
        {   
            type: "list",
            name: "role_id",
            message: "Role:",
            choices: await db.roles.getAll()
        },
        {
            type: "list",
            name: "manager_id",
            message: "Direct Manager:",
            choices: await db.employees.getByRole('Manager')
        }
    ]).then(async (answers) => {
        await db.employees.create(answers.first_name, answers.last_name, answers.role_id.split(" ")[0], answers.manager_id.split(" ")[0])
    }).then((answers) => {
        console.info(answers)
        console.info("Employee file created.")
    }
    ).catch((err) => {
        console.error(err)
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


console.table(await db.employees.getAllInfo(5))


