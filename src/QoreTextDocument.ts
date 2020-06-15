import { readFileSync } from 'fs';
import { Position, Range, TextDocument } from 'vscode';

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
    nonNegative(loc.end_column - 1)
);

export const pythonLoc2range = (loc: any): Range => new Range(
    nonNegative(loc.first_line - 1),
    nonNegative(loc.first_column),
    nonNegative(loc.last_line - 1),
    nonNegative(loc.last_column)
);

export const javaLoc2range = (loc: any, offset_string: string = ''): Range => new Range(
    loc.startLine - 1,
    loc.startColumn + offset_string.length - 1,
    loc.endLine - 1,
    loc.endColumn
);

export const pythonNameRange = (
    lines: string[],
    object_range: Range,
    object_name: string,
    keyword: string): Range | undefined =>
{
    let line_part = lines[object_range.start.line].substr(object_range.start.character);
    const pos = line_part.indexOf(keyword);
    if (pos === -1) {
        return undefined;
    }

    line_part = line_part.substr(keyword.length + 1);
    if (line_part.indexOf(object_name) === -1) {
        return undefined;
    }

    const object_name_start_char = object_range.start.character + keyword.length + 1 + pos;

    return new Range(
        object_range.start.line,
        object_name_start_char,
        object_range.start.line,
        object_name_start_char + object_name.length
    );
};

export function findPythonClassNameRange(doc: TextDocument, class_loc): Range | undefined {
    const text = doc.getText(new Range(
        new Position(class_loc.first_line-1, class_loc.first_column),
        new Position(class_loc.last_line-1, class_loc.last_column)
    ));
    if (!text) {
        return undefined;
    }

    const class_start = text.indexOf('class');
    if (class_start === -1) {
        return undefined;
    }

    const matches = text.match(/(class\s+)(\w+)(:|\s|[(])/);
    if (!matches || matches.length !== 4) {
        return undefined;
    }

    const name_first_col = class_loc.first_column + class_start + matches[1].length;
    return new Range(
        new Position(class_loc.first_line-1, name_first_col),
        new Position(class_loc.first_line-1, name_first_col + matches[2].length)
    );
}

export function findPythonDefNameRange(doc: TextDocument, def_loc): Range | undefined {
    const text = doc.getText(new Range(
        new Position(def_loc.first_line-1, def_loc.first_column),
        new Position(def_loc.last_line-1, def_loc.last_column)
    ));
    if (!text) {
        return undefined;
    }

    const def_start = text.indexOf('def');
    if (def_start === -1) {
        return undefined;
    }

    const matches = text.match(/(def\s+)(\w+)\s*[(]/);
    if (!matches || matches.length !== 4) {
        return undefined;
    }

    const name_first_col = def_loc.first_column + def_start + matches[1].length;
    return new Range(
        new Position(def_loc.first_line-1, name_first_col),
        new Position(def_loc.first_line-1, name_first_col + matches[2].length)
    );
}
