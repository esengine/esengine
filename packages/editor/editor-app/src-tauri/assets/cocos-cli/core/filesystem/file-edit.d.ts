export declare function insertTextAtLine(dbURL: string, fileType: string, lineNumber: number, textToInsert: string): Promise<boolean>;
export declare function eraseLinesInRange(dbURL: string, fileType: string, startLine: number, endLine: number): Promise<boolean>;
export declare function findTextOccurrencesInFile(filename: string, targetText: string): number;
export declare function replaceTextInFile(dbURL: string, fileType: string, targetText: string, replacementText: string, regex: boolean): Promise<boolean>;
export declare function queryLinesInFile(dbURL: string, fileType: string, startLine: number, lineCount: number): Promise<string>;
