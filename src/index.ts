import fs from "fs";
import path from "path";
import pg from "pg";
import parseSqlStatements from "./core/parser/parser.mts";
import { error } from "console";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

async function main() {
    const file: string = process.argv[2];
    const connectionString: string = process.argv[3];

    const client: pg.Client = new pg.Client({
        connectionString
    });

    await client.connect();
    fs.readFile(path.join(MIGRATIONS_DIR, file), async (err, buffer: Buffer) => {
        if(err) {
            throw new Error("unable to read file: " + file);
        }

        const stmts = parseSqlStatements(buffer);
        console.log(stmts);
        
        for(const s of stmts) {
            await client.query(s);
        }

        await client.end();
    });
}

main();