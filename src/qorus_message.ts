import { window } from 'vscode';


export const output = window.createOutputChannel('Qorus Remote Development');

export const log = (text: string, with_newline: boolean = true) => {
    with_newline ? output.appendLine(text) : output.append(text);
};

export const info = (text: string, log_too: boolean = true) => {
    messageImpl(text, 'Information', log_too);
};

export const warning = (text: string, log_too: boolean = true) => {
    messageImpl(text, 'Warning', log_too);
};

export const error = (text: string, log_too: boolean = true) => {
    messageImpl(text, 'Error', log_too);
};

export const debug = (data: any) => {
    for (const key of Object.keys(data)) {
        log(key + ': ' + JSON.stringify(data[key], null, 4));
    }
};

const messageImpl = (text: string, kind: string, log_too: boolean) => {
    window['show' + kind + 'Message'](text);
    if (log_too) {
        log(text);
    }
}
