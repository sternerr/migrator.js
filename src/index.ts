import CLI from "./core/cli/cli";
import Migrator from "./core/migrator/migrator";

async function main() {
    const cli = new CLI(process.argv);

    cli.registerCommand("create", "Creates a migration file")
        .setOption("--filename", "")
        .setHandler((args: any) => {
            const migrator = new Migrator();
            migrator.create(args);
        });
    
    cli.registerCommand("up", "Migrates up one step")
        .setOption("--connection-string", "")
        .setHandler((args: any) => {
            if(!args["--connection-string"].value) {
                return;
            }

            const migrator = new Migrator(args["--connection-string"].value);
            migrator.up(args);
        });

    cli.registerCommand("down", "Migrates down one step")
        .setOption("--connection-string", "")
        .setHandler((args: any) => {
            if(!args["--connection-string"].value) {
                return;
            }

            const migrator = new Migrator(args["--connection-string"].value);
            migrator.down(args);
        });

    cli.run();
}

main();