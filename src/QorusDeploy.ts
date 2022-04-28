import * as fs from 'fs';
import * as glob from 'glob';
import { size } from 'lodash';
import * as path from 'path';
import { t } from 'ttag';
import * as urlJoin from 'url-join';
import * as vscode from 'vscode';
import { projects } from './QorusProject';
import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';
import { QorusRequestTexts, qorus_request } from './QorusRequest';
import * as msg from './qorus_message';
import { filesInDir, isDeployable, isVersion3, removeDuplicates } from './qorus_utils';

class QorusDeploy {
  private code_info: QorusProjectCodeInfo | undefined = undefined;
  public isRunning: boolean = false;

  private setCodeInfo = (paths: string[]): boolean => {
    if (!paths.length) {
      msg.error(t`NoFilesOrDirsSelected`);
      return false;
    }

    const folder0 = projects.getProjectFolder(paths[0]);
    if (!folder0) {
      msg.error(t`ProjectNotFound ${paths[0]}`);
      return false;
    }

    if (paths.some((file_or_dir) => projects.getProjectFolder(file_or_dir) !== folder0)) {
      msg.error(t`SelectedFilesAndDirsNotFromOneProject`);
      return false;
    }

    this.code_info = projects.projectCodeInfo(paths[0]);
    return true;
  };

  deployCurrentFile(with_dependencies: boolean) {
    const editor = vscode.window.activeTextEditor;
    const file_path = editor ? editor.document.fileName : '';
    const code = editor ? editor.document.getText() : '';

    if (!file_path || !code) {
      msg.error(t`NothingToDeploy`);
      return;
    }

    const file_relative_path = vscode.workspace.asRelativePath(file_path, false);

    if (!isDeployable(file_path)) {
      msg.error(t`NotDeployableFile ${file_relative_path}`);
      return;
    }

    if (file_path === file_relative_path) {
      msg.error(t`CannotLoadFileOutsideWorkspaceFolder ${file_path}`);
      return;
    }

    if (!this.setCodeInfo([file_path])) {
      return;
    }

    if (with_dependencies) {
      this.doDeploy(this.code_info.getFilesOfReferencedObjects([file_path]));
    } else {
      this.deployFileAndPairFile(file_path);
    }
  }

  deployFile(file_path: string, with_dependencies: boolean) {
    if (!isDeployable(file_path)) {
      msg.error(t`NotDeployableFile ${vscode.workspace.asRelativePath(file_path, false)}`);
      return;
    }

    if (!this.setCodeInfo([file_path])) {
      return;
    }

    if (with_dependencies) {
      this.doDeploy(this.code_info.getFilesOfReferencedObjects([file_path]));
    } else {
      this.deployFileAndPairFile(file_path);
    }
  }

  deployDir(dir: string, with_dependencies: boolean) {
    if (!this.setCodeInfo([dir])) {
      return;
    }

    msg.log(t`DeployingDirectory ${vscode.workspace.asRelativePath(dir, false)}`);

    const files: string[] = filesInDir(dir, isDeployable);
    if (with_dependencies) {
      this.doDeploy(this.code_info.getFilesOfReferencedObjects(files));
    } else {
      const pair_files: string[] = files
        .map((file) => this.code_info.pairFile(file))
        .filter((file) => !!file);
      this.doDeploy(removeDuplicates([...files, ...pair_files]));
    }
  }

  deployFilesAndDirs = (paths: string[], with_dependencies: boolean) => {
    if (!this.setCodeInfo(paths)) {
      return;
    }

    let files = [];
    paths.forEach((file_or_dir) => {
      if (fs.lstatSync(file_or_dir).isDirectory()) {
        files = [...files, ...filesInDir(file_or_dir, isDeployable)];
      } else {
        files.push(file_or_dir);
      }
    });

    const pair_files: string[] = files
      .map((file) => this.code_info.pairFile(file))
      .filter((file) => !!file);

    if (with_dependencies) {
      this.doDeploy(this.code_info.getFilesOfReferencedObjects(removeDuplicates(files)));
    } else {
      this.doDeploy(removeDuplicates([...files, ...pair_files]));
    }
  };

  // returns true if the process got to the stage of checking the result
  // returns false if the process failed earlier
  deployPackage(file: string): Thenable<boolean> {
    return this.doDeploy([file], true);
  }

  deployAllInterfaces() {
    const code_info: QorusProjectCodeInfo = this.code_info || projects.currentProjectCodeInfo();
    if (!code_info) {
      msg.error(t`QorusProjectNotSet`);
      return;
    }

    const ifaceKinds = [
      'connection',
      'error',
      'group',
      'event',
      'queue',
      'fsm',
      'pipeline',
      'value-map',
      'class',
      'mapper-code',
      'mapper',
      'step',
      'service',
      'job',
      'workflow',
    ];

    code_info.waitForPending(['yaml']).then(() => {
      for (const ifaceKind of ifaceKinds) {
        const interfaces = code_info.interfaceDataByType(ifaceKind);
        for (const iface of interfaces) {
          if (iface.data.yaml_file) {
            this.deployFile(iface.data.yaml_file, false);
          }
        }
      }
    });
  }

