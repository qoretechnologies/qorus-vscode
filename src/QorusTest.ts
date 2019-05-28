import * as vscode from 'vscode';
import * as fs from 'fs';
import { qorus_request, QorusRequestTexts } from './QorusRequest';
import { QorusLogin } from './QorusLogin';
import * as msg from './qorus_message';
import { t } from 'ttag';
import { filesInDir, isTest, isVersion3 } from './qorus_utils';


class QorusTest extends QorusLogin {

    testCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        const file_path = editor ? editor.document.fileName : '';
        const code = editor ? editor.document.getText() : '';

        if (!file_path || !code) {
            msg.error(t`NothingToTest`);
            return;
        }

        const file_relative_path = vscode.workspace.asRelativePath(file_path, false);

        if (!isTest(file_path)) {
            msg.error(t`NotExecutableFile ${file_relative_path}`);
            return;
        }

        if (file_path === file_relative_path) {
            msg.error(t`CannotLoadFileOutsideWorkspaceFolder ${file_path}`);
            return;
        }

        this.doTest([file_path]);
    }

    testFile(uri: vscode.Uri) {
        const file_path: string = uri.fsPath;
        if (!isTest(file_path)) {
            msg.error(t`NotExecutableFile ${vscode.workspace.asRelativePath(file_path, false)}`);
            return;
        }

        this.doTest([file_path]);
    }

    testDir(uri: vscode.Uri) {
        const dir: string = uri.fsPath;
        msg.log(t`TestingDirectory ${vscode.workspace.asRelativePath(dir, false)}`);

        const files: string[] = filesInDir(dir);
        if (!files.some(isTest)) {
            msg.error(t`NoExecutableFilesInDir ${vscode.workspace.asRelativePath(dir, false)}`);
            return;
        }
        this.doTest(files);
    }

    // returns true if the process got to the stage of checking the result
    // returns false if the process failed earlier
    private doTest(file_paths: string[]): Thenable<boolean> {
        const {ok, active_instance, token} = qorus_request.activeQorusInstanceAndToken();
        if (!ok) {
            return Promise.resolve(false);
        }

        if (isVersion3(active_instance.version)) {
            msg.error(t`TestNotSupportedForQorus3`);
            return Promise.resolve(false);
        }

        const url: string = active_instance.url + '/api/latest/development/test';

        msg.log(t`FilesToTest`);
        let data: object[] = [];
        QorusTest.prepareData(file_paths, data);

        msg.log(t`TestHasStarted ${active_instance.name} ${active_instance.url}`);
        msg.log(t`options` + ': ' + JSON.stringify(vscode.workspace.getConfiguration('qorusTest')));

        const options = {
            method: 'POST',
            uri: `${url}`,
            strictSSL: false,
            body: {
                files: data,
                options: vscode.workspace.getConfiguration('qorusTest'),
            },
            headers: {
                'qorus-token': token
            },
            json: true
        };

        const texts: QorusRequestTexts = {
            error: t`TestStartFailed`,
            running: t`TestRunning`,
            cancelling: t`CancellingTest`,
            cancellation_failed: t`TestCancellationFailed`,
            checking_progress: t`checkingTestProgress`,
            finished_successfully: t`TestFinishedSuccessfully`,
            cancelled: t`TestCancelled`,
            failed: t`TestFailed`,
            checking_status_failed: t`CheckingTestStatusFailed`,
        };

        return qorus_request.doRequestAndCheckResult(options, texts);
    }

    private static prepareData(files: string[], data: object[]) {
        for (let file_path of files) {
            const file_relative_path = vscode.workspace.asRelativePath(file_path, false);

            if (isTest(file_relative_path)) {
                msg.log(`    ${file_relative_path}`);
            }

            if (!fs.existsSync(file_path)) {
                msg.error(`fileDoesNotExist ${file_path}`);
                return;
            }
            const file_content = fs.readFileSync(file_path);
            const buffer: Buffer = Buffer.from(file_content);
            var file = {
                'file_name': file_relative_path.replace(/\\/g, '/'),
                'file_content': buffer.toString('base64')
            };

            if (isTest(file_path)) {
                // TODO: file += {args: {}}
            }
            data.push(file);
        }
    }
}

export const tester = new QorusTest();
