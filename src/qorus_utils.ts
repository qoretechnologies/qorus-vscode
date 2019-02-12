export function isDeployable(file_path: string): boolean {
    const deployable_suffixes = ['qfd', 'qwf', 'qsd', 'qjob', 'qclass', 'qconst', 'qconn',
                                 'qmapper', 'qvmap', 'qsm', 'qrf', 'qscript', 'java'];
    const suffix: string | undefined = getSuffix(file_path);
    return suffix ? deployable_suffixes.includes(suffix) : false;
}

export function isService(file_path: string): boolean {
    return getSuffix(file_path) === 'qsd';
}

export function isVersion3(version?: string): boolean {
    return !!version && version.toString().substr(0, 1) == '3';
}

const getSuffix = function(file_path: string): string | undefined {
    return file_path.split('.').pop();
};
