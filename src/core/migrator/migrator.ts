import path from "node:path";
import { Client } from "pg";
import parseSqlStatements from "../parser/parser";
import FileManager from "./FileManager";
import MigrationTable from "./migrationTable";

export default class Migrator {
    private migrationDir: string = path.join(process.cwd(), "migrations");
    private fileManager: FileManager = new FileManager();
    private client: Client;
    
    constructor(connectionString: string = "") {
        this.client = new Client({connectionString});
    }

    create(name: string = "") {
        const timestamp = Date.now();
        const filename = `${timestamp}${name ? "_" + name : ""}.sql`;
        const filepath = path.join(this.migrationDir, filename);

        this.fileManager.writeFile(filepath, "");
        console.log("Created:", filename);
    }

    async up() {
        await this.client.connect();
        const migrationTable = new MigrationTable(this.client);

        await migrationTable.createTable();
        
        const migrations = this.fileManager.getFiles(this.migrationDir);
        const lastMigration = await migrationTable.getLastMigration();

        if(!lastMigration) {
            const buffer = this.fileManager.readFile(this.migrationDir, migrations[0]);
            const sqlStmts = parseSqlStatements(buffer);

            migrationTable.createMigration(migrations[0]);

            for(const stmt of sqlStmts.up) {
                await this.client.query(stmt);
            }

            console.log("Migration up from file: ", migrations[0])
        } else {
            for(let i = 0; i < migrations.length; i++) {
                if(lastMigration === migrations[i] && migrations[i+1]) {      
                    const buffer = this.fileManager.readFile(this.migrationDir, migrations[i+1]);
                    const sqlStmts = parseSqlStatements(buffer);
                    
                    for(const stmt of sqlStmts.up) {
                        await this.client.query(stmt);
                    }

                    await migrationTable.createMigration(migrations[i+1]);
                    console.log("Migrated up to file: ", migrations[i+1]);
                    break;
                }
            }
        }

        await this.client.end();
    }

    async down() {
        await this.client.connect();
        const migrationTable = new MigrationTable(this.client);

        migrationTable.createTable();

        const lastMigration = await migrationTable.getLastMigration();
        if(!lastMigration) {
            await this.client.end();
            return;
        }

        const buffer = this.fileManager.readFile(this.migrationDir, lastMigration);
        const sqlStmts = parseSqlStatements(buffer);
                    
        for(const stmt of sqlStmts.down) {
            await this.client.query(stmt);
        }

        await migrationTable.deleteMigration(lastMigration);
        await this.client.end();
        
        console.log("Migrated down from file: ", lastMigration);
    }
}