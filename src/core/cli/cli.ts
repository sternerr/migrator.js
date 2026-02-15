import { parseArguments } from "./parseArguments";
import Command from "./command";


export default class CLI {
    private args: string[];
    private commands: Command[] = [];

    constructor(args: string[]) {
        this.args = args.slice(2);
       
    }

    registerCommand(name: string, description: string) {
        const newCommand = new Command(name, description);
        this.commands.push(newCommand);
        return newCommand
    }

    run() {
        const parsedArgs = parseArguments(this.args);
        let command: Command;

        for(const cmd of this.commands) {
            if(cmd.getName.toLowerCase() == parsedArgs.subcommand.toLowerCase()) {
                command = cmd;
                break;
            }
        }

        if(!command) {
            this.help();
            return
        }

        command.setOptions(parsedArgs);
        command.execute();
    }

    private help() {
        console.log("Usage: <SUBCOMMAND> [OPTIONS]\n");
        console.log("Commands");
        for(const cmd of this.commands) {
            console.log(`\t${cmd.getName}\t\t${cmd.getDescription}`)
        }
    }
}