export function fillTemplate(template: string, vars: any) {
    return new Function('return `' + template + '`;').call(vars);
}

export const suffix = {
    java: '.java',
    qore: '',
};

export const comment_chars = {
    java: '//',
    qore: '#',
};

export function createHeaders(headers: any, lang: string = 'qore'): string {
    let result: string = '';

    let comment: string = comment_chars[lang];

    for (let key in headers) {
        const value = headers[key];
        const tag = key.replace(/_/g, '-');

        if (Array.isArray(value)) {
            let names: string[] = [];
            switch (key) {
                case 'groups':
                    for (let group of value) {
                        names.push(group.name);
                        result += `${comment} define-group: ${group.name}: ${group.desc}\n`;
                    }
                    result += `${comment} groups: ` + names.join(', ');
                    break;
                default:
                    result += `${comment} ${tag}: ` + value.join(', ');
                    break;
            }
        } else {
            result += `${comment} ${tag}: ${value}`;
        }

        result += '\n';
    }

    return result;
}
