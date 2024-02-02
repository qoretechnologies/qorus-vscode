import * as archiver from 'archiver';
import * as fs from 'fs';
import { forEach, size, some, uniq } from 'lodash';
import * as moment from 'moment';
import * as os from 'os';
import * as tmp_dir from 'os-tmpdir';
import * as path from 'path';
import { t } from 'ttag';
import * as vscode from 'vscode';
import * as zlib from 'zlib';
import { deployer } from './QorusDeploy';
import { QorusProject, projects } from './QorusProject';
import { QorusRepository } from './QorusRepository';
import { QorusRepositoryGit } from './QorusRepositoryGit';
import { qorus_webview } from './QorusWebview';
import { InterfaceCreator } from './interface_creator/InterfaceCreator';
import * as msg from './qorus_message';
import { filesInDir, isDeployable } from './qorus_utils';

export const getSchemaFile = (value: string, target_dir: string): string => {
  // Get the schema file path
  const schemaFilePath = path.resolve(target_dir, value);
  // Get the schema file relative path
  return vscode.workspace.asRelativePath(schemaFilePath, false);
};

export const hasFileAsStringOption = (options: Record<string, any>): boolean => {
  return some(options, (option) => option.type === 'file-as-string');
};

class QorusRelease {
  private repository: QorusRepository = new QorusRepositoryGit();
  private project_folder: string | undefined = undefined;
  private source_directories: string[] = [];
  private files: string[] = [];
  private package_path = null;

  get filesToRelease() {
    return this.files;
  }

  set filesToRelease(files: string[]) {
    this.files = files;
  }

