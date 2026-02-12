import assert from "node:assert";
import { describe, it } from "node:test";

import parseSqlStatements from "./parser.mts";

describe("sql parser", () => {
    it("sql statemets", () => {
        const mockSQL = `
            CREATE TABLE IF NOT EXISTS Users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL
            );
            
            INSERT INTO Users ("name") VALUES
                ('Alice'),
                ('Bob')
            ON CONFLICT DO NOTHING;
        `;

        const result = parseSqlStatements(Buffer.from(mockSQL, "utf-8"));
        assert.deepStrictEqual(result, [
            `CREATE TABLE IF NOT EXISTS Users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL
            );`,
            `INSERT INTO Users ("name") VALUES
                ('Alice'),
                ('Bob')
            ON CONFLICT DO NOTHING;`
        ]);
    });

    it("sql statemets with semiclon in value", () => {
        const mockSQL = `
            INSERT INTO Users ("name") VALUES
                ('Al;ice'),
                ('Bo;b')
            ON CONFLICT DO NOTHING;
        `;

        const result = parseSqlStatements(Buffer.from(mockSQL, "utf-8"));
        assert.deepStrictEqual(result, [
            `INSERT INTO Users ("name") VALUES
                ('Al;ice'),
                ('Bo;b')
            ON CONFLICT DO NOTHING;`
        ]);
    });

    it("sql statemets with attribute inside double quotes", () => {
        const mockSQL = `
            CREATE TABLE IF NOT EXISTS "Users" (
                "id" SERIAL PRIMARY KEY,
                "name" TEXT NOT NULL
            );
        `;

        const result = parseSqlStatements(Buffer.from(mockSQL, "utf-8"));
        assert.deepStrictEqual(result, [
            `CREATE TABLE IF NOT EXISTS "Users" (
                "id" SERIAL PRIMARY KEY,
                "name" TEXT NOT NULL
            );`,
        ]);
    })
})