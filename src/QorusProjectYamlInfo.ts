import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import * as path from 'path';
import { t } from 'ttag';
import {
  default_lang,
  default_version,
  lang_inheritance,
  root_job,
  root_processor,
  root_service,
  root_steps,
  root_workflow,
  supported_langs,
  types,
  types_with_version,
} from './qorus_constants';
import * as msg from './qorus_message';

export class QorusProjectYamlInfo {
  public yaml_data: any = {};

  private src_2_yaml: any = {};
  yamlDataBySrcFile = (file) => this.yaml_data[this.src_2_yaml[file]];
  yamlDataByYamlFile = (file) => this.yaml_data[file];
  yamlDataByFile = (file) =>
    path.extname(file) === '.yaml' ? this.yaml_data[file] : this.yaml_data[this.src_2_yaml[file]];

  private name_2_yaml: any = {};
  private class_2_yaml: any = {};
  yamlDataByName = (type, name) => this.yaml_data[this.name_2_yaml[type][name]];
  yamlDataByClass = (type, class_name) => this.yaml_data[this.class_2_yaml[type][class_name]];

  /**
   * For each type, we create a dictionary of the names of the yaml files that are of that type.
   */
  yamlDataByType = (type) => {
    const ret_val = {};
    for (const name in this.name_2_yaml[type] || {}) {
      ret_val[name] = this.yamlDataByName(type, name);
    }
    return ret_val;
  };

  private yaml_2_src: any = {};

  private authors: any = {};
  getAuthors = () => Object.keys(this.authors).map((name) => ({ name }));
  /*
    private config_items: any = {};
    getConfigItem = ({name, prefix = ''}) => this.config_items[name]?.[prefix];
*/
  private inheritance_pairs: any = {};

  private service_classes: any = {};
  private job_classes: any = {};
  private workflow_classes: any = {};
  private processor_classes: any = {};
  private step_classes: any = {};

  serviceClasses = (lang = default_lang) => {
    let ret_val = {};
    for (const supported_lang of supported_langs) {
      if (lang_inheritance[lang].includes(supported_lang)) {
        ret_val = { ...ret_val, ...this.service_classes[supported_lang] };
      }
    }
    return ret_val;
  };

  jobClasses = (lang = default_lang) => {
    let ret_val = {};
    for (const supported_lang of supported_langs) {
      if (lang_inheritance[lang].includes(supported_lang)) {
        ret_val = { ...ret_val, ...this.job_classes[supported_lang] };
      }
    }
    return ret_val;
  };

  workflowClasses = (lang = default_lang) => {
    let ret_val = {};
    for (const supported_lang of supported_langs) {
      if (lang_inheritance[lang].includes(supported_lang)) {
        ret_val = { ...ret_val, ...this.workflow_classes[supported_lang] };
      }
    }
    return ret_val;
  };

  processorClasses = (lang = default_lang) => {
    let ret_val = {};
    for (const supported_lang of supported_langs) {
      if (lang_inheritance[lang].includes(supported_lang)) {
        ret_val = { ...ret_val, ...this.processor_classes[supported_lang] };
      }
    }
    return ret_val;
  };

  stepClasses = (step_type, lang = default_lang) => {
    let ret_val = {};
    for (const supported_lang of supported_langs) {
      if (lang_inheritance[lang].includes(supported_lang)) {
        ret_val = { ...ret_val, ...this.step_classes[supported_lang][step_type] };
      }
    }
    return ret_val;
  };

  allStepClasses = (lang) => {
    let ret_val = {};
    for (const supported_lang of supported_langs) {
      if (lang_inheritance[lang].includes(supported_lang)) {
        for (const step_type of root_steps) {
          ret_val = { ...ret_val, ...this.step_classes[supported_lang][step_type] };
        }
      }
    }
    return ret_val;
  };

  getValue = (file, key) => this.yaml_data[file]?.[key];
  getSrcFile = (yaml_file) => this.yaml_2_src[yaml_file];

  initData = () => {
    this.yaml_data = {};

    this.yaml_2_src = {};
    this.src_2_yaml = {};
    this.authors = {};

    types.forEach((type) => {
      this.name_2_yaml[type] = {};
      this.class_2_yaml[type] = {};
    });

    this.inheritance_pairs = {};
    supported_langs.forEach((lang) => {
      this.inheritance_pairs[lang] = {};

      this.job_classes[lang] = { [root_job]: true };
      this.service_classes[lang] = { [root_service]: true };
      this.workflow_classes[lang] = { [root_workflow]: true };
      this.processor_classes[lang] = { [root_processor]: true };

      this.step_classes[lang] = {};
      root_steps.forEach((step_type) => {
        this.step_classes[lang][step_type] = { [step_type]: true };
      });
    });
  };

