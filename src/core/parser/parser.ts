
export interface ParsedSqlStatements {
    up: string[]
    down: string[]
}

export default function parseSqlStatements(buffer: Buffer): ParsedSqlStatements {
    const content = buffer.toString();
    const stmts: ParsedSqlStatements = { up: [], down: [] };

    let currentStmt: string = ""
    let currentStmtSection: string = "";

    let isInsideDoubleQuotes: boolean = false;
    let isInsideSingleQuotes: boolean = false;

    let isInsideLineComment: boolean = false;
    
    for(let i = 0; i < content.length; i++) {
        let char = content[i];
        let nextChar = content[i + 1];

        if (!isInsideSingleQuotes && !isInsideDoubleQuotes && char === "-" && nextChar === "-") {
            isInsideLineComment = true;
            i++; 
            continue;
        }

        if(isInsideLineComment && char === "\n") {
            if(currentStmt.trim() === "up") {
                currentStmtSection = "up";
            } else if(currentStmt.trim() === "down") {
                currentStmtSection = "down";
            }
            
            isInsideLineComment = false;
            currentStmt = "";
            continue;
        }
        
        
        if (char === '"' && !isInsideSingleQuotes) {
            isInsideDoubleQuotes = !isInsideDoubleQuotes;
        } else if (char === "'" && !isInsideDoubleQuotes) {
            isInsideSingleQuotes = !isInsideSingleQuotes;
        }
        
        currentStmt += char;
        if(char === ";" && !isInsideDoubleQuotes && !isInsideSingleQuotes && !isInsideLineComment) {
            if(currentStmtSection === "up") {
                stmts.up.push(currentStmt.trim());
            } else if(currentStmtSection === "down") {
                stmts.down.push(currentStmt.trim());
            }

            currentStmt = "";
        }
    }  

    return stmts
}