  makeRelease() {
    const project: QorusProject | undefined = projects.getProject();
    if (!project?.configFileExists()) {
      msg.error(t`QorusProjectNotSet`);
      return;
    }

    this.project_folder = project.folder;

    project.validateConfigFileAndDo((file_data) => {
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
    for (const dir of this.source_directories) {
      const full_dir = path.join(this.project_folder, dir);
      if (!fs.existsSync(full_dir)) {
        continue;
      }
      for (const file of filesInDir(full_dir)) {
        this.files.push(vscode.workspace.asRelativePath(file, false));
      }
    }
  }

  private getFilesMetadataFile(file: string): string {
    // If the file ends in a .py or .java, we need to remove the extension and add .yaml extension
    if (file.endsWith('.py') || file.endsWith('.java')) {
      return path.join(path.dirname(file), path.basename(file, path.extname(file)) + '.yaml');
    }

    return file + '.yaml';
  }

  private getRelatedFiles = (file: string): string[] => {
    const result = [];
    // Get the files extension
    const ext: string = path.extname(file);
    // Switch based on extension
    switch (ext) {
      case '.yaml': {
        // Build the absolute file path
        const filePath = path.join(this.project_folder, file);
        // Maybe get the file data
        const fileData = projects.currentProjectCodeInfo().yaml_info.yamlDataByYamlFile(filePath);
        // Check if this file is known to the extension
        if (fileData) {
          // Check if the file has a code file and if it part of the file hash
          if (fileData.code) {
            // Get the relative path of the file relative to the workspace folder
            result.push(
              vscode.workspace.asRelativePath(
                path.join(fileData.target_dir, fileData.target_file),
                false
              )
            );
          }
          if (fileData.type === 'connection' && hasFileAsStringOption(fileData.options)) {
            forEach(fileData.options, (option) => {
              if (option.type === 'file-as-string') {
                // Get the schema file relative path
                result.push(
                  getSchemaFile(
                    InterfaceCreator.getFileWithoutProtocol(option.value),
                    fileData.target_dir
                  )
                );
              }
            });
          }
          // If the file is a service
          if (fileData.type === 'service') {
            // Check if there is a api-manager schema
            if (fileData['api-manager']?.['provider-options']?.schema?.value) {
              // Get the schema file
              const schemaFile = fileData['api-manager']['provider-options'].schema.value;
              // Get the schema file relative path
              result.push(getSchemaFile(schemaFile, fileData.target_dir));
            }
            // Check if the service has any resource associated
            if (size(fileData.resources)) {
              // Add each resource to the result
              fileData.resources.forEach((resource) => {
                // Get the resource file path
                const resourceFilePath = path.resolve(fileData.target_dir, resource);
                // Get the resource file relative path
                result.push(vscode.workspace.asRelativePath(resourceFilePath, false));
              });
            }
          }
        }
        break;
      }
      case '.java':
      case '.py':
      case '.qclass':
      case '.qstep':
      case '.qwf':
      case '.qsd':
      case '.qjob': {
        // Try to get the pair file
        const pairFile: string | undefined = projects
          .currentProjectCodeInfo()
          .pairFile(path.join(this.project_folder, file));

        if (pairFile) {
          result.push(vscode.workspace.asRelativePath(pairFile));
        }
        break;
      }
    }

    return result;
  };

  private createReleaseFile(): any {
    const project = path.basename(this.project_folder);
    const tempDir = tmp_dir();

    // create temporary directory structure for archive
    const path_tmp_root: string = fs.mkdtempSync(
      path.join(tempDir, 'release-'),
      (err, directory) => {
        if (err) throw err;
      }
    );
    const path_tmp_rel = path.join(path_tmp_root, project);
    // create a subdirectory under this folder
    fs.mkdirSync(path_tmp_rel, { recursive: true });

    const files = uniq(
      this.files.reduce((newFiles, file) => {
        return [...newFiles, file, ...this.getRelatedFiles(file)];
      }, [])
    );

    // copy all files to the target folder
    files.forEach((file) => {
      this.copySourceToTarget(this.project_folder, file, path_tmp_rel);
    });

    const timestamp = moment().format('YYYYMMDDHHmmss');
    const file_name_base = 'qorus-' + project + '-' + timestamp;

    const file_tar = file_name_base + '.tar';
    const file_tarbz2 = file_tar + '.gz';
    const [path_tar, path_tarbz2] = [file_tar, file_tarbz2].map((file) => path.join(tempDir, file));

    const file_qrf = file_name_base + '.qrf';
    const install_sh = 'install.sh';

    this.package_path = path_tarbz2;

    const tar_output = fs.createWriteStream(path_tar);
    tar_output.on('close', () => {
      const input = fs.readFileSync(path_tar);

      zlib.gzip(input, (err, buffer) => {
        if (err) {
          throw err;
        }
        //const compressed = compressor.compressFile(input);
        fs.writeFileSync(path_tarbz2, buffer);
        fs.unlinkSync(path_tar);
        fs.rmSync(path_tmp_root, { recursive: true, force: true });
        qorus_webview.postMessage({
          action: 'release-package-created',
          package_path: path_tarbz2,
        });
      });
    });

    const tarArchiver = archiver('tar');
    tarArchiver.pipe(tar_output);

    // add install.sh file to archive
    tarArchiver.append('#!/bin/sh\noload ' + file_qrf, {
      name: path.join(project, install_sh),
      mode: 0o755,
    });
    tarArchiver.append(
      files
        .filter(isDeployable)
        .map((file) => 'load ' + file + '\n')
        .join('') + 'refresh-recursive\n',
      {
        name: path.join(project, file_qrf),
        mode: 0o644,
      }
    );
    tarArchiver.directory(path_tmp_root, '/', { name: project });
    tarArchiver.finalize();
  }

  private copySourceToTarget(source_dir: string, source: string, target: string) {
    const path_source = path.join(source_dir, source);
    const path_target = path.join(target, source);

    const path_target_dir = path.dirname(path_target);
    if (!fs.existsSync(path_target_dir)) {
      fs.mkdirSync(path_target_dir, { recursive: true }, (err) => {
        if (err) throw err;
      });
    }
    fs.copyFileSync(path_source, path_target, fs.constants.COPYFILE_FICLONE);
  }

  private checkUpToDate() {
    const branch = this.repository.currentBranch();

    // @ts-ignore
    if (!this.repository.repository) {
      qorus_webview.postMessage({
        action: 'release-no-repository',
      });
      return true;
    }
    if (!branch.up_to_date) {
      qorus_webview.postMessage({
        action: 'release-branch-not-up-to-date',
        branch: branch,
      });
      return false;
    }
    return true;
  }

  getCurrentBranch() {
    if (this.checkUpToDate()) {
      qorus_webview.postMessage({
        action: 'release-return-branch',
        branch: this.repository.currentBranch(),
      });
    }
  }

  async getCommits(filters: any) {
    qorus_webview.postMessage({
      action: 'release-return-commits',
      commits: await this.repository.commits(filters.hash, filters.branch, filters.tag),
    });
  }

  getDiff(commit: any) {
    this.repository
      .changedFiles(commit, this.project_folder, this.source_directories)
      .then((files: string[]) => {
        this.files = files;
        qorus_webview.postMessage({ action: 'release-return-diff', commit, files });
      });
  }

  createPackage(full = true) {
    if (this.checkUpToDate()) {
      if (full) {
        this.setAllFiles();
      }
      this.createReleaseFile();
    }
  }

  createCustomPackage(files) {
    this.files = files.map((file) => vscode.workspace.asRelativePath(file, false));
    this.createReleaseFile();
  }

  deployPackage() {
    deployer.deployPackage(this.package_path).then((result) => {
      qorus_webview.postMessage({
        action: 'release-deployment-result',
        result: result,
      });
    });
  }

  getPackage() {
    vscode.window
      .showOpenDialog({
        filters: { [t`QorusRelaseFilePicker`]: ['tar.*'] },
      })
      .then((files) => {
        if (!files || !files.length) {
          return;
        }
        this.package_path = files[0].fsPath;
        qorus_webview.postMessage({
          action: 'release-return-package',
          package_path: this.package_path,
        });
      });
  }

  savePackage() {
    vscode.window
      .showSaveDialog({
        filters: { [t`QorusRelaseFilePicker`]: ['tar.*'] },
        defaultUri: vscode.Uri.file(path.join(os.homedir(), path.basename(this.package_path))),
      })
      .then((file) => {
        fs.copyFile(this.package_path, file.fsPath, (error) => {
          if (error) {
            msg.error(t`ReleaseFileSaveError ${error}`);
            return;
          }
          qorus_webview.postMessage({
            action: 'release-package-saved',
            saved_path: file.fsPath,
          });
        });
      });
  }
}

export const releaser = new QorusRelease();
