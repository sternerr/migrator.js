export type ParsedArgs = {
    command: string;
    positionals: string[];
    options: Record<string, string | boolean>;
}

export function parseArguments(argv: string[]): ParsedArgs {
    const result: ParsedArgs = {
        command: "",
        positionals: [],
        options: {},
    };

    let i = 0;
    if(argv[0] && !argv[0].startsWith("--") && !argv[0].startsWith("-")) {
        result.command = argv[0];
        i++;
     }

    for(; i < argv.length; i++) {
        if(argv[i].startsWith("--")) {
            const [option, value] = argv[i].split("=");
            result.options[option] = value ?? true;
            continue;
        }
        
        if(argv[i].startsWith("-")) {
            const nextArg = argv[i + 1];
            const option = argv[i];

            if(nextArg && !(nextArg.startsWith("--") || nextArg.startsWith("-"))) {
                result.options[option] = nextArg;
                i++;
                continue;
            } else {
                result.options[option] = true;
                continue;
            }
        }

        result.positionals.push(argv[i]);
    }

    return result
}