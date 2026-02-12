
export default function parseSqlStatements(buffer: Buffer): Array<string> {
    const content = buffer.toString();
    const stmt: Array<string> = [];

    let currentStmt: string = ""
    let isInsideDoubleQuotes: boolean = false;
    let isInsideSingleQuotes: boolean = false;

    for(let i = 0; i < content.length; i++) {
        let char = content[i];

        if (char === '"' && !isInsideSingleQuotes) {
            isInsideDoubleQuotes = !isInsideDoubleQuotes;
        } else if (char === "'" && !isInsideDoubleQuotes) {
            isInsideSingleQuotes = !isInsideSingleQuotes;
        }

        currentStmt += char;
        if(char === ";" && !isInsideDoubleQuotes && !isInsideSingleQuotes) {
            stmt.push(currentStmt.trim());
            currentStmt = "";
        }
    }

    return stmt
}