  private deployFileAndPairFile(file_path: string) {
    if (!this.setCodeInfo([file_path])) {
      return;
    }
    // Store other files
    let otherFiles = [this.code_info.pairFile(file_path)];
    // Get the data of the given file
    const fileData = this.code_info.yaml_info.yamlDataByFile(file_path);
    // Check if the file is a service & its an api manager
    if (fileData.type === 'service' && fileData['api-manager']) {
      // Add the schema to other files to be deployed
      otherFiles.push(
        path.resolve(
          fileData.target_dir,
          fileData['api-manager']?.['provider-options']?.schema?.value
        )
      );
    }

    otherFiles = otherFiles.filter((f) => f);

    if (size(otherFiles)) {
      this.doDeploy([file_path, ...otherFiles]);
    } else {
      this.doDeploy([file_path]);
    }
  }

  // returns true if the process got to the stage of checking the result
  // returns false if the process failed earlier
  private doDeploy(file_paths: string[], is_release: boolean = false): Thenable<boolean> {
    if (this.isRunning) {
      return Promise.resolve(false);
    }

    this.isRunning = true;

    const { ok, active_instance, token } = qorus_request.activeQorusInstanceAndToken();

    if (!ok) {
      this.isRunning = false;
      return Promise.resolve(false);
    }

    let url: string = active_instance.url;
    if (isVersion3(active_instance.version)) {
      if (is_release) {
        msg.error(t`PackageDeploymentNotSupportedForQorus3`);
        this.isRunning = false;
        return Promise.resolve(false);
      } else {
        url = urlJoin(url, 'deployment');
      }
    } else {
      url = urlJoin(url, 'api/latest/development', is_release ? 'release' : 'deploy');
    }

    msg.log(t`FilesToDeploy`);
    let data: object[] = [];
    if (is_release) {
      const file = file_paths[0];
      msg.log(`    ${file}`);
      const file_content = fs.readFileSync(file);
      const buffer: Buffer = Buffer.from(file_content);
      data = [
        {
          file_name: path.basename(file),
          file_content: buffer.toString('base64'),
        },
      ];
    } else {
      this.prepareData(file_paths, data);
    }

    msg.log(t`DeploymentHasStarted ${active_instance.name} ${active_instance.url}`);
    msg.log(
      t`options` + ': ' + JSON.stringify(vscode.workspace.getConfiguration('qorusDeployment'))
    );

    const options = {
      method: 'POST',
      uri: `${url}`,
      strictSSL: false,
      body: {
        files: data,
        options: vscode.workspace.getConfiguration('qorusDeployment'),
      },
      headers: {
        'qorus-token': token,
        'content-type': 'application/json;charset=utf-8',
      },
      json: true,
    };

    const texts: QorusRequestTexts = {
      error: t`DeploymentStartFailed`,
      running: t`DeploymentRunning`,
      cancelling: t`CancellingDeployment`,
      cancellation_failed: t`DeploymentCancellationFailed`,
      checking_progress: t`checkingDeploymentProgress`,
      finished_successfully: t`DeploymentFinishedSuccessfully`,
      cancelled: t`DeploymentCancelled`,
      failed: t`DeploymentFailed`,
      checking_status_failed: t`CheckingDeploymentStatusFailed`,
    };

    return qorus_request.doRequestAndCheckResult(options, texts, () => {
      this.isRunning = false;
    });
  }

  private prepareData(files: string[], data: object[]) {
    for (let file_path of files) {
      const file_relative_path = vscode.workspace.asRelativePath(file_path, false);
      msg.log(`    ${file_relative_path}`);

      if (!fs.existsSync(file_path)) {
        msg.error(`fileDoesNotExist ${file_path}`);
        return;
      }
      const file_content = fs.readFileSync(file_path);
      const buffer: Buffer = Buffer.from(file_content);
      data.push({
        file_name: file_relative_path.replace(/\\/g, '/'),
        file_content: buffer.toString('base64'),
      });

      if (file_path.endsWith('.qsd.yaml')) {
        const resources: string[] = this.getResources(file_path);
        this.prepareData(resources, data);
      }
    }
  }

  private getResources = (file_path: string): string[] => {
    let resources = this.code_info.yaml_info.yamlDataByYamlFile(file_path)?.resource || [];

    if (resources.length) {
      const dir_path = path.dirname(file_path);
      resources = resources.map((basename) => {
        let resourcePath = path.join(dir_path, basename);

        if (resourcePath.endsWith('/*')) {
          resourcePath = resourcePath.replace('/*', '/**/*');
        }

        return resourcePath;
      });
      const pattern: string = resources.length == 1 ? `${resources}` : `{${resources}}`;
      return glob.sync(pattern, { nodir: true });
    }

    return [];
  };
}

export const deployer = new QorusDeploy();
