import { existsSync, readFileSync } from 'fs';
import { copySync, removeSync } from 'fs-extra';
import { homedir } from 'os';
import { join } from 'path';
import { Range } from 'vscode';
import { TextDocument } from 'vscode-languageserver-types';

import * as msg from './qorus_message';
import { compareVersion } from './qorus_utils';


function getDocumentTextLine(doc: TextDocument, line: number): string {
    const beginOffset = doc.offsetAt({line: line, character: 0});
    const endOffset = doc.offsetAt({line: line, character: 99999999});
    return doc.getText({
        start: doc.positionAt(beginOffset),
        end: doc.positionAt(endOffset)
    });
}

function findDocumentEol(doc: TextDocument) {
    const text = doc.getText();
    let eol = text.match(/(\n|\r\n)/);
    if (!eol || eol.length < 1) {
        return '\n';
    } else {
        return eol[0];
    }
}

/** Parse inheritance of a class (symbol) and add info about base class to the symbol.
 * 
 * Adds \c extends property to the symbol with base class name
 * and it's position in the document, if there is a base class.
 * The \c extends property format: { name: string, range: Range }
 * 
 * @param document text document to scan for inheritance
 * @param symbol class for which to scan inheritance
 */
export function parseJavaInheritance(document: TextDocument, symbol) {
    // find end of inheritance section (beginning of class block)
    const begin = symbol.selectionRange.end;
    let endChar = -1;
    let endLine = -1;
    for (let i = begin.line; i < document.lineCount; ++i) {
        let line = getDocumentTextLine(document, i);
        if (line.trim() === '' || line.match(/^\w*$/)) {
            continue;
        }
        endChar = line.indexOf('{');
        if (endChar !== -1) {
            endLine = i;
            break;
        }
    }
    if (endLine === -1) {
        return;
    }

    // get needed parts of text document
    const inheritanceRange = new Range(begin.line, 0, endLine, endChar);
    const origText = document.getText(inheritanceRange);
    const text = origText.substr(begin.character).replace(/(\n|\r)/, '');

    // split the text into clean words (get rid of whitespace and commas)
    let words = text.split(/\s+/);
    let i = 0;
    while (i < words.length) {
        const word = words[i];
        if (!word.length || word === ',') {
            words.splice(i, 1);
            continue;
        }

        let splitted = word.split(',');
        for (let s = 0; s < splitted.length;) {
            if (!splitted[s].length) {
                splitted.splice(s, 1);
                continue;
            }
            ++s;
        }

        if (splitted.length) {
            words.splice(i++, 1, splitted.shift());
            while (splitted.length) {
                words.splice(i++, 0, splitted.shift());
            }
        } else {
            ++i;
        }
    }
    if (words.length < 2) {
        return;
    }

    // parse base class and interfaces
    let baseClass;
    while (words.length) {
        if (words[0] === 'extends' && words.length > 1) {
            baseClass = words[1];
            words.splice(0, 2);
        }
        else if (words[0] === 'implements' && words.length > 1) {
            words.splice(0, 1);
            if (!symbol.implements) {
                symbol.implements = [];
            }

            // we need this helper variable cause otherwise typescript would
            // report an error in the while cycle condition, if there was
            // words[0] !== 'extends'
            let newWord = (words.length) ? words[0] : '';
            while (words.length && newWord !== 'extends') {
                symbol.implements.push(newWord);
                words.splice(0, 1);
                if (words.length) {
                    newWord = words[0];
                }
            }
        }
        else {
            break;
        }
    }

    // find base class range
    if (baseClass !== undefined) {
        const re = new RegExp('\\sextends\\s+' + baseClass);
        const matches = origText.match(re);
        if (!matches) {
            return;
        }
        const extendsPos = origText.indexOf(matches[0]);
        let firstChar = origText.indexOf(baseClass, extendsPos);

        const eol = findDocumentEol(document);
        let line = begin.line;
        let newLinePos = origText.indexOf(eol);
        let lastNewLinePos = 0;
        while (newLinePos !== -1) {
            if (newLinePos > firstChar) {
                break;
            }
            ++line;
            lastNewLinePos = newLinePos;
            newLinePos = origText.indexOf(eol, newLinePos + 1);
        }
        if (lastNewLinePos) {
            firstChar -= lastNewLinePos + eol.length;
        }

        //++line; // needed in case positions should be starting from 1
        //++firstChar; // needed in case positions should be starting from 1

        // set the symbol extends property
        symbol.extends = {
            name: baseClass,
            range: {
                start: {
                    line: line,
                    character: firstChar
                },
                end: {
                    line: line,
                    character: firstChar + baseClass.length
                }
            }
        };
    }
}

const QorusJavaApiVerFile = 'qorus-java-api-ver.txt';
const QorusJavaApiDirName = 'qorus-java-api';
const QorusJavaApiHomeDirRelPath = join('.qorus-vscode', QorusJavaApiDirName);

/** Return path to dir where Qorus Java API files should be saved for user. */
export function getQorusJavaApiTargetPath(): string {
    return join(homedir(), QorusJavaApiHomeDirRelPath);
}

/** Return path to extension dir from where Qorus Java API files are available. */
export function getQorusJavaApiExtPath(extensionPath: string): string {
    return join(extensionPath, QorusJavaApiDirName);
}

/** Compare Qorus Java API versions. */
function compareQorusJavaApiVersion(src_dir, target_dir): number {
    const src_ver_file = join(src_dir, QorusJavaApiVerFile);
    const target_ver_file = join(target_dir, QorusJavaApiVerFile);
    if (!existsSync(target_ver_file)) {
        return -1;
    }
    if (!existsSync(src_ver_file)) {
        msg.log('Qorus Java API version file in extension dir does not exist.');
        return 0;
    }
    try {
        // compare installed version to the one available from extension
        const cur_ver = readFileSync(target_ver_file, 'utf8');
        const src_ver = readFileSync(src_ver_file, 'utf8');
        return compareVersion(cur_ver, src_ver);
    } catch (err) {
        msg.log('Failed comparing versions of installed Qorus Java API and newest API in extension directory: ' + err);
        return 0;
    }
}

/** Remove installed Java API files. */
function removeInstalledQorusJavaApi(target_dir): boolean {
    try {
        removeSync(target_dir);
    } catch (err) {
        msg.log('Failed removing old Qorus Java API files: ' + err);
        return false;
    }
    return true;
}

/** Copy Qorus Java API files to target dir. */
function copyQorusJavaApi(src_dir, target_dir): boolean {
    try {
        copySync(src_dir, target_dir, {preserveTimestamps: true});
    } catch (err) {
        msg.log('Failed copying Qorus Java API sources: ' + err);
        return false;
    }
    return true;
}

/** Install Qorus Java API sources into a dot-folder in user's home directory. */
export function installQorusJavaApiSources(extensionPath: string): boolean {
    const target_dir = getQorusJavaApiTargetPath();
    const src_dir = getQorusJavaApiExtPath(extensionPath);

    // if target dir doesn't exist, simply copy the API files
    if (!existsSync(target_dir)) {
        return copyQorusJavaApi(src_dir, target_dir);
    }

    // compare newest version to installed one
    if (compareQorusJavaApiVersion(src_dir, target_dir) === -1) {
        // remove old installed API files
        if (!removeInstalledQorusJavaApi(target_dir)) {
            return false;
        }

        // update to the newest version
        return copyQorusJavaApi(src_dir, target_dir);
    }
    return true;
}
