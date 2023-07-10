#!/usr/bin/env node
import menu from "./menu.js"



async function app() {

        switch (await menu.appMenu()) {
            case 'exit':
                break
            default:
                app()

        }


}


app ()