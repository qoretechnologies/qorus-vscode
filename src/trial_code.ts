import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as msg from './qorus_message';

const parser_command = 'ast.q';

export const parse_code = (uri: vscode.Uri) => {
    const command = [parser_command, uri.fsPath].join(' ');
    msg.log('executing command  "' + command + '" ...');

    child_process.exec(command, {maxBuffer: 99999999}, (error, stdout, stderr) => {
        if (error) {
            msg.log(`ast error: ${error}`);
            if (stderr) {
                msg.log(`ast stderr: ${error}`);
            }
            return;
        }

        const result: any = JSON.parse(stdout.toString());
        msg.log('... result: ' + JSON.stringify(result, null, 4));
    });
}