  addSingleYamlInfo(file: string) {
    let data: any;
    let file_contents;
    try {
      file_contents = fs.readFileSync(file);
      data = jsyaml.safeLoad(file_contents);
    } catch (error) {
      msg.debug({ file, error });
      return;
    }

    if (!types.includes(data?.type)) {
      return;
    }

    // possibly fix old classes with both name and class-name
    if (
      ['class', 'mapper-code'].includes(data.type) &&
      data['class-name'] &&
      data.name !== data['class-name']
    ) {
      data.name = data['class-name'];
      delete data['class-name'];

      const lines = file_contents.toString().split(/\r?\n/);
      const fixed_lines = [];
      lines.forEach((line) => {
        if (line.substr(0, 5) === 'name:') {
          return;
        }
        if (line.substr(0, 11) === 'class-name:') {
          fixed_lines.push(line.substr(6));
        } else {
          fixed_lines.push(line);
        }
      });

      while (/^\s*$/.test(fixed_lines.slice(-1)[0])) {
        fixed_lines.pop();
      }

      fs.writeFile(file, fixed_lines.join('\n') + '\n', (err) => {
        if (err) {
          msg.error(t`WriteFileError ${file} ${err.toString()}`);
        }
      });

      this.addSingleYamlInfo(file);
      return;
    }

    const yaml_data = {
      ...data,
      yaml_file: file,
      target_dir: path.dirname(file),
    };
    yaml_data.target_file = yaml_data.code;

    this.yaml_data[file] = yaml_data;

    if (yaml_data.code) {
      const src = path.join(path.dirname(file), yaml_data.code);
      this.src_2_yaml[src] = file;
      this.yaml_2_src[file] = src;
    }

    (yaml_data.author || []).forEach((name) => {
      this.authors[name] = true;
    });

    const name = types_with_version.includes(yaml_data.type)
      ? `${yaml_data.name}:${yaml_data.version || default_version}`
      : yaml_data.type === 'type'
      ? yaml_data.path
      : yaml_data.name;

    if (!name) {
      return;
    }

    this.name_2_yaml[yaml_data.type][name] = file;

    const class_name = ['class', 'mapper-code'].includes(yaml_data.type)
      ? yaml_data.name
      : yaml_data['class-name'];

    if (class_name) {
      this.class_2_yaml[yaml_data.type][class_name] = file;
    }

    const base_class_name = yaml_data['base-class-name'];

    // if (class_name && base_class_name && ['class', 'step'].includes(yaml_data.type)) {
    if (class_name && base_class_name && yaml_data.type === 'class') {
      this.inheritance_pairs[yaml_data.lang || default_lang][class_name] = [base_class_name];
    }
    /*
        (yaml_data['config-items'] || []).forEach(item => {
            if (item.parent || !item.name) {
                return;
            }

            if (!this.config_items[item.name]) {
                this.config_items[item.name] = {};
            }

            const existing_item = this.getConfigItem(item);
            if (existing_item &&
                (existing_item.iface_type !== yaml_data.type ||
                 existing_item.iface_name !== yaml_data.name))
            {
                msg.error(t`DuplicateConfigItemName ${existing_item.name} ${existing_item.prefix || ''} ${existing_item.iface_type} ${existing_item.iface_name} ${yaml_data.type} ${yaml_data.name}`);
            }

            this.config_items[item.name][item.prefix || ''] = {
                ...item,
                iface_type: yaml_data.type,
                iface_name: yaml_data.name,
            };
        });
*/
  }

  private baseClasses = (base_classes: any, inheritance_pairs: any): any => {
    let any_new = true;
    while (any_new) {
      any_new = false;
      for (const name in inheritance_pairs) {
        if (inheritance_pairs[name].some((base_class_name) => base_classes[base_class_name])) {
          base_classes[name] = true;
          delete inheritance_pairs[name];
          any_new = true;
          break;
        }
      }
    }
    return base_classes;
  };

  isDescendantOrSelf = (
    class_name: string,
    possible_descendant_class_name: string,
    lang: string
  ): boolean => {
    const descendants_and_self = { [class_name]: true };
    this.baseClasses(descendants_and_self, { ...this.inheritance_pairs[lang] });
    return Object.keys(descendants_and_self).includes(possible_descendant_class_name);
  };

  baseClassesFromInheritancePairs() {
    supported_langs.forEach((lang) => {
      this.baseClasses(this.service_classes[lang], { ...this.inheritance_pairs[lang] });
      this.baseClasses(this.job_classes[lang], { ...this.inheritance_pairs[lang] });
      this.baseClasses(this.workflow_classes[lang], { ...this.inheritance_pairs[lang] });
      this.baseClasses(this.processor_classes[lang], { ...this.inheritance_pairs[lang] });

      root_steps.forEach((step_type) => {
        this.step_classes[lang][step_type] = this.baseClasses(this.step_classes[lang][step_type], {
          ...this.inheritance_pairs[lang],
        });
      });
    });
  }
}
