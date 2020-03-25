import * as path from 'path';
import * as fs from 'fs';
import { Uri } from 'vscode';

export const isDeployable = (file_path: string): boolean =>
    hasOneOfSuffixes(file_path, ['qfd', 'qwf', 'qsd', 'qjob', 'qclass', 'qconst', 'qconn', 'qstep', 'qm',
                                 'qmapper', 'qvmap', 'qsm', 'qrf', 'qscript', 'java', 'yaml', 'qmc']);

export const expectsYamlFile = (file_path: string): boolean =>
    hasOneOfSuffixes(file_path, ['qfd', 'qwf', 'qsd', 'qjob', 'qclass', 'qstep', 'qmc', 'java']);

export const hasSuffix = (file_path: string, suffix: string): boolean => {
    return hasOneOfSuffixes(file_path, [suffix]);
};

const hasOneOfSuffixes = (file_path: string, suffixes: string[]): boolean => {
    const suffix: string | undefined = getSuffix(file_path);
    return suffix ? suffixes.includes(suffix) : false;
};

export const isTest = (file_path: string): boolean => {
    const suffix: string | undefined = getSuffix(file_path);

    if (suffix === 'qtest') {
        return true;
    }
    if (suffix === 'java') {
        return path.basename(file_path, '.java').endsWith('Test');
    }

    return false;
};

export const isService = (file_path: string): boolean => getSuffix(file_path) === 'qsd';

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

// returns all files in the directory and its subdirectories satisfying filter condition (if provided)
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

export const removeDuplicates = values => {
    let distinct_values = {};
    values.forEach(value => distinct_values[value] = true);
    return Object.keys(distinct_values);
};

export const dash2Camel = str => {
    let parts = str.split('-');
    const first = parts.splice(0, 1);
    parts = parts.map(part => (part[0] || '').toUpperCase() + part.substr(1));
    return [first, ...parts].join('');
};

export const dash2Pascal = str =>
    str.split('-').map(part => (part[0] || '').toUpperCase() + part.substr(1)).join('');

export const toValidIdentifier = (str, capitalize = false) => {
    str = str.trim().replace(/\W+/g, '-');
    str = capitalize ? dash2Pascal(str) : dash2Camel(str);
    return str.replace(/(^[0-9])/, '_' + '$1');
}

export const makeFileUri = (filePath: string) => 'file://' + filePath;

export const getFilePathFromUri = (uri: string | Uri) => typeof uri === 'string' ? uri.slice(7) : uri.fsPath;

export const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

export const capitalize = str => str[0].toUpperCase() + str.substr(1);

export const compareVersion = (v1, v2) => {
    if (typeof v1 !== 'string' || typeof v2 !== 'string') {
        return undefined;
    }
    v1 = v1.split('.');
    v2 = v2.split('.');
    const min_len = Math.min(v1.length, v2.length);
    for (let i = 0; i < min_len; ++ i) {
        v1[i] = parseInt(v1[i], 10);
        v2[i] = parseInt(v2[i], 10);
        if (v1[i] > v2[i]) {
            return 1;
        }
        if (v1[i] < v2[i]) {
            return -1;
        }
    }
    return v1.length === v2.length ? 0: (v1.length < v2.length ? -1 : 1);
}
