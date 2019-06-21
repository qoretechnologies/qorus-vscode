export const fillTemplate = (template: string, vars: any): Function => {
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

export const createHeaders = (headers: any): string => {
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
                case 'author':
                    result += `author: ${value.map(author => author.name).join(', ')}\n`;
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
                default:
                    result += `${tag}: ${value}\n`;
            }
        }
    }

    return result;
};
