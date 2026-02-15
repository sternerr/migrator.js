import path, { parse } from "node:path";
import fs from "node:fs";
import { Client } from "pg";
import { error } from "node:console";
import parseSqlStatements from "../parser/parser";
import { buffer } from "node:stream/consumers";

export default class Migrator {
    private migrationDir: string = path.join(process.cwd(), "migrations");
    private client: Client;
    
    constructor(connectionString: string = "") {
        this.client = new Client({connectionString});
    }

    create(args: any) {
        try {
            const stat = fs.lstatSync(this.migrationDir);
        } catch(error) {
            fs.mkdirSync(this.migrationDir);
        }

        const timestamp = Date.now();
        const filename = `${timestamp}${args["--filename"].value ? "_" + args["--filename"].value : ""}.sql`;
        const filepath = path.join(this.migrationDir, filename);

        fs.writeFileSync(filepath, "");
        console.log("Created:", filename);
    }

    async up(args: any) {
        await this.client.connect();
        const files = fs.readdirSync(this.migrationDir);

        if(!await this.existMigrationTable()) {
            try {
                await this.client.query(`CREATE TABLE migrations(
                    name TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL
                );`);
                
           

                const buffer = fs.readFileSync(path.join(this.migrationDir, files[0]));
                const sqlStmts = parseSqlStatements(buffer);
                
                for(const stmt of sqlStmts.up) {
                    await this.client.query(stmt);
                }

                await this.client.query("INSERT INTO migrations(name, created_at) VALUES($1, NOW());", [files[0]]);

                console.log("Migrated up to file: ", files[0]);
            } catch(error) {
                throw error
            }
            
        } else {
            const result = await this.client.query("SELECT name, MAX(created_at) FROM migrations GROUP BY name;");
            if(result.rowCount === 0) {
                const buffer = fs.readFileSync(path.join(this.migrationDir, files[0]));
                const sqlStmts = parseSqlStatements(buffer);
                
                for(const stmt of sqlStmts.up) {
                    await this.client.query(stmt);
                }

                await this.client.query("INSERT INTO migrations(name, created_at) VALUES($1, NOW());", [files[0]]);
                console.log("Migrated up to file: ", files[0]);
                
                await this.client.end();
                return;
            }

            for(let i = 0; i < files.length; i++) {
                if(result.rows[0].name === files[i] && files[i+1]) {      
                    const buffer = fs.readFileSync(path.join(this.migrationDir, files[i+1]));
                    const sqlStmts = parseSqlStatements(buffer);
                    
                    for(const stmt of sqlStmts.up) {
                        await this.client.query(stmt);
                    }

                    await this.client.query("INSERT INTO migrations(name, created_at) VALUES($1, NOW());", [files[i+1]]);
                    console.log("Migrated up to file: ", files[i+1]);
                }
            }
        }

        await this.client.end();
    }

    async down(args: any) {
        await this.client.connect();

        if(await this.existMigrationTable()) {
            const result = await this.client.query("SELECT name, MAX(created_at) FROM migrations GROUP BY name;");
            if(result.rowCount < 1) {
                await this.client.end();
                return;
            }

            const buffer = fs.readFileSync(path.join(this.migrationDir, result.rows[0].name));
            const sqlStmts = parseSqlStatements(buffer);
                    
            for(const stmt of sqlStmts.down) {
                    await this.client.query(stmt);
            }

            await this.client.query("DELETE FROM migrations WHERE name=$1", [result.rows[0].name]);
            
            console.log("Migrated down from file: ", result.rows[0].name);
        } 

        await this.client.end();
    }

    private async existMigrationTable() {
        try {
            const res = await this.client.query("SELECT * FROM migrations;");
            return true;
        } catch(error) {
            return false;
        }
    }
}