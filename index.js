#!/usr/bin/env node
import remote_db from "./remote_db.js"
import menu from "./menu.js"

const run = true





async function app() {
    while (run !== false) {
        await menu.showMenu()
    }
    remote_db.endConnections()
}


app ()