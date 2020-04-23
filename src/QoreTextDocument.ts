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

const nonNegative = value => value < 0 ? 0 : value;
export const loc2range = (loc: any, offset_string: string = ''): Range => new Range(
    nonNegative(loc.start_line - 1),
    nonNegative(loc.start_column + offset_string.length - 1),
    nonNegative(loc.end_line - 1),
    nonNegative(loc.end_column - 1),
);
