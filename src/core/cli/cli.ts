import { parseArguments, ParsedArgs } from "./parseArguments";
import Command from "./command";


export default class CLI {
    private commands: Map<string, Command> = new Map();

    registerCommand(name: string, description: string) {
        const newCommand = new Command(name, description);
        this.commands.set(name, newCommand);
        return newCommand
    }

    run(argv: string[]) {
        const parsed: ParsedArgs= parseArguments(argv);
        if(!parsed.command) {
            this.help();
            return;
        }

        const command: Command = this.commands.get(parsed.command);

        if(!command) {
            this.help();
            return
        }

        if(parsed.positionals[0] === "help") {
            command.help();
            return;
        }
        
        try {
            command.execute(parsed);       
        } catch(error) {
            console.error(error.message + "\n");
        }
    }

    private help() {
        console.log("Usage: <SUBCOMMAND> [OPTIONS]\n");
        console.log("Commands");
        for(const cmd of this.commands.values()) {
            console.log(`\t${cmd.getName()}\t\t${cmd.getDescription()}`)
        }
    }
}