import * as path from 'path';
import * as fs from 'fs';

export function isDeployable(file_path: string): boolean {
    return hasOneOfSuffixes(file_path, ['qfd', 'qwf', 'qsd', 'qjob', 'qclass', 'qconst', 'qconn',
                                        'qmapper', 'qvmap', 'qsm', 'qrf', 'qscript', 'java']);
};

export function canBeParsed(file_path: string): boolean {
    return hasOneOfSuffixes(file_path, ['qfd', 'qsd', 'qjob', 'qclass', 'qconst', 'qmapper', 'qvmap', 'java']);
};

const hasOneOfSuffixes = function(file_path: string, suffixes): boolean {
    const suffix: string | undefined = getSuffix(file_path);
    return suffix ? suffixes.includes(suffix) : false;
}

export function isTest(file_path: string): boolean {
    return getSuffix(file_path) === 'qtest';
};

export function isService(file_path: string): boolean {
    return getSuffix(file_path) === 'qsd';
};

export function isVersion3(version?: string): boolean {
    return !!version && version.toString().substr(0, 1) == '3';
};

export function getSuffix(file_path: string): string | undefined {
    return file_path.split('.').pop();
};

// returns all files in the directory and its subdirecories satisfying filter condition (if provided)
// filter: function accepting a filename as an argument and returning a boolean value
export function filesInDir(dir: string, filter?: Function): string[] {
    let files = [];
    filesInDirImpl(dir, files, filter);
    return files;
};

const filesInDirImpl = function(dir: string, files: string[], filter?: Function) {
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
