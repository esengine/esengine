"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTextAtLine = insertTextAtLine;
exports.eraseLinesInRange = eraseLinesInRange;
exports.findTextOccurrencesInFile = findTextOccurrencesInFile;
exports.replaceTextInFile = replaceTextInFile;
exports.queryLinesInFile = queryLinesInFile;
const fs_1 = __importDefault(require("fs"));
const os_1 = require("os");
const eol_1 = __importDefault(require("eol"));
const readline_1 = __importDefault(require("readline"));
const replace_in_file_1 = require("replace-in-file");
const path_1 = __importDefault(require("path"));
const path_2 = require("../base/utils/path");
const assets_1 = require("../../core/assets");
const manager_1 = require("@cocos/asset-db/libs/manager");
const LF = '\n';
function writeTextToStream(writeStream, text) {
    let succeeded = true;
    // Append EOL to maintain line breaks
    writeStream.write(text + os_1.EOL, 'utf-8', (err) => {
        if (err) {
            console.error('Error writing file:', err.message);
            succeeded = false;
        }
    });
    return succeeded;
}
function getScriptFilename(dbURL, fileType) {
    fileType = '.' + fileType.toLowerCase(); // Ensure fileType starts with a dot
    const filename = (0, manager_1.queryPath)(dbURL);
    if (filename === '') {
        throw new Error('Filename cannot be empty.');
    }
    const projectDir = (0, path_2.resolveToRaw)('project://assets');
    // Check if the rawPath is within the projectDir/assets
    if (!(0, path_2.contains)(projectDir, filename)) {
        throw new Error('Unsafe file path detected.');
    }
    const ext = path_1.default.extname(filename).toLowerCase();
    if (ext != fileType) {
        throw new Error(`File extension mismatch. Expected ${fileType}, but got ${ext}.`);
    }
    return filename;
}
async function insertTextAtLine(dbURL, fileType, lineNumber, textToInsert) {
    --lineNumber; // Convert to zero-based index
    if (textToInsert.length === 0) {
        throw new Error('Text to insert cannot be empty.');
    }
    if (lineNumber < 0) {
        throw new Error('Line number must be non-negative.');
    }
    // Normalize EOL to the system's EOL
    textToInsert = eol_1.default.auto(textToInsert);
    const filename = getScriptFilename(dbURL, fileType);
    const fileStream = fs_1.default.createReadStream(filename);
    const rl = readline_1.default.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Create a temporary write stream
    const writeStream = fs_1.default.createWriteStream(filename + '.tmp');
    let currentLine = 0;
    let modified = false;
    let errorOccurred = false;
    try {
        for await (const line of rl) {
            if (currentLine === lineNumber) { // Insert text before the current line
                if (!writeTextToStream(writeStream, textToInsert)) {
                    errorOccurred = true;
                    break;
                }
                modified = true;
            }
            // Write the current line
            if (!writeTextToStream(writeStream, line)) {
                errorOccurred = true;
                break;
            }
            ++currentLine;
        }
    }
    catch (err) {
        console.error('insertTextAtLine error:', err);
        errorOccurred = true;
    }
    if (!errorOccurred && !modified) { // If lineNumber is greater than total lines, append at the end
        if (!writeTextToStream(writeStream, textToInsert)) {
            errorOccurred = true;
        }
        else {
            modified = true;
        }
    }
    // Close the read stream
    rl.close();
    fileStream.close();
    // Close the write stream
    writeStream.end();
    // If an error occurred, delete the temporary file
    if (errorOccurred || !modified) {
        fs_1.default.unlinkSync(filename + '.tmp');
        throw new Error('Failed to insert text at the specified line.');
    }
    // Replace the original file with the modified temporary file
    fs_1.default.renameSync(filename + '.tmp', filename);
    // Reimport script
    await assets_1.assetManager.reimportAsset(dbURL);
    return true;
}
// End line is inclusive
async function eraseLinesInRange(dbURL, fileType, startLine, endLine) {
    --startLine; // Convert to zero-based index
    --endLine; // Convert to zero-based index
    // End line must be greater than or equal to start line
    if (startLine > endLine) {
        throw new Error('End line must be greater than or equal to start line.');
    }
    if (startLine < 0 || endLine < 0) {
        throw new Error('Line numbers must be non-negative.');
    }
    const filename = getScriptFilename(dbURL, fileType);
    const fileStream = fs_1.default.createReadStream(filename);
    const rl = readline_1.default.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Create a temporary write stream
    const writeStream = fs_1.default.createWriteStream(filename + '.tmp');
    let currentLine = 0;
    let modified = false;
    let errorOccurred = false;
    try {
        for await (const line of rl) {
            if (currentLine < startLine || currentLine > endLine) {
                // Write the current line if it's outside the range
                if (!writeTextToStream(writeStream, line)) {
                    errorOccurred = true;
                    break;
                }
            }
            else {
                modified = true; // Lines in range are skipped
            }
            ++currentLine;
        }
    }
    catch (err) {
        console.error('eraseLinesInRange error:', err);
        errorOccurred = true;
    }
    // Close the read stream
    rl.close();
    fileStream.close();
    // Close the write stream
    writeStream.end();
    // If an error occurred, delete the temporary file
    if (errorOccurred) {
        fs_1.default.unlinkSync(filename + '.tmp');
        throw new Error('Failed to erase lines in the specified range.');
    }
    // Replace the original file with the modified temporary file
    if (modified) {
        fs_1.default.renameSync(filename + '.tmp', filename);
        await assets_1.assetManager.reimportAsset(dbURL);
        return true;
    }
    else {
        fs_1.default.unlinkSync(filename + '.tmp');
        throw new Error('No lines were erased. Please check the specified range.');
    }
}
function findTextOccurrencesInFile(filename, targetText) {
    // Simple string search to count occurrences
    const searchStrLen = targetText.length;
    // Read the entire file content as a string
    const str = fs_1.default.readFileSync(filename, 'utf8');
    let index = -1;
    let startIndex = 0;
    let count = 0;
    while ((index = str.indexOf(targetText, startIndex)) > -1) {
        ++count;
        startIndex = index + searchStrLen;
    }
    return count;
}
async function replaceTextInFile(dbURL, fileType, targetText, replacementText, regex) {
    // Normalize EOL to the system's EOL
    const targetText1 = eol_1.default.auto(targetText);
    replacementText = eol_1.default.auto(replacementText);
    // Get filename
    const filename = getScriptFilename(dbURL, fileType);
    let count = 0;
    if (regex) {
        // First, count occurrences
        const results = await (0, replace_in_file_1.replaceInFile)({
            files: filename,
            from: new RegExp(targetText1, 'g'), // Global replace
            to: replacementText,
            countMatches: true,
            dry: true, // Dry run to count matches first
        });
        for (const result of results) {
            if (result.numMatches) {
                count += result.numMatches;
            }
        }
    }
    else {
        count = findTextOccurrencesInFile(filename, targetText1);
    }
    if (count > 1) {
        throw new Error(`Multiple (${count}) occurrences found. File is not changed.`);
    }
    if (count == 1) {
        const results = await (0, replace_in_file_1.replaceInFile)({
            files: filename,
            from: regex
                ? new RegExp(targetText1, 'g') // Global replace
                : targetText1, // First occurrence
            to: replacementText,
        });
        await assets_1.assetManager.reimportAsset(dbURL);
        return results.some(result => result.hasChanged);
    }
    throw new Error(`No replacement was performed, TargetText ${targetText} did not appear verbatim in ${filename}.`);
}
async function queryLinesInFile(dbURL, fileType, startLine, lineCount) {
    --startLine; // Convert to zero-based index
    if (startLine < 0) {
        throw new Error('Start line must be non-negative.');
    }
    if (lineCount === 0) {
        throw new Error('Line count must be greater than zero or negative for all lines.');
    }
    const filename = getScriptFilename(dbURL, fileType);
    const fileStream = fs_1.default.createReadStream(filename);
    const rl = readline_1.default.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    let content = '';
    let currentLine = 0;
    for await (const line of rl) {
        if (currentLine >= startLine && (currentLine < startLine + lineCount || lineCount < 0)) {
            content = content.concat(`${(currentLine + 1).toString().padStart(6, ' ')}\t${line}` + LF);
        }
        ++currentLine;
    }
    // Close the read stream
    rl.close();
    fileStream.close();
    return content;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1lZGl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvZmlsZXN5c3RlbS9maWxlLWVkaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUE0Q0EsNENBNEVDO0FBR0QsOENBOERDO0FBRUQsOERBZ0JDO0FBRUQsOENBOENDO0FBRUQsNENBaUNDO0FBOVJELDRDQUFvQjtBQUNwQiwyQkFBeUI7QUFDekIsOENBQXNCO0FBQ3RCLHdEQUFnQztBQUNoQyxxREFBZ0Q7QUFDaEQsZ0RBQXdCO0FBQ3hCLDZDQUE0RDtBQUM1RCw4Q0FBaUQ7QUFDakQsMERBQXlEO0FBRXpELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztBQUVoQixTQUFTLGlCQUFpQixDQUFDLFdBQTJCLEVBQUUsSUFBWTtJQUNoRSxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDckIscUNBQXFDO0lBQ3JDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLFFBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUMzQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEQsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN0QixDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxLQUFhLEVBQUUsUUFBZ0I7SUFDdEQsUUFBUSxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxvQ0FBb0M7SUFFN0UsTUFBTSxRQUFRLEdBQUcsSUFBQSxtQkFBUyxFQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLElBQUksUUFBUSxLQUFLLEVBQUUsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBQ0QsTUFBTSxVQUFVLEdBQUcsSUFBQSxtQkFBWSxFQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDcEQsdURBQXVEO0lBQ3ZELElBQUksQ0FBQyxJQUFBLGVBQVEsRUFBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUNELE1BQU0sR0FBRyxHQUFHLGNBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7SUFFakQsSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7UUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsUUFBUSxhQUFhLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUNELE9BQU8sUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFFTSxLQUFLLFVBQVUsZ0JBQWdCLENBQ2xDLEtBQWEsRUFBRSxRQUFnQixFQUFFLFVBQWtCLEVBQUUsWUFBb0I7SUFDekUsRUFBRSxVQUFVLENBQUMsQ0FBQyw4QkFBOEI7SUFFNUMsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBQ0QsSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFDRCxvQ0FBb0M7SUFDcEMsWUFBWSxHQUFHLGFBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFdEMsTUFBTSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sVUFBVSxHQUFHLFlBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVqRCxNQUFNLEVBQUUsR0FBRyxrQkFBUSxDQUFDLGVBQWUsQ0FBQztRQUNoQyxLQUFLLEVBQUUsVUFBVTtRQUNqQixTQUFTLEVBQUUsUUFBUTtLQUN0QixDQUFDLENBQUM7SUFFSCxrQ0FBa0M7SUFDbEMsTUFBTSxXQUFXLEdBQUcsWUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUU1RCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDcEIsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQztJQUMxQixJQUFJLENBQUM7UUFDRCxJQUFJLEtBQUssRUFBRSxNQUFNLElBQUksSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUMxQixJQUFJLFdBQVcsS0FBSyxVQUFVLEVBQUUsQ0FBQyxDQUFDLHNDQUFzQztnQkFDcEUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsRUFBRSxDQUFDO29CQUNoRCxhQUFhLEdBQUcsSUFBSSxDQUFDO29CQUNyQixNQUFNO2dCQUNWLENBQUM7Z0JBQ0QsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNwQixDQUFDO1lBQ0QseUJBQXlCO1lBQ3pCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDeEMsYUFBYSxHQUFHLElBQUksQ0FBQztnQkFDckIsTUFBTTtZQUNWLENBQUM7WUFDRCxFQUFFLFdBQVcsQ0FBQztRQUNsQixDQUFDO0lBQ0wsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzlDLGFBQWEsR0FBRyxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUVELElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLCtEQUErRDtRQUM5RixJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDaEQsYUFBYSxHQUFHLElBQUksQ0FBQztRQUN6QixDQUFDO2FBQU0sQ0FBQztZQUNKLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDcEIsQ0FBQztJQUNMLENBQUM7SUFFRCx3QkFBd0I7SUFDeEIsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ1gsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBRW5CLHlCQUF5QjtJQUN6QixXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFbEIsa0RBQWtEO0lBQ2xELElBQUksYUFBYSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDN0IsWUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDakMsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCw2REFBNkQ7SUFDN0QsWUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRTNDLGtCQUFrQjtJQUNsQixNQUFNLHFCQUFZLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXhDLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFFRCx3QkFBd0I7QUFDakIsS0FBSyxVQUFVLGlCQUFpQixDQUNuQyxLQUFhLEVBQUUsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLE9BQWU7SUFDbkUsRUFBRSxTQUFTLENBQUMsQ0FBQyw4QkFBOEI7SUFDM0MsRUFBRSxPQUFPLENBQUMsQ0FBRyw4QkFBOEI7SUFFM0MsdURBQXVEO0lBQ3ZELElBQUksU0FBUyxHQUFHLE9BQU8sRUFBRSxDQUFDO1FBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBQ0QsSUFBSSxTQUFTLEdBQUcsQ0FBQyxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELE1BQU0sUUFBUSxHQUFHLGlCQUFpQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNwRCxNQUFNLFVBQVUsR0FBRyxZQUFFLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakQsTUFBTSxFQUFFLEdBQUcsa0JBQVEsQ0FBQyxlQUFlLENBQUM7UUFDaEMsS0FBSyxFQUFFLFVBQVU7UUFDakIsU0FBUyxFQUFFLFFBQVE7S0FDdEIsQ0FBQyxDQUFDO0lBQ0gsa0NBQWtDO0lBQ2xDLE1BQU0sV0FBVyxHQUFHLFlBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUM7SUFDNUQsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztJQUNyQixJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7SUFDMUIsSUFBSSxDQUFDO1FBQ0QsSUFBSSxLQUFLLEVBQUUsTUFBTSxJQUFJLElBQUksRUFBRSxFQUFFLENBQUM7WUFDMUIsSUFBSSxXQUFXLEdBQUcsU0FBUyxJQUFJLFdBQVcsR0FBRyxPQUFPLEVBQUUsQ0FBQztnQkFDbkQsbURBQW1EO2dCQUNuRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQ3hDLGFBQWEsR0FBRyxJQUFJLENBQUM7b0JBQ3JCLE1BQU07Z0JBQ1YsQ0FBQztZQUNMLENBQUM7aUJBQU0sQ0FBQztnQkFDSixRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsNkJBQTZCO1lBQ2xELENBQUM7WUFDRCxFQUFFLFdBQVcsQ0FBQztRQUNsQixDQUFDO0lBQ0wsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9DLGFBQWEsR0FBRyxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUNELHdCQUF3QjtJQUN4QixFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDWCxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbkIseUJBQXlCO0lBQ3pCLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNsQixrREFBa0Q7SUFDbEQsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUNoQixZQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUNELDZEQUE2RDtJQUM3RCxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ1gsWUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRTNDLE1BQU0scUJBQVksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFeEMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztTQUFNLENBQUM7UUFDSixZQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7SUFDL0UsQ0FBQztBQUNMLENBQUM7QUFFRCxTQUFnQix5QkFBeUIsQ0FDckMsUUFBZ0IsRUFBRSxVQUFrQjtJQUNwQyw0Q0FBNEM7SUFDNUMsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztJQUV2QywyQ0FBMkM7SUFDM0MsTUFBTSxHQUFHLEdBQUcsWUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFOUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDZixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDbkIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsT0FBTyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDeEQsRUFBRSxLQUFLLENBQUM7UUFDUixVQUFVLEdBQUcsS0FBSyxHQUFHLFlBQVksQ0FBQztJQUN0QyxDQUFDO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQztBQUVNLEtBQUssVUFBVSxpQkFBaUIsQ0FDbkMsS0FBYSxFQUFFLFFBQWdCLEVBQUUsVUFBa0IsRUFBRSxlQUF1QixFQUFFLEtBQWM7SUFDNUYsb0NBQW9DO0lBQ3BDLE1BQU0sV0FBVyxHQUFHLGFBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDekMsZUFBZSxHQUFHLGFBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFFNUMsZUFBZTtJQUNmLE1BQU0sUUFBUSxHQUFHLGlCQUFpQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUVwRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDZCxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ1IsMkJBQTJCO1FBQzNCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSwrQkFBYSxFQUFDO1lBQ2hDLEtBQUssRUFBRSxRQUFRO1lBQ2YsSUFBSSxFQUFFLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsRUFBRSxpQkFBaUI7WUFDckQsRUFBRSxFQUFFLGVBQWU7WUFDbkIsWUFBWSxFQUFFLElBQUk7WUFDbEIsR0FBRyxFQUFFLElBQUksRUFBRSxpQ0FBaUM7U0FDL0MsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUMzQixJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDcEIsS0FBSyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDL0IsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO1NBQU0sQ0FBQztRQUNKLEtBQUssR0FBRyx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyxhQUFhLEtBQUssMkNBQTJDLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBRUQsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDYixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEsK0JBQWEsRUFBQztZQUNoQyxLQUFLLEVBQUUsUUFBUTtZQUNmLElBQUksRUFBRSxLQUFLO2dCQUNQLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsaUJBQWlCO2dCQUNoRCxDQUFDLENBQUMsV0FBVyxFQUFFLG1CQUFtQjtZQUN0QyxFQUFFLEVBQUUsZUFBZTtTQUN0QixDQUFDLENBQUM7UUFFSCxNQUFNLHFCQUFZLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXhDLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMsVUFBVSwrQkFBK0IsUUFBUSxHQUFHLENBQUMsQ0FBQztBQUN0SCxDQUFDO0FBRU0sS0FBSyxVQUFVLGdCQUFnQixDQUNsQyxLQUFhLEVBQUUsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLFNBQWlCO0lBQ3JFLEVBQUUsU0FBUyxDQUFDLENBQUMsOEJBQThCO0lBRTNDLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBQ0QsSUFBSSxTQUFTLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFRCxNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFcEQsTUFBTSxVQUFVLEdBQUcsWUFBRSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pELE1BQU0sRUFBRSxHQUFHLGtCQUFRLENBQUMsZUFBZSxDQUFDO1FBQ2hDLEtBQUssRUFBRSxVQUFVO1FBQ2pCLFNBQVMsRUFBRSxRQUFRO0tBQ3RCLENBQUMsQ0FBQztJQUVILElBQUksT0FBTyxHQUFXLEVBQUUsQ0FBQztJQUN6QixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDcEIsSUFBSSxLQUFLLEVBQUUsTUFBTSxJQUFJLElBQUksRUFBRSxFQUFFLENBQUM7UUFDMUIsSUFBSSxXQUFXLElBQUksU0FBUyxJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsR0FBRyxTQUFTLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDckYsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQy9GLENBQUM7UUFDRCxFQUFFLFdBQVcsQ0FBQztJQUNsQixDQUFDO0lBRUQsd0JBQXdCO0lBQ3hCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNYLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUVuQixPQUFPLE9BQU8sQ0FBQztBQUNuQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgRU9MIH0gZnJvbSAnb3MnO1xyXG5pbXBvcnQgZW9sIGZyb20gJ2VvbCc7XHJcbmltcG9ydCByZWFkbGluZSBmcm9tICdyZWFkbGluZSc7XHJcbmltcG9ydCB7IHJlcGxhY2VJbkZpbGUgfSBmcm9tICdyZXBsYWNlLWluLWZpbGUnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgcmVzb2x2ZVRvUmF3LCBjb250YWlucyB9IGZyb20gJy4uL2Jhc2UvdXRpbHMvcGF0aCc7XHJcbmltcG9ydCB7IGFzc2V0TWFuYWdlciB9IGZyb20gJy4uLy4uL2NvcmUvYXNzZXRzJztcclxuaW1wb3J0IHsgcXVlcnlQYXRoIH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiL2xpYnMvbWFuYWdlcic7XHJcblxyXG5jb25zdCBMRiA9ICdcXG4nO1xyXG5cclxuZnVuY3Rpb24gd3JpdGVUZXh0VG9TdHJlYW0od3JpdGVTdHJlYW06IGZzLldyaXRlU3RyZWFtLCB0ZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGxldCBzdWNjZWVkZWQgPSB0cnVlO1xyXG4gICAgLy8gQXBwZW5kIEVPTCB0byBtYWludGFpbiBsaW5lIGJyZWFrc1xyXG4gICAgd3JpdGVTdHJlYW0ud3JpdGUodGV4dCArIEVPTCwgJ3V0Zi04JywgKGVycikgPT4ge1xyXG4gICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igd3JpdGluZyBmaWxlOicsIGVyci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgc3VjY2VlZGVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gc3VjY2VlZGVkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTY3JpcHRGaWxlbmFtZShkYlVSTDogc3RyaW5nLCBmaWxlVHlwZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGZpbGVUeXBlID0gJy4nICsgZmlsZVR5cGUudG9Mb3dlckNhc2UoKTsgLy8gRW5zdXJlIGZpbGVUeXBlIHN0YXJ0cyB3aXRoIGEgZG90XHJcblxyXG4gICAgY29uc3QgZmlsZW5hbWUgPSBxdWVyeVBhdGgoZGJVUkwpO1xyXG4gICAgaWYgKGZpbGVuYW1lID09PSAnJykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmlsZW5hbWUgY2Fubm90IGJlIGVtcHR5LicpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcHJvamVjdERpciA9IHJlc29sdmVUb1JhdygncHJvamVjdDovL2Fzc2V0cycpO1xyXG4gICAgLy8gQ2hlY2sgaWYgdGhlIHJhd1BhdGggaXMgd2l0aGluIHRoZSBwcm9qZWN0RGlyL2Fzc2V0c1xyXG4gICAgaWYgKCFjb250YWlucyhwcm9qZWN0RGlyLCBmaWxlbmFtZSkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc2FmZSBmaWxlIHBhdGggZGV0ZWN0ZWQuJyk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZW5hbWUpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgaWYgKGV4dCAhPSBmaWxlVHlwZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRmlsZSBleHRlbnNpb24gbWlzbWF0Y2guIEV4cGVjdGVkICR7ZmlsZVR5cGV9LCBidXQgZ290ICR7ZXh0fS5gKTtcclxuICAgIH1cclxuICAgIHJldHVybiBmaWxlbmFtZTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluc2VydFRleHRBdExpbmUoXHJcbiAgICBkYlVSTDogc3RyaW5nLCBmaWxlVHlwZTogc3RyaW5nLCBsaW5lTnVtYmVyOiBudW1iZXIsIHRleHRUb0luc2VydDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAtLWxpbmVOdW1iZXI7IC8vIENvbnZlcnQgdG8gemVyby1iYXNlZCBpbmRleFxyXG5cclxuICAgIGlmICh0ZXh0VG9JbnNlcnQubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZXh0IHRvIGluc2VydCBjYW5ub3QgYmUgZW1wdHkuJyk7XHJcbiAgICB9XHJcbiAgICBpZiAobGluZU51bWJlciA8IDApIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xpbmUgbnVtYmVyIG11c3QgYmUgbm9uLW5lZ2F0aXZlLicpO1xyXG4gICAgfVxyXG4gICAgLy8gTm9ybWFsaXplIEVPTCB0byB0aGUgc3lzdGVtJ3MgRU9MXHJcbiAgICB0ZXh0VG9JbnNlcnQgPSBlb2wuYXV0byh0ZXh0VG9JbnNlcnQpO1xyXG5cclxuICAgIGNvbnN0IGZpbGVuYW1lID0gZ2V0U2NyaXB0RmlsZW5hbWUoZGJVUkwsIGZpbGVUeXBlKTtcclxuICAgIGNvbnN0IGZpbGVTdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGVuYW1lKTtcclxuXHJcbiAgICBjb25zdCBybCA9IHJlYWRsaW5lLmNyZWF0ZUludGVyZmFjZSh7XHJcbiAgICAgICAgaW5wdXQ6IGZpbGVTdHJlYW0sXHJcbiAgICAgICAgY3JsZkRlbGF5OiBJbmZpbml0eVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IHdyaXRlIHN0cmVhbVxyXG4gICAgY29uc3Qgd3JpdGVTdHJlYW0gPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShmaWxlbmFtZSArICcudG1wJyk7XHJcblxyXG4gICAgbGV0IGN1cnJlbnRMaW5lID0gMDtcclxuICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xyXG4gICAgbGV0IGVycm9yT2NjdXJyZWQgPSBmYWxzZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgZm9yIGF3YWl0IChjb25zdCBsaW5lIG9mIHJsKSB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50TGluZSA9PT0gbGluZU51bWJlcikgeyAvLyBJbnNlcnQgdGV4dCBiZWZvcmUgdGhlIGN1cnJlbnQgbGluZVxyXG4gICAgICAgICAgICAgICAgaWYgKCF3cml0ZVRleHRUb1N0cmVhbSh3cml0ZVN0cmVhbSwgdGV4dFRvSW5zZXJ0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yT2NjdXJyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFdyaXRlIHRoZSBjdXJyZW50IGxpbmVcclxuICAgICAgICAgICAgaWYgKCF3cml0ZVRleHRUb1N0cmVhbSh3cml0ZVN0cmVhbSwgbGluZSkpIHtcclxuICAgICAgICAgICAgICAgIGVycm9yT2NjdXJyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKytjdXJyZW50TGluZTtcclxuICAgICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdpbnNlcnRUZXh0QXRMaW5lIGVycm9yOicsIGVycik7XHJcbiAgICAgICAgZXJyb3JPY2N1cnJlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFlcnJvck9jY3VycmVkICYmICFtb2RpZmllZCkgeyAvLyBJZiBsaW5lTnVtYmVyIGlzIGdyZWF0ZXIgdGhhbiB0b3RhbCBsaW5lcywgYXBwZW5kIGF0IHRoZSBlbmRcclxuICAgICAgICBpZiAoIXdyaXRlVGV4dFRvU3RyZWFtKHdyaXRlU3RyZWFtLCB0ZXh0VG9JbnNlcnQpKSB7XHJcbiAgICAgICAgICAgIGVycm9yT2NjdXJyZWQgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2xvc2UgdGhlIHJlYWQgc3RyZWFtXHJcbiAgICBybC5jbG9zZSgpO1xyXG4gICAgZmlsZVN0cmVhbS5jbG9zZSgpO1xyXG5cclxuICAgIC8vIENsb3NlIHRoZSB3cml0ZSBzdHJlYW1cclxuICAgIHdyaXRlU3RyZWFtLmVuZCgpO1xyXG5cclxuICAgIC8vIElmIGFuIGVycm9yIG9jY3VycmVkLCBkZWxldGUgdGhlIHRlbXBvcmFyeSBmaWxlXHJcbiAgICBpZiAoZXJyb3JPY2N1cnJlZCB8fCAhbW9kaWZpZWQpIHtcclxuICAgICAgICBmcy51bmxpbmtTeW5jKGZpbGVuYW1lICsgJy50bXAnKTtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBpbnNlcnQgdGV4dCBhdCB0aGUgc3BlY2lmaWVkIGxpbmUuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVwbGFjZSB0aGUgb3JpZ2luYWwgZmlsZSB3aXRoIHRoZSBtb2RpZmllZCB0ZW1wb3JhcnkgZmlsZVxyXG4gICAgZnMucmVuYW1lU3luYyhmaWxlbmFtZSArICcudG1wJywgZmlsZW5hbWUpO1xyXG5cclxuICAgIC8vIFJlaW1wb3J0IHNjcmlwdFxyXG4gICAgYXdhaXQgYXNzZXRNYW5hZ2VyLnJlaW1wb3J0QXNzZXQoZGJVUkwpO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG4vLyBFbmQgbGluZSBpcyBpbmNsdXNpdmVcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVyYXNlTGluZXNJblJhbmdlKFxyXG4gICAgZGJVUkw6IHN0cmluZywgZmlsZVR5cGU6IHN0cmluZywgc3RhcnRMaW5lOiBudW1iZXIsIGVuZExpbmU6IG51bWJlcik6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgLS1zdGFydExpbmU7IC8vIENvbnZlcnQgdG8gemVyby1iYXNlZCBpbmRleFxyXG4gICAgLS1lbmRMaW5lOyAgIC8vIENvbnZlcnQgdG8gemVyby1iYXNlZCBpbmRleFxyXG5cclxuICAgIC8vIEVuZCBsaW5lIG11c3QgYmUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHN0YXJ0IGxpbmVcclxuICAgIGlmIChzdGFydExpbmUgPiBlbmRMaW5lKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbmQgbGluZSBtdXN0IGJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBzdGFydCBsaW5lLicpO1xyXG4gICAgfVxyXG4gICAgaWYgKHN0YXJ0TGluZSA8IDAgfHwgZW5kTGluZSA8IDApIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xpbmUgbnVtYmVycyBtdXN0IGJlIG5vbi1uZWdhdGl2ZS4nKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBmaWxlbmFtZSA9IGdldFNjcmlwdEZpbGVuYW1lKGRiVVJMLCBmaWxlVHlwZSk7XHJcbiAgICBjb25zdCBmaWxlU3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlbmFtZSk7XHJcbiAgICBjb25zdCBybCA9IHJlYWRsaW5lLmNyZWF0ZUludGVyZmFjZSh7XHJcbiAgICAgICAgaW5wdXQ6IGZpbGVTdHJlYW0sXHJcbiAgICAgICAgY3JsZkRlbGF5OiBJbmZpbml0eVxyXG4gICAgfSk7XHJcbiAgICAvLyBDcmVhdGUgYSB0ZW1wb3Jhcnkgd3JpdGUgc3RyZWFtXHJcbiAgICBjb25zdCB3cml0ZVN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGZpbGVuYW1lICsgJy50bXAnKTtcclxuICAgIGxldCBjdXJyZW50TGluZSA9IDA7XHJcbiAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcclxuICAgIGxldCBlcnJvck9jY3VycmVkID0gZmFsc2U7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGZvciBhd2FpdCAoY29uc3QgbGluZSBvZiBybCkge1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudExpbmUgPCBzdGFydExpbmUgfHwgY3VycmVudExpbmUgPiBlbmRMaW5lKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXcml0ZSB0aGUgY3VycmVudCBsaW5lIGlmIGl0J3Mgb3V0c2lkZSB0aGUgcmFuZ2VcclxuICAgICAgICAgICAgICAgIGlmICghd3JpdGVUZXh0VG9TdHJlYW0od3JpdGVTdHJlYW0sIGxpbmUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JPY2N1cnJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7IC8vIExpbmVzIGluIHJhbmdlIGFyZSBza2lwcGVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKytjdXJyZW50TGluZTtcclxuICAgICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdlcmFzZUxpbmVzSW5SYW5nZSBlcnJvcjonLCBlcnIpO1xyXG4gICAgICAgIGVycm9yT2NjdXJyZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgLy8gQ2xvc2UgdGhlIHJlYWQgc3RyZWFtXHJcbiAgICBybC5jbG9zZSgpO1xyXG4gICAgZmlsZVN0cmVhbS5jbG9zZSgpO1xyXG4gICAgLy8gQ2xvc2UgdGhlIHdyaXRlIHN0cmVhbVxyXG4gICAgd3JpdGVTdHJlYW0uZW5kKCk7XHJcbiAgICAvLyBJZiBhbiBlcnJvciBvY2N1cnJlZCwgZGVsZXRlIHRoZSB0ZW1wb3JhcnkgZmlsZVxyXG4gICAgaWYgKGVycm9yT2NjdXJyZWQpIHtcclxuICAgICAgICBmcy51bmxpbmtTeW5jKGZpbGVuYW1lICsgJy50bXAnKTtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBlcmFzZSBsaW5lcyBpbiB0aGUgc3BlY2lmaWVkIHJhbmdlLicpO1xyXG4gICAgfVxyXG4gICAgLy8gUmVwbGFjZSB0aGUgb3JpZ2luYWwgZmlsZSB3aXRoIHRoZSBtb2RpZmllZCB0ZW1wb3JhcnkgZmlsZVxyXG4gICAgaWYgKG1vZGlmaWVkKSB7XHJcbiAgICAgICAgZnMucmVuYW1lU3luYyhmaWxlbmFtZSArICcudG1wJywgZmlsZW5hbWUpO1xyXG5cclxuICAgICAgICBhd2FpdCBhc3NldE1hbmFnZXIucmVpbXBvcnRBc3NldChkYlVSTCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBmcy51bmxpbmtTeW5jKGZpbGVuYW1lICsgJy50bXAnKTtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGxpbmVzIHdlcmUgZXJhc2VkLiBQbGVhc2UgY2hlY2sgdGhlIHNwZWNpZmllZCByYW5nZS4nKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRUZXh0T2NjdXJyZW5jZXNJbkZpbGUoXHJcbiAgICBmaWxlbmFtZTogc3RyaW5nLCB0YXJnZXRUZXh0OiBzdHJpbmcpOiBudW1iZXIge1xyXG4gICAgLy8gU2ltcGxlIHN0cmluZyBzZWFyY2ggdG8gY291bnQgb2NjdXJyZW5jZXNcclxuICAgIGNvbnN0IHNlYXJjaFN0ckxlbiA9IHRhcmdldFRleHQubGVuZ3RoO1xyXG5cclxuICAgIC8vIFJlYWQgdGhlIGVudGlyZSBmaWxlIGNvbnRlbnQgYXMgYSBzdHJpbmdcclxuICAgIGNvbnN0IHN0ciA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKTtcclxuXHJcbiAgICBsZXQgaW5kZXggPSAtMTtcclxuICAgIGxldCBzdGFydEluZGV4ID0gMDtcclxuICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICB3aGlsZSAoKGluZGV4ID0gc3RyLmluZGV4T2YodGFyZ2V0VGV4dCwgc3RhcnRJbmRleCkpID4gLTEpIHtcclxuICAgICAgICArK2NvdW50O1xyXG4gICAgICAgIHN0YXJ0SW5kZXggPSBpbmRleCArIHNlYXJjaFN0ckxlbjtcclxuICAgIH1cclxuICAgIHJldHVybiBjb3VudDtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlcGxhY2VUZXh0SW5GaWxlKFxyXG4gICAgZGJVUkw6IHN0cmluZywgZmlsZVR5cGU6IHN0cmluZywgdGFyZ2V0VGV4dDogc3RyaW5nLCByZXBsYWNlbWVudFRleHQ6IHN0cmluZywgcmVnZXg6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIC8vIE5vcm1hbGl6ZSBFT0wgdG8gdGhlIHN5c3RlbSdzIEVPTFxyXG4gICAgY29uc3QgdGFyZ2V0VGV4dDEgPSBlb2wuYXV0byh0YXJnZXRUZXh0KTtcclxuICAgIHJlcGxhY2VtZW50VGV4dCA9IGVvbC5hdXRvKHJlcGxhY2VtZW50VGV4dCk7XHJcblxyXG4gICAgLy8gR2V0IGZpbGVuYW1lXHJcbiAgICBjb25zdCBmaWxlbmFtZSA9IGdldFNjcmlwdEZpbGVuYW1lKGRiVVJMLCBmaWxlVHlwZSk7XHJcblxyXG4gICAgbGV0IGNvdW50ID0gMDtcclxuICAgIGlmIChyZWdleCkge1xyXG4gICAgICAgIC8vIEZpcnN0LCBjb3VudCBvY2N1cnJlbmNlc1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCByZXBsYWNlSW5GaWxlKHtcclxuICAgICAgICAgICAgZmlsZXM6IGZpbGVuYW1lLFxyXG4gICAgICAgICAgICBmcm9tOiBuZXcgUmVnRXhwKHRhcmdldFRleHQxLCAnZycpLCAvLyBHbG9iYWwgcmVwbGFjZVxyXG4gICAgICAgICAgICB0bzogcmVwbGFjZW1lbnRUZXh0LFxyXG4gICAgICAgICAgICBjb3VudE1hdGNoZXM6IHRydWUsXHJcbiAgICAgICAgICAgIGRyeTogdHJ1ZSwgLy8gRHJ5IHJ1biB0byBjb3VudCBtYXRjaGVzIGZpcnN0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgcmVzdWx0cykge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0Lm51bU1hdGNoZXMpIHtcclxuICAgICAgICAgICAgICAgIGNvdW50ICs9IHJlc3VsdC5udW1NYXRjaGVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb3VudCA9IGZpbmRUZXh0T2NjdXJyZW5jZXNJbkZpbGUoZmlsZW5hbWUsIHRhcmdldFRleHQxKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY291bnQgPiAxKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNdWx0aXBsZSAoJHtjb3VudH0pIG9jY3VycmVuY2VzIGZvdW5kLiBGaWxlIGlzIG5vdCBjaGFuZ2VkLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjb3VudCA9PSAxKSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHJlcGxhY2VJbkZpbGUoe1xyXG4gICAgICAgICAgICBmaWxlczogZmlsZW5hbWUsXHJcbiAgICAgICAgICAgIGZyb206IHJlZ2V4XHJcbiAgICAgICAgICAgICAgICA/IG5ldyBSZWdFeHAodGFyZ2V0VGV4dDEsICdnJykgLy8gR2xvYmFsIHJlcGxhY2VcclxuICAgICAgICAgICAgICAgIDogdGFyZ2V0VGV4dDEsIC8vIEZpcnN0IG9jY3VycmVuY2VcclxuICAgICAgICAgICAgdG86IHJlcGxhY2VtZW50VGV4dCxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYXdhaXQgYXNzZXRNYW5hZ2VyLnJlaW1wb3J0QXNzZXQoZGJVUkwpO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0cy5zb21lKHJlc3VsdCA9PiByZXN1bHQuaGFzQ2hhbmdlZCk7XHJcbiAgICB9XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHJlcGxhY2VtZW50IHdhcyBwZXJmb3JtZWQsIFRhcmdldFRleHQgJHt0YXJnZXRUZXh0fSBkaWQgbm90IGFwcGVhciB2ZXJiYXRpbSBpbiAke2ZpbGVuYW1lfS5gKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHF1ZXJ5TGluZXNJbkZpbGUoXHJcbiAgICBkYlVSTDogc3RyaW5nLCBmaWxlVHlwZTogc3RyaW5nLCBzdGFydExpbmU6IG51bWJlciwgbGluZUNvdW50OiBudW1iZXIpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgLS1zdGFydExpbmU7IC8vIENvbnZlcnQgdG8gemVyby1iYXNlZCBpbmRleFxyXG5cclxuICAgIGlmIChzdGFydExpbmUgPCAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdGFydCBsaW5lIG11c3QgYmUgbm9uLW5lZ2F0aXZlLicpO1xyXG4gICAgfVxyXG4gICAgaWYgKGxpbmVDb3VudCA9PT0gMCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTGluZSBjb3VudCBtdXN0IGJlIGdyZWF0ZXIgdGhhbiB6ZXJvIG9yIG5lZ2F0aXZlIGZvciBhbGwgbGluZXMuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmlsZW5hbWUgPSBnZXRTY3JpcHRGaWxlbmFtZShkYlVSTCwgZmlsZVR5cGUpO1xyXG5cclxuICAgIGNvbnN0IGZpbGVTdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGVuYW1lKTtcclxuICAgIGNvbnN0IHJsID0gcmVhZGxpbmUuY3JlYXRlSW50ZXJmYWNlKHtcclxuICAgICAgICBpbnB1dDogZmlsZVN0cmVhbSxcclxuICAgICAgICBjcmxmRGVsYXk6IEluZmluaXR5XHJcbiAgICB9KTtcclxuXHJcbiAgICBsZXQgY29udGVudDogc3RyaW5nID0gJyc7XHJcbiAgICBsZXQgY3VycmVudExpbmUgPSAwO1xyXG4gICAgZm9yIGF3YWl0IChjb25zdCBsaW5lIG9mIHJsKSB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnRMaW5lID49IHN0YXJ0TGluZSAmJiAoY3VycmVudExpbmUgPCBzdGFydExpbmUgKyBsaW5lQ291bnQgfHwgbGluZUNvdW50IDwgMCkpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQuY29uY2F0KGAkeyhjdXJyZW50TGluZSArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoNiwgJyAnKX1cXHQke2xpbmV9YCArIExGKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgKytjdXJyZW50TGluZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDbG9zZSB0aGUgcmVhZCBzdHJlYW1cclxuICAgIHJsLmNsb3NlKCk7XHJcbiAgICBmaWxlU3RyZWFtLmNsb3NlKCk7XHJcblxyXG4gICAgcmV0dXJuIGNvbnRlbnQ7XHJcbn1cclxuIl19