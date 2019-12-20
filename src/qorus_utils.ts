import * as path from 'path';
import * as fs from 'fs';
import { Uri } from 'vscode';

export const isDeployable = (file_path: string): boolean =>
    hasOneOfSuffixes(file_path, ['qfd', 'qwf', 'qsd', 'qjob', 'qclass', 'qconst', 'qconn', 'qstep',
                                 'qmapper', 'qvmap', 'qsm', 'qrf', 'qscript', 'java', 'yaml']);

export const canBeParsed = (file_path: string): boolean =>
    hasOneOfSuffixes(file_path, ['qfd', 'qsd', 'qjob', 'qclass', 'qconst', 'qmapper', 'qvmap', 'java']);

export const hasSuffix = (file_path: string, suffix: string): boolean => {
    return hasOneOfSuffixes(file_path, [suffix]);
};

const hasOneOfSuffixes = (file_path: string, suffixes: string[]): boolean => {
    const suffix: string | undefined = getSuffix(file_path);
    return suffix ? suffixes.includes(suffix) : false;
};

export const isTest = (file_path: string): boolean => getSuffix(file_path) === 'qtest';

export const isService = (file_path: string): boolean => getSuffix(file_path) === 'qsd';

export const canDefineInterfaceBaseClass = (file_path: string): boolean =>
    hasOneOfSuffixes(file_path, ['qfd', 'qclass', 'qstep']);

export const isVersion3 = (version?: string): boolean =>
    !!version && version.toString().substr(0, 1) == '3';

const getSuffix = (file_path: string): string | undefined => file_path.split('.').pop();

export const suffixToIfaceKind = (suffix: string): string | undefined => {
    switch (suffix.split('.').pop()) {
        case 'qsd':
            return 'service';
        case 'qjob':
            return 'job';
        case 'qwf':
            return 'workflow';
        case 'qstep':
            return 'step';
        case 'qmc':
            return 'mapper-code';
        case 'qclass':
            return 'class';
        default:
            return undefined;
    }
};

export const hasConfigItems = iface_kind => ['job', 'service', 'class', 'step'].includes(iface_kind);

// returns all files in the directory and its subdirecories satisfying filter condition (if provided)
// filter: function accepting a filename as an argument and returning a boolean value
export const filesInDir = (dir: string, filter?: Function): string[]  => {
    let files = [];
    filesInDirImpl(dir, files, filter);
    return files;
};

const filesInDirImpl = (dir: string, files: string[], filter?: Function) => {
    const dir_entries: string[] = fs.readdirSync(dir);
    for (let entry of dir_entries) {
        const entry_path: string = path.join(dir, entry);
        if (fs.lstatSync(entry_path).isDirectory()) {
            filesInDirImpl(entry_path, files, filter);
        } else if (!filter || filter(entry_path)) {
            files.push(entry_path);
        }
    }
};

export const quotesIfNum = (value: any): string =>
    parseFloat(value) == value ? `"${value}"` : value;

export const dash2Camel = str => {
    let parts = str.split('-');
    const first = parts.splice(0, 1);
    parts = parts.map(part => part[0].toUpperCase() + part.substr(1));
    return [first, ...parts].join('');
}

export const dash2Pascal = str =>
    str.split('-').map(part => part[0].toUpperCase() + part.substr(1)).join('');

export const makeFileUri = (filePath: string) => 'file://' + filePath;

export const getFilePathFromUri = (uri: string | Uri) => typeof uri === 'string' ? uri.slice(7) : uri.fsPath;
