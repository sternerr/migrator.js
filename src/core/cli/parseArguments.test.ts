import { describe, it } from "node:test";
import { parseArguments, ParsedArgs } from "./parseArguments";
import assert from "node:assert";

describe("argument parser", () => {
    it("parser", () => {
        const tests = [
            {
                data: ["--help"],
                expected: {
                    command: "",
                    options: { "--help": true },
                    positionals: []
                }
            },
            {
                data: ["subcommand"],
                expected: {
                    command: "subcommand",
                    options: {},
                    positionals: []
                }
            },
            {
                data: ["subcommand", "--help"],
                expected: {
                    command: "subcommand",
                    options: { "--help": true },
                    positionals: []
                }
            },
            {
                data: ["subcommand", "--flag=data", "-f", "data"],
                expected: {
                    command: "subcommand",
                    options: { "--flag": "data", "-f": "data" },
                    positionals: []
                }
            },
            {
                data: ["subcommand", "-h", "-f", "data"],
                expected: {
                    command: "subcommand",
                    options: { "-h": true, "-f": "data" },
                    positionals: []
                }
            },
            {
                data: ["subcommand", "awd", "-h", "-f", "data"],
                expected: {
                    command: "subcommand",
                    options: { "-h": true, "-f": "data" },
                    positionals: ["awd"]
                }
            },
        ];

        for(let i = 0; i < tests.length; i++) {
            const result = parseArguments(tests[i].data);
            assert.deepStrictEqual(
                result,
                tests[i].expected
            )
        }

    })
});

function areParsedArgsEqual(a: ParsedArgs, b: ParsedArgs): boolean {
    if (a.command !== b.command) return false;

    const aKeys = Object.keys(a.options);
    const bKeys = Object.keys(b.options);

    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
        if (a.options[key] !== b.options[key]) return false;
    }

    return true;
}