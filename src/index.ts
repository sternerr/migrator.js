import CLI from "./core/cli/cli";
import Migrator from "./core/migrator/migrator";

async function main() {
    const cli = new CLI();

    cli.registerCommand("create", "Creates a migration file")
        .setOption("--filename", { description: "", type: "string", default: ""})
        .setHandler((args: {options: Record<string, string | boolean>, positionals: Record<string, string>}) => {
            const migrator = new Migrator();

            if(args.options["--filename"]) {
                migrator.create(args.options["--filename"] as string);
            } else {
                migrator.create();
            }
        })
    
    cli.registerCommand("up", "Migrates up one step")
        .setOption("--connection-string", {description: "", type: "string", required: true})
        .setHandler((args: {options: Record<string, string | boolean>, positionals: Record<string, string>}) => {
            if(!args.options["--connection-string"]) {
                return;
            }

            const migrator = new Migrator(args.options["--connection-string"] as string);
            migrator.up();
        });

    cli.registerCommand("down", "Migrates down one step")
        .setOption("--connection-string", {description: "", type: "string", required: true})
        .setHandler((args: {options: Record<string, string | boolean>, positionals: Record<string, string>}) => {
            if(!args.options["--connection-string"]) {
                return;
            }

            const migrator = new Migrator(args.options["--connection-string"] as string);
            migrator.down();
        });

    cli.run(process.argv.slice(2));
}

main();