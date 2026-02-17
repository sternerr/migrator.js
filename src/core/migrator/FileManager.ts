import fs from "node:fs";
import path from "node:path";

export default class FileManager {
    writeFile(filePath: string, content: string) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
    }

    readFile(filePath: string, file: string) {
        return fs.readFileSync(path.join(filePath, file));
    }

    getFiles(filepath: string) {
        return fs.readdirSync(filepath);
    }
}