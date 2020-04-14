import { readFileSync } from 'fs';
import { Range } from 'vscode';

import { makeFileUri } from './qorus_utils';

export interface QoreTextDocument {
    uri: string;
    text: string;
    languageId: string;
    version: number;
}

export const qoreTextDocument = (file: string): QoreTextDocument => {
    const file_content = readFileSync(file);
    const buffer: Buffer = Buffer.from(file_content);
    const contents = buffer.toString();

    return {
        uri: makeFileUri(file),
        text: contents,
        languageId: 'qore',
        version: 1
    };
};

export const loc2range = (loc: any, offset_string: string = ''): Range => new Range(
    (loc.start_line || 1) - 1,
    (loc.start_column + offset_string.length || 1) - 1,
    loc.end_line - 1,
    loc.end_column - 1,
);
