import * as vscode from 'vscode';
import * as path from 'path';
import * as moment from 'moment';
import * as fs from 'fs';
import { projects, QorusProject, source_dirs } from './QorusProject';
import { QorusRepository } from './QorusRepository';
import { QorusRepositoryGit } from './QorusRepositoryGit';
import { deployer } from './QorusDeploy';
import * as msg from './qorus_message';
import { isDeployable } from './qorus_utils';
import { t, gettext } from 'ttag';


class QorusRelease {
    private repository: QorusRepository = new QorusRepositoryGit();
    private project_folder: string | undefined = undefined;
    private release_panel: vscode.WebviewPanel | undefined = undefined;
    private files: string[] = [];
    private package_path = null;

    makeRelease(uri: vscode.Uri) {
        const project: QorusProject | undefined = projects.getQorusProject(uri);
        const project_exists: boolean = project ? project.exists() : false;
        if (!project_exists) {
            msg.error(t`QorusProjectNotSet`);
            return;
        }

        this.project_folder = project.projectFolder();
        if (!this.project_folder) {
            msg.error(t`UnableDetermineProjectFolder`);
            return;
        }

        this.repository.init(this.project_folder).then(
            () => {
                this.makeReleaseImpl();
            },
            (error: string) => {
                msg.log(error);
            }
        );
    }

    private makeReleaseImpl() {
        if(this.release_panel) {
            this.release_panel.reveal(vscode.ViewColumn.One);
            return;
        }

        this.openWizard();
    }

    private setAllFiles() {
        const getFiles = (dir: string) => {
            if (!fs.existsSync(dir)) {
                return;
            }

            const dir_entries: string[] = fs.readdirSync(dir);
            for (let entry of dir_entries) {
                const entry_path: string = path.join(dir, entry);
                if (fs.lstatSync(entry_path).isDirectory()) {
                    getFiles(entry_path);
                } else {
                    this.files.push(vscode.workspace.asRelativePath(entry_path, false));
                }
            }
        }

        this.files = [];
        source_dirs.map(dir => getFiles(path.join(this.project_folder, dir)));
    }

    private createReleaseFile(): any {
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const tmp_dir = require('os-tmpdir')();
        const project = path.basename(this.project_folder);

        const file_name_base = 'qorus-' + project + '-' + timestamp;

        const file_tar = file_name_base + '.tar';
        const file_tarbz2 = file_tar + '.bz2';
        const file_qrf = file_name_base + '.qrf';

        const [path_tar, path_tarbz2, path_qrf] =
            [file_tar, file_tarbz2, file_qrf].map(file => path.join(tmp_dir, file));

        this.package_path = path_tarbz2;

        const archiver = require('archiver')('tar');
        const tar_output = fs.createWriteStream(path_tar);
        tar_output.on('close', () => {
            const compressor = require('compressjs').Bzip2;
            const input = fs.readFileSync(path_tar);
            const compressed = compressor.compressFile(input);
            fs.writeFileSync(path_tarbz2, compressed);
            this.release_panel.webview.postMessage({
                action: 'package-created',
                package_path: path_tarbz2
            });
        });
        archiver.pipe(tar_output);

        this.files.map(file => archiver.file(path.join(this.project_folder, file), {name: file}));
        fs.writeFileSync(path_qrf, this.files.filter(isDeployable)
                                             .map(file => 'load ' + file + '\n')
                                             .join(''));
        archiver.file(path_qrf, {name: file_qrf});

        archiver.finalize();
    }

    private checkUpToDate() {
        const branch = this.repository.currentBranch();
        if (!branch.up_to_date) {
            this.release_panel.webview.postMessage({
                action: 'not-up-to-date',
                branch: branch
            });
            return false;
        }
        return true;
    }

    private openWizard() {
        const web_path = path.join(__dirname, '..', 'dist', 'qorus_release_package');
        vscode.workspace.openTextDocument(path.join(web_path, 'index.html')).then(
            doc => {
                this.release_panel = vscode.window.createWebviewPanel(
                    'qorusRelease',
                    t`QorusReleaseTitle`,
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true
                    }
                );
                this.release_panel.webview.html = doc.getText().replace(/{{ path }}/g, web_path);

                this.release_panel.onDidDispose(() => {
                    this.release_panel = undefined;
                });

                this.release_panel.webview.onDidReceiveMessage(message => {
                    switch (message.action) {
                        case 'get-data':
                            if (this.checkUpToDate()) {
                                this.release_panel.webview.postMessage({
                                    action: 'return-data',
                                    branch: this.repository.currentBranch()
                                });
                            }
                            break;
                        case 'get-commits':
                            this.release_panel.webview.postMessage({
                                action: 'return-commits',
                                commits: this.repository.commits(message.hash_filter,
                                                                 message.branch_filter,
                                                                 message.tag_filter)
                            });
                            break;
                        case 'get-diff':
                            this.repository.changedFiles(message.commit, this.project_folder).then(
                                (files: string[]) => {
                                    this.files = files;
                                    this.release_panel.webview.postMessage({
                                        action: 'return-diff',
                                        commit: message.commit,
                                        files: files
                                    });
                                }
                            );
                            break;
                        case 'get-text':
                            this.release_panel.webview.postMessage({
                                action: 'return-text',
                                text_id: message.text_id,
                                text: gettext(message.text_id)
                            });
                            break;
                        case 'create-full-package':
                            if (this.checkUpToDate()) {
                                this.setAllFiles();
                                this.createReleaseFile();
                            }
                            break;
                        case 'create-package':
                            if (this.checkUpToDate()) {
                                this.createReleaseFile();
                            }
                            break;
                        case 'deploy-package':
                            if (this.checkUpToDate()) {
                                deployer.deployPackage(this.package_path).then(result => {
                                    this.release_panel.webview.postMessage({
                                        action: 'deployment-result',
                                        result: result
                                    });
                                });
                            }
                            break;
                        case 'get-release-file':
                            vscode.window.showOpenDialog({
                                filters: {[t`QorusRelaseFilePicker`]: ['tar.bz2']}
                            }).then(files => {
                                if (!files || !files.length) {
                                    return;
                                }
                                this.package_path = files[0].fsPath;
                                this.release_panel.webview.postMessage({
                                    action: 'return-release-file',
                                    package_path: this.package_path
                                });
                            });
                            break;
                        case 'close':
                            this.release_panel.dispose();
                            break;
                    }
                });
            },
            error => {
                msg.error(t`UnableOpenReleasePage`);
                msg.log(JSON.stringify(error));
            }
        );
    }
}

export const releaser = new QorusRelease();
