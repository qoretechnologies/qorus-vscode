import { Range } from 'vscode';
import * as fs from 'fs';

export interface QoreTextDocument {
    uri: string;
    text: string;
    languageId: string;
    version: number;
};

export const qoreTextDocument = (file: string): QoreTextDocument => {
    const file_content = fs.readFileSync(file);
    const buffer: Buffer = Buffer.from(file_content);
    const contents = buffer.toString();

    return {
        uri: 'file:' + file,
        text: contents,
        languageId: 'qore',
        version: 1
    };
};

export const loc2range = (loc: any, offset_string: string = ''): Range => new Range(
    loc.start_line - 1,
    loc.start_column - 1 + offset_string.length,
    loc.end_line - 1,
    loc.end_column - 1,
);
