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

export const default_parse_options = "\
%new-style\n\
%strict-args\n\
%require-types\n\
%enable-all-warnings\n\
";

export function createHeaders(headers: any, lang: string = 'qore', old_format: boolean = false): string {
    return old_format
        ? createHeadersOldFormat(headers, lang)
        : createHeadersYaml(headers)
};

function createHeadersYaml(headers: any): string {
    const list_indent = '  - ';
    const indent = '    ';
    let result: string = '';

    for (let key in headers) {
        const value = headers[key];
        if (!value) {
            continue;
        }

        const tag = key.replace(/_/g, '-');

        if (Array.isArray(value)) {
            switch (key) {
                case 'groups':
                    result += 'groups:\n';
                    for (let item of value) {
                        result += `${list_indent}${item.name}\n`;
                    }
                    break;
                case 'TAG':
                case 'tags':
                    result += 'tags:\n';
                    for (let item of value) {
                        result += `${indent}${item.key}: ${item.value}\n`;
                    }
                    break;
                case 'define_auth_label':
                    result += `${tag}:\n`;
                    for (let item of value) {
                        result += `${indent}${item.label}: ${item.value}\n`;
                    }
                    break;
                case 'classes':
                case 'constants':
                case 'functions':
                case 'vmaps':
                case 'mappers':
                    result += `${tag}:\n`;
                    for (let item of value) {
                        result += `${list_indent}${item.name}\n`;
                    }
                    break;
                case 'resource':
                case 'text_resource':
                case 'bin_resource':
                case 'template':
                    result += `${tag}:\n`;
                    for (let item of value) {
                        result += `${list_indent}${item}\n`;
                    }
                    break;
            }
        }
        else {
            switch (key) {
                case 'service':
                    result += `name: ${value}\n`;
                    break;
                case 'serviceversion':
                    result += `version: ${value}\n`;
                    break;
                case 'servicedesc':
                    result += `desc: ${value}\n`;
                    break;
                case 'serviceauthor':
                    result += `author: ${value}\n`;
                    break;
                default:
                    result += `${tag}: ${value}\n`;
            }
        }
    }

    return result;
};

function createHeadersOldFormat(headers: any, lang: string = 'qore'): string {
    let result: string = '';

    let comment: string = comment_chars[lang];

    for (let key in headers) {
        const value = headers[key];
        if (!value) {
            continue;
        }

        const tag = key.replace(/_/g, '-');

        if (Array.isArray(value)) {
            switch (key) {
                case 'groups':
                    let names: string[] = [];
                    for (let item of value) {
                        names.push(item.name);
                        result += `${comment} define-group: ${item.name}: ${item.desc}\n`;
                    }
                    result += `${comment} groups: ${names.join(', ')}\n`;
                    break;
                case 'define_auth_label':
                    for (let item of value) {
                        result += `${comment} ${tag}: ${item.label}=${item.value}\n`;
                    }
                    break;
                case 'TAG':
                    for (let item of value) {
                        result += `${comment} ${tag}: ${item.key}: ${item.value}\n`;
                    }
                    break;
                case 'author':
                case 'serviceauthor':
                case 'resource':
                case 'text_resource':
                case 'bin_resource':
                case 'template':
                    for (let item of value) {
                        result += `${comment} ${tag}: ${item}\n`;
                    }
                    break;
                case 'classes':
                case 'constants':
                case 'functions':
                case 'vmaps':
                case 'mappers':
                    result += `${comment} ${tag}: `;
                    let separator = '';
                    for (let item of value) {
                        result += `${separator}${item.name}`;
                        separator = ', ';
                    }
                    result += '\n';
                    break;
                default:
                    result += `${comment} ${tag}: ${value.join(', ')}\n`;
            }
        }
        else {
            switch (key) {
                default:
                    result += `${comment} ${tag}: ${value}`;
            }
            result += '\n';
        }
    }

    return result;
}
