import * as fs from 'fs';
import * as moment from 'moment';
import * as os from 'os';
import * as path from 'path';
import { t } from 'ttag';
import * as vscode from 'vscode';

import { deployer } from './QorusDeploy';
import { projects, QorusProject } from './QorusProject';
import { QorusRepository } from './QorusRepository';
import { QorusRepositoryGit } from './QorusRepositoryGit';
import { qorus_webview } from './QorusWebview';
import * as msg from './qorus_message';
import { filesInDir, isDeployable } from './qorus_utils';


class QorusRelease {
    private repository: QorusRepository = new QorusRepositoryGit();
    private project_folder: string | undefined = undefined;
    private source_directories: string[] = [];
    private files: string[] = [];
    private package_path = null;

    makeRelease() {
        const project: QorusProject | undefined = projects.getProject();
        if (!project?.configFileExists()) {
            msg.error(t`QorusProjectNotSet`);
            return;
        }

        this.project_folder = project.folder;

        project.validateConfigFileAndDo(file_data => {
            this.source_directories = file_data.source_directories || [];

            this.repository.init(this.project_folder).then(
                () => {
                    this.getCurrentBranch();
                },
                (error: string) => {
                    msg.error(error);
                }
            );
        });
    }

    private setAllFiles() {
        this.files = [];
        for (let dir of this.source_directories) {
            const full_dir = path.join(this.project_folder, dir);
            if (!fs.existsSync(full_dir)) {
                continue;
            }
            for (let file of filesInDir(full_dir)) {
                this.files.push(vscode.workspace.asRelativePath(file, false));
            }
        }
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
            fs.unlinkSync(path_tar);
            fs.unlinkSync(path_qrf);
            qorus_webview.postMessage({
                action: 'release-package-created',
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
            qorus_webview.postMessage({
                action: 'release-branch-not-up-to-date',
                branch: branch
            });
            return false;
        }
        return true;
    }

    getCurrentBranch() {
        if (this.checkUpToDate()) {
            qorus_webview.postMessage({
                action: 'release-return-branch',
                branch: this.repository.currentBranch()
            });
        }
    }

    getCommits(filters: any) {
        qorus_webview.postMessage({
            action: 'release-return-commits',
            commits: this.repository.commits(filters.hash, filters.branch, filters.tag)
        });
    }

    getDiff(commit: any) {
        this.repository.changedFiles(commit,
                                     this.project_folder,
                                     this.source_directories)
        .then(
            (files: string[]) => {
                this.files = files;
                qorus_webview.postMessage({action: 'release-return-diff', commit, files});
            }
        );
    }

    createPackage(full: boolean = true) {
        if (this.checkUpToDate()) {
            if (full) {
                this.setAllFiles();
            }
            this.createReleaseFile();
        }
    }

    deployPackage() {
        if (this.checkUpToDate()) {
            deployer.deployPackage(this.package_path).then(result => {
                qorus_webview.postMessage({
                    action: 'release-deployment-result',
                    result: result
                });
            });
        }
    }

    getPackage() {
        vscode.window.showOpenDialog({
            filters: {[t`QorusRelaseFilePicker`]: ['tar.bz2']}
        }).then(files => {
            if (!files || !files.length) {
                return;
            }
            this.package_path = files[0].fsPath;
            qorus_webview.postMessage({
                action: 'release-return-package',
                package_path: this.package_path
            });
        });
    }

    savePackage() {
        vscode.window.showSaveDialog({
            filters: {[t`QorusRelaseFilePicker`]: ['tar.bz2']},
            defaultUri: vscode.Uri.file(path.join(os.homedir(), path.basename(this.package_path)))
        }).then(file => {
            fs.copyFile(this.package_path, file.fsPath, error => {
                if (error) {
                    msg.error(t`ReleaseFileSaveError ${error}`);
                    return;
                }
                qorus_webview.postMessage({
                    action: 'release-package-saved',
                    saved_path: file.fsPath
                });
            });
        });
    }
}

export const releaser = new QorusRelease();
