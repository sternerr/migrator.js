import { ParsedArgs } from "./parseArguments";

export default class Command {
    private name: string;
    private description: string;
    private options: Record<string, { description: string, value?: any}> = {};
    private handler: Function;

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }

    setHandler(handler: Function): this {
        this.handler = handler;
        return this;
    }
    
    setOption(option: string, description: string, value?: any): this {
        this.options[option] = { description, value };
        return this;
    }

    execute() { this.handler(this.options) }

    setOptions(args: ParsedArgs) {
        for(const [key, value] of Object.entries(args.options)) {
            if(key in this.options) {
                this.options[key].value = value;
            }
        }
    }

    get getName() { return this.name; }
    get getDescription() { return this.description; }
    get getOptions() { return this.options; }
}