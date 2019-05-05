import * as vscode from 'vscode';
import * as path from 'path';
import * as moment from 'moment';
import * as fs from 'fs';
import * as os from 'os';
import { projects, QorusProject } from './QorusProject';
import { QorusRepository } from './QorusRepository';
import { QorusRepositoryGit } from './QorusRepositoryGit';
import { deployer } from './QorusDeploy';
import * as msg from './qorus_message';
import { isDeployable } from './qorus_utils';
import { t } from 'ttag';
const copyFile = require('fs-copy-file');


class QorusRelease {
    private repository: QorusRepository = new QorusRepositoryGit();
    private project_folder: string | undefined = undefined;
    private source_directories: string[] = [];
    private files: string[] = [];
    private package_path = null;

    makeRelease(webview?: vscode.Webview) {
        const project: QorusProject | undefined = projects.getProject();
        if (!project || !project.configFileExists()) {
            msg.error(t`QorusProjectNotSet`);
            return;
        }

        this.project_folder = project.projectFolder();

        project.validateConfigFileAndDo(file_data => {
            this.source_directories = file_data.source_directories || [];

            this.repository.init(this.project_folder).then(
                () => {
                    this.getCurrentBranch(webview);
                },
                (error: string) => {
                    msg.error(error);
                }
            );
        });
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
        };

        this.files = [];
        this.source_directories.map(dir => getFiles(path.join(this.project_folder, dir)));
    }

    private createReleaseFile(webview?: vscode.Webview): any {
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
            fs.unlinkSync(path_tar);
            fs.unlinkSync(path_qrf);
            if (webview) {
                webview.postMessage({
                    action: 'release-package-created',
                    package_path: path_tarbz2
                });
            }
        });
        archiver.pipe(tar_output);

        this.files.map(file => archiver.file(path.join(this.project_folder, file), {name: file}));
        fs.writeFileSync(path_qrf, this.files.filter(isDeployable)
                                             .map(file => 'load ' + file + '\n')
                                             .join(''));
        archiver.file(path_qrf, {name: file_qrf});

        archiver.finalize();
    }

    private checkUpToDate(webview?: vscode.Webview) {
        const branch = this.repository.currentBranch();
        if (!branch.up_to_date) {
            if (webview) {
                webview.postMessage({
                    action: 'release-branch-not-up-to-date',
                    branch: branch
                });
            }
            return false;
        }
        return true;
    }

    getCurrentBranch(webview: vscode.Webview) {
        if (this.checkUpToDate(webview)) {
            webview.postMessage({
                action: 'release-return-branch',
                branch: this.repository.currentBranch()
            });
        }
    }

    getCommits(webview: vscode.Webview, filters: any) {
        webview.postMessage({
            action: 'release-return-commits',
            commits: this.repository.commits(filters.hash, filters.branch, filters.tag)
        });
    }

    getDiff(webview: vscode.Webview, commit: any) {
        this.repository.changedFiles(commit,
                                     this.project_folder,
                                     this.source_directories)
        .then(
            (files: string[]) => {
                this.files = files;
                webview.postMessage({action: 'release-return-diff', commit, files});
            }
        );
    }

    createPackage(webview: vscode.Webview, full: boolean = true) {
        if (this.checkUpToDate(webview)) {
            if (full) {
                this.setAllFiles();
            }
            this.createReleaseFile(webview);
        }
    }

    deployPackage(webview: vscode.Webview) {
        if (this.checkUpToDate(webview)) {
            deployer.deployPackage(this.package_path).then(result => {
                webview.postMessage({
                    action: 'release-deployment-result',
                    result: result
                });
            });
        }
    }

    getPackage(webview: vscode.Webview) {
        vscode.window.showOpenDialog({
            filters: {[t`QorusRelaseFilePicker`]: ['tar.bz2']}
        }).then(files => {
            if (!files || !files.length) {
                return;
            }
            this.package_path = files[0].fsPath;
            webview.postMessage({
                action: 'release-return-package',
                package_path: this.package_path
            });
        });
    }

    savePackage(webview: vscode.Webview) {
        vscode.window.showSaveDialog({
            filters: {[t`QorusRelaseFilePicker`]: ['tar.bz2']},
            defaultUri: vscode.Uri.file(path.join(os.homedir(), path.basename(this.package_path)))
        }).then(file => {
            copyFile(this.package_path, file.fsPath, error => {
                if (error) {
                    msg.error(t`ReleaseFileSaveError ${error}`);
                    return;
                }
                webview.postMessage({
                    action: 'release-package-saved',
                    saved_path: file.fsPath
                });
            });
        });
    }
}

export const releaser = new QorusRelease();
