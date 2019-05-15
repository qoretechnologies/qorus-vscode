export function fillTemplate(template: string, vars: any) {
    return new Function('return `' + template + '`;').call(vars);
}

export function createHeaders(headers: any): string {
    let result: string= '';

    for (let key in headers) {
        const value = headers[key];

        if (Array.isArray(value)) {
            let names: string[] = [];
            switch (key) {
                case 'groups':
                    for (let group of value) {
                        names.push(group.name);
                        result += `# define-group: ${group.name}: ${group.desc}\n`;
                    }
                    result += '# groups: ' + names.join(', ');
                    break;
                default:
                    result += `# ${key}: ` + value.join(', ');
                    break;
            }
        } else {
            result += `# ${key}: ${value}`;
        }

        result += '\n';
    }

    return result;
}
