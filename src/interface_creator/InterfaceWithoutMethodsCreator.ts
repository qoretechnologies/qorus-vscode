import * as jsyaml from 'js-yaml';
import { size } from 'lodash';
import { t } from 'ttag';
import { window, workspace } from 'vscode';
import { qorus_webview } from '../QorusWebview';
import * as msg from '../qorus_message';
import { capitalize, hasConfigItems, toValidIdentifier } from '../qorus_utils';
import { ClassConnectionsCreate } from './ClassConnectionsCreate';
import { ClassConnectionsEdit } from './ClassConnectionsEdit';
import { classImports, classTemplate, simple_method_template } from './common_constants';
import { InterfaceCreator } from './InterfaceCreator';
import { jobImports } from './job_constants';
import { stepImports, stepTypeHeaders } from './step_constants';
import { workflowImports } from './workflow_constants';

class InterfaceWithoutMethodsCreator extends InterfaceCreator {
  editImpl = (params) => {
    const {
      data,
      orig_data,
      edit_type,
      iface_id,
      iface_kind,
      open_file_on_success,
      no_data_return,
      request_id,
      recreate,
    } = params;

    let imports: string[] = [];
    let suffix: string;
    this.has_code = false;
    switch (iface_kind) {
      case 'job':
        imports = jobImports(this.lang, data['base-class-name']);
        this.has_code = true;
        suffix = '.qjob';
        break;
      case 'step':
        imports = stepImports(this.lang, data['base-class-name']);
        this.has_code = true;
        suffix = '.qstep';
        break;
      case 'workflow':
        if (data['class-name']) {
          imports = workflowImports(this.lang, data['base-class-name']);
          this.has_code = true;
        }
        suffix = '.qwf';
        break;
      case 'class':
        imports = classImports(this.lang, data['base-class-name']);
        data.name = data['class-name'] = toValidIdentifier(data['class-class-name'], true);
        this.has_code = true;
        suffix = '.qclass';
        break;
      case 'mapper':
      case 'type':
      case 'fsm':
      case 'group':
      case 'event':
      case 'queue':
      case 'errors':
        suffix = `.q${iface_kind}`;
        break;
      case 'pipeline':
        suffix = `.qpipe`;
        break;
      case 'connection':
        suffix = `.qconn`;
        break;
      case 'value-map':
        suffix = `.qvmap`;
        break;
      default:
        msg.log(t`InvalidIfaceKind ${iface_kind} ${'InterfaceWithoutMethodsCreator'}`);
        return;
    }

    this.had_code = iface_kind === 'workflow' ? !!orig_data?.['class-name'] : this.has_code;

    this.setPaths(data, orig_data, suffix, iface_kind, recreate, iface_id, edit_type);

    let { ok, message } = this.checkData(params);

    if (!ok) {
      qorus_webview.postMessage({
        action: `creator-${edit_type}-interface-complete`,
        request_id,
        ok,
        message,
      });
      return;
    }

    let triggers: string[] = [];
    let connections_within_class: string = '';
    let connections_extra_class: string = '';
    let more_imports: string[] = [];
    if (Object.keys(data['class-connections'] || {}).length) {
      InterfaceWithoutMethodsCreator.fixClassConnections(data);
      ({
        connections_within_class,
        connections_extra_class,
        triggers,
        imports: more_imports = [],
      } = new ClassConnectionsCreate({ ...data, iface_kind }, this.code_info, this.lang).code());
    } else if (
      this.has_code &&
      this.lang == 'java' &&
      !!data['class-name'] &&
      !!data['base-class-name']
    ) {
      // FIXME: need to check if the base class is or inherits a Qore or Python class, we only need to generate
      // the constructor with the Throwable declaration if so
      // must add default constructor for subclasses
      connections_within_class =
        '    // constructor requires explicit exception declaration due to imported base Qorus class\n' +
        `    ${data['class-name']}() throws Throwable {\n` +
        '        super();\n' +
        '    }\n';
    }

    let methods = '';
    let template: string;
    let contents: string;
    let info: string;
    let code_lines: string[];
    switch (edit_type) {
      case 'create':
        if (!this.has_code) {
          info = t`FileCreatedInDir ${this.yaml_file_name} ${this.target_dir}`;
          break;
        }

        if (iface_kind === 'job' && !triggers.includes('run')) {
          methods = InterfaceCreator.fillTemplate(
            simple_method_template[this.lang],
            this.lang,
            undefined,
            { name: 'run' },
            false
          );
        } else if (iface_kind === 'step') {
          methods = InterfaceCreator.mandatoryStepMethodsCode(
            this.code_info,
            data['base-class-name'],
            this.lang,
            triggers
          );
        }

        if (methods && size(data['class-connections'])) {
          methods += '\n';
        }

        template = classTemplate(
          this.lang,
          !!data['base-class-name'],
          !methods && !connections_within_class
        );
        contents = InterfaceCreator.fillTemplate(
          template,
          this.lang,
          [...imports, ...more_imports],
          {
            class_name: data['class-name'],
            base_class_name: data['base-class-name'],
            methods,
            connections_within_class,
            connections_extra_class,
          }
        );

        info = t`2FilesCreatedInDir ${this.rel_file_path} ${this.yaml_file_name} ${this.target_dir}`;
        break;
      case 'edit':
        if (!this.has_code || !this.is_editable) {
          break;
        }

        if (this.had_code) {
          code_lines = this.file_edit_info.text_lines;
          code_lines = this.renameClassAndBaseClass(code_lines, orig_data, data);
          code_lines = this.updateImports(code_lines, [...imports, ...more_imports]);
          contents = code_lines.join('\n');
        } else {
          // has code now, but didn't have before this edit
          template = classTemplate(
            this.lang,
            !!data['base-class-name'],
            !methods && !connections_within_class
          );
          contents = InterfaceCreator.fillTemplate(
            template,
            this.lang,
            [...imports, ...more_imports],
            {
              class_name: data['class-name'],
              base_class_name: data['base-class-name'],
              methods,
              connections_within_class,
              connections_extra_class,
            }
          );
        }
        break;
      default:
        msg.error(t`UnknownEditType`);
        return;
    }

    let headers = this.createHeaders(
      {
        type: iface_kind,
        ...data,
        ...(iface_kind === 'step' && data['base-class-name']
          ? stepTypeHeaders(this.code_info.stepType(data['base-class-name']))
          : {}),
        code: this.rel_file_path?.replace(/\\/g, '/'),
      },
      iface_id,
      iface_kind
    );

    if (this.has_code) {
      if (edit_type === 'create' || this.is_editable) {
        ({ ok, message } = this.writeFiles(contents, headers));
      } else {
        ({ ok, message } = this.writeYamlFile(headers));
      }

      if (ok) {
        if (edit_type !== 'create' && this.is_editable) {
          new ClassConnectionsEdit().doChanges(
            this.file_path,
            this.code_info,
            data,
            orig_data,
            iface_kind,
            imports
          );
        }
        if (open_file_on_success) {
          workspace.openTextDocument(this.file_path).then((doc) => window.showTextDocument(doc));
        }
      }
    } else {
      ({ ok, message } = this.writeYamlFile(headers));
    }

    if (!ok) {
      qorus_webview.postMessage({
        action: `creator-${edit_type}-interface-complete`,
        request_id,
        ok: false,
        message,
      });
      return;
    }

    if (['create', 'edit'].includes(edit_type)) {
      const name = iface_kind === 'type' ? data.path : data.name;
      qorus_webview.postMessage({
        action: `creator-${edit_type}-interface-complete`,
        request_id,
        ok: true,
        message: t`IfaceSavedSuccessfully ${capitalize(iface_kind)} ${name}`,
      });
    }

    if (info) {
      msg.info(info);
    }

    this.deleteOrigFilesIfDifferent();
    if (hasConfigItems(iface_kind) || iface_kind === 'fsm' || iface_kind === 'pipeline') {
      this.code_info.interface_info.setOrigConfigItems({ iface_id }, edit_type === 'edit');
    }

    if (!no_data_return) {
      const headers_data: any = jsyaml.safeLoad(headers);
      this.returnData(
        {
          ...headers_data,
          target_dir: this.target_dir,
          target_file: this.has_code ? this.rel_file_path : this.yaml_file_name,
        },
        iface_id
      );
    }
  };
}

export const interface_without_methods_creator = new InterfaceWithoutMethodsCreator();
