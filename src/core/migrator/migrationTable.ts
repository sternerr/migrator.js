import { Client } from "pg";

export default class MigrationTable {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async createTable() {
        await this.client.query(`
            CREATE TABLE IF NOT EXISTS migrations(
                name TEXT PRIMARY KEY,
                created_at TIMESTAMP NOT NULL
            );
        `);
    }

    async createMigration(name: string) {
        await this.client.query("INSERT INTO migrations(name, created_at) VALUES($1, NOW());", [name]);
    }

    async deleteMigration(name: string) {
        await this.client.query("DELETE FROM migrations WHERE name=$1", [name]);
    }

    async getLastMigration(): Promise<string | null> {
        const res = await this.client.query("SELECT * FROM migrations");
        return res.rowCount > 0 ? res.rows[0].name : null;
    }
}