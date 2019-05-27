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
        if (!value) {
            continue;
        }

        const tag = key.replace(/_/g, '-');

        if (Array.isArray(value)) {
            let names: string[] = [];
            switch (key) {
                case 'groups':
                    for (let group of value) {
                        names.push(group.name);
                        result += `${comment} define-group: ${group.name}: ${group.desc}\n`;
                    }
                    result += `${comment} groups: ${names.join(', ')}\n`;
                    break;
                case 'author':
                case 'serviceauthor':
                    for (let item of value) {
                        result += `${comment} ${tag}: ${item}\n`;
                    }
                    break;
                default:
                    result += `${comment} ${tag}: ${value.join(', ')}\n`;
            }
        }
        else {
            switch (key) {
                case 'define_auth_label':
                    result += `${comment} ${tag}: ${value.label}=${value.value}`;
                    break;
                case 'TAG':
                    result += `${comment} ${tag}: ${value.key}: ${value.value}`;
                    break;
                default:
                    result += `${comment} ${tag}: ${value}`;
            }
            result += '\n';
        }
    }

    return result;
}
