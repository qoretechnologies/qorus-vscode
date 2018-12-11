import { window } from 'vscode';
import { t } from 'ttag';


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

export function requestError(error_data: any, default_error: string) {
    let url: string = error_data.options ? error_data.options.uri || '' : '';

    const params_pos = url.indexOf('?');
    if (params_pos > -1) {
        url = url.substr(0, params_pos);
    }

    if (error_data.statusCode == 401) {
        error(t`error401 ${url}`);
    }
    else if (error_data.message && error_data.message.indexOf('EHOSTUNREACH') > -1) {
        error(t`hostUnreachable ${url}`);
    }
    else if (error_data.message && error_data.message.indexOf('ETIMEDOUT') > -1) {
        error(t`gettingInfoTimedOut ${url}`);
    }
    else if (error_data.message && error_data.message.indexOf('ECONNREFUSED') > -1) {
        error(t`connectionRefused ${url}`);
    }
    else {
        error(`${default_error} (${url})`);
        log(JSON.stringify(error_data));
    }
}
