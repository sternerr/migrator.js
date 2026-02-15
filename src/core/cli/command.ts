import { ParsedArgs } from "./parseArguments";

export type OptionInfo = {
    description: string;
    type: "string" | "boolean";
    default?: string | boolean;
    required?: boolean;
}

export type Positional = {
    name: string,
    description?: string;
    required?: boolean;
}

export default class Command {
    private name: string;
    private description: string;
    private options: Record<string, OptionInfo> = {};
    private positionals: Positional[] = [];
    private handler?: (context: {options: Record<string, string | boolean>, positionals: Record<string, string>}) => void;

    constructor(name: string, description: string,) {
        this.name = name;
        this.description = description;
    }
    
    setOption(name: string, optionInfo: OptionInfo) : this {
        this.options[name] = optionInfo;
        return this;
    }

    setPositional(name: string, description: string, required?: boolean): this {
        this.positionals.push({name, description, required});
        return this;
    }

    setHandler(handler: Command["handler"]): this {
        this.handler = handler;
        return this;
    }

    execute(parsed: ParsedArgs) {
        const validatedArgs = this.validate(parsed);
        this.handler(validatedArgs);
    }

    help() {
        console.log(`Usage: ${this.name} [OPTIONS]${this.positionals.length ? " [POSITIONALS]" : ""}\n`)

        if(this.positionals.length > 0) {
            for(const p of this.positionals) {
                console.log("Positionals: ");
                console.log(`\t${p.name}\t\t${p.description}\t${p.required ? "(required)" : "(optional)"}`);
            }
        }

        if(Object.entries(this.options).length > 0) {
            console.log("Options: ");
            for(const key in this.options) {
                console.log(`\t${key}\t\t${this.options[key].description}\t${this.options[key].required ? "(required)" : "(optional)"}`);
            }
        }
    }

    private validate(parsed: ParsedArgs): {options: Record<string, string | boolean>, positionals: Record<string, string>} {
        const options: Record<string, string | boolean> = {};
        
        for(const key in this.options) {
            const value = parsed.options[key];
            if(!value) {
                if(this.options[key].required) {
                    throw new Error("Mising required option: " + key)
                }
                

                options[key] = this.options[key].default;
            } else {
                if(this.options[key].type === "boolean" && typeof value !== "boolean") {
                    throw new Error("Option " + key + " does not contain a value");
                }

                if(this.options[key].type === "string" && typeof value !== "string") {
                    throw new Error("Option " + key + " is missing a value");
                }

                if(value === "") {
                    throw new Error("Option " + key + " is missing a value");
                }

                options[key] = value
            }
        }

        const positionals: Record<string, string> = {}

        for(let i = 0; i < this.positionals.length; i++) {
            const value = parsed.positionals[i];

            if(!value) {
                if(this.positionals[i].required) {
                    throw new Error("Missing required argument: " + this.positionals[i].name)
                }
            } else {
                positionals[this.positionals[i].name] = value;
            }
        }

        return {options, positionals}
    }

    getName() { return this.name; }
    getDescription() { return this.description; }
    getOptions() { return this.options; }
    getPositionals() { return this.positionals; }
}