import { window } from 'vscode';


export const output = window.createOutputChannel('Qorus Remote Development');

export function log(text: string, with_newline: boolean = true) {
    with_newline ? output.appendLine(text) : output.append(text);
}

export function info(text: string, log_too: boolean = true) {
    messageImpl(text, 'Information', log_too);
}

export function warning(text: string, log_too: boolean = true) {
    messageImpl(text, 'Warning', log_too);
}

export function error(text: string, log_too: boolean = true) {
    messageImpl(text, 'Error', log_too);
}

function messageImpl(text: string, kind: string, log_too: boolean) {
    window['show' + kind + 'Message'](text);
    if (log_too) {
        log(text);
    }
}
