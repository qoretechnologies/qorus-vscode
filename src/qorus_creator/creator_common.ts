export function fillTemplate(template, vars) {
    return new Function('return `' + template + '`;').call(vars);
}

export function createHeaders(data) {
    return `# name: ${data.name}`;
}
