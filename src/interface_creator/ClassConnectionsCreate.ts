import { QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { toValidIdentifier, capitalize } from '../qorus_utils';
import { triggers, stepTriggerSignatures } from './standard_methods';
import { default_lang } from '../qorus_constants';

// =================================================================

const CONN_CLASS = 'ClassConnections';
const CONN_BASE_CLASS = 'Observer';
const CONN_MEMBER = { qore: 'class_connections', python: 'class_connections', java: 'classConnections' };
const CONN_CLASS_MAP = { qore: 'class_map', python: 'class_map', java: 'classMap' };
export const CONN_CALL_METHOD = 'callClassWithPrefixMethod';
const CONN_MAPPER = 'mapper';
const CONN_DATA = 'params';

export const GENERATED_TEXT = {
    begin: 'GENERATED SECTION! DON\'T EDIT!',
    end: 'GENERATED SECTION END'
};

const GENERATED = {
    qore: {
        begin: `####### ${GENERATED_TEXT.begin} ########`,
        end: `############ ${GENERATED_TEXT.end} ############`
    },
    python: {
        begin: `####### ${GENERATED_TEXT.begin} ########`,
        end: `############ ${GENERATED_TEXT.end} ############`
    },
    java: {
        begin: `// ==== ${GENERATED_TEXT.begin} ==== //`,
        end: `// ======== ${GENERATED_TEXT.end} ========= //`
    }
};

const THROWS = 'throws Throwable'; // only java:

export const indent = ' '.repeat(4);
const indent1 = indent;
const indent2 = indent.repeat(2);
const indent3 = indent.repeat(3);

const isArray = trigger => trigger.signature.indexOf('array(') > -1;
const isValidation = trigger => trigger.signature.indexOf('validation(') > -1;
const hasReturn = trigger => trigger.is_nonstandard_service || isValidation(trigger) || isArray(trigger);

// =================================================================

export class ClassConnectionsCreate {
    private connections: any;
    private class_name: string;
    private base_class_name: string;
    private iface_kind: string;
    private code_info: QorusProjectCodeInfo;
    private lang: string;

    private triggers: any = {};
    private classes: any = {};
    private exists_qore_connector = false; // used only for java
    private qore_classes_in_python = {};

    constructor(data, code_info, lang = default_lang) {
        const {
            'class-connections': connections,
            iface_kind,
            'base-class-name': base_class_name,
            'class-name': class_name
        } = data;

        Object.assign(this, {connections, class_name, base_class_name, iface_kind, code_info, lang});
    }

    code = () => {
        const simpleMethodSignature = name => {
            switch (this.lang) {
                case 'qore': return `${name}()`;
                case 'python': return `${name}(self)`;
                case 'java': return `public void ${name}() ${THROWS}`;
            }
            return undefined;
        };

        this.triggers = {};

        switch (this.iface_kind) {
            case 'step':
                this.triggers = stepTriggerSignatures(this.code_info, this.base_class_name, this.lang);
                break;
            case 'job':
                triggers(this.code_info, {iface_kind: 'job'}).forEach(trigger => {
                    this.triggers[trigger] = { signature: simpleMethodSignature(trigger) };
                });
                break;
        }

        Object.keys(this.triggers).forEach(trigger => {
            this.triggers[trigger] = {...this.triggers[trigger], connections: []};
        });

        let event_based_connections = [];
        let method_codes = [];

        const serviceTrigger = trigger => {
            const is_standard = triggers(this.code_info, {iface_kind: 'service'}).includes(trigger);
            let signature: string;
            if (is_standard) {
                signature = simpleMethodSignature(trigger);
            } else {
                switch (this.lang) {
                    case 'qore':
                        signature = `auto ${trigger}(auto ${CONN_DATA})`;
                        break;
                    case 'python':
                        signature = `${trigger}(self, *${CONN_DATA})`;
                        break;
                    case 'java':
                        signature = `public Object ${trigger}(Object ${CONN_DATA}) ${THROWS}`;
                        break;
                }
            }

            return {
                signature,
                is_nonstandard_service: !is_standard,
                connections: []
            };
        };

        for (const connection in this.connections) {
            const connection_code_name = toValidIdentifier(connection);
            let connectors = [];
            for (let connector of this.connections[connection]) {
                if (connector.trigger) {
                    if (this.iface_kind === 'service' && !this.triggers[connector.trigger]) {
                        this.triggers[connector.trigger] = serviceTrigger(connector.trigger);
                    }
                    this.triggers[connector.trigger].connections.push(connection_code_name);
                }

                connector = { ...connector, ...this.code_info.getClassConnector(connector) };
                const {'class': connector_class, type, prefix = ''} = connector;
                const prefixed_class = prefix + connector_class;

                let class_lang = 'qore';
                if (this.lang !== 'qore') {
                    class_lang = this.code_info.yaml_info.yamlDataByName('class', connector_class)?.lang || default_lang;
                    this.exists_qore_connector = this.exists_qore_connector || (class_lang === 'qore');
                    if (class_lang === 'qore') {
                        this.qore_classes_in_python[connector_class] = true;;
                    }
                }
                this.classes[prefixed_class] = { connector_class, prefix, class_lang };

                if (type === 'event') {
                    event_based_connections.push({ connection_code_name, prefixed_class, method: connector.method });
                }

                connectors.push(connector);
            }
            method_codes.push(this[`methodCode${capitalize(this.lang)}`](connection_code_name, connectors));
        }

        let connections_within_class = this[`memberDeclAndInitAllCode${capitalize(this.lang)}`]();
        let trigger_code = '';

        if (Object.keys(this.triggers).length) {
            trigger_code = `\n${indent1}${GENERATED[this.lang].begin}\n` +
            Object.keys(this.triggers)
                  .map(trigger => (this[`triggerCode${capitalize(this.lang)}`])(this.triggers[trigger]))
                  .join('\n') +
            `${indent1}${GENERATED[this.lang].end}\n`;
        }

        connections_within_class += trigger_code;

        const connections_extra_class = `\n\n${GENERATED[this.lang].begin}\n` +
            this[`extraClassCode${capitalize(this.lang)}`](event_based_connections) + '\n' +
            method_codes.join('\n') +
            (this.lang === 'python' ? '' : '}\n') +
            `${GENERATED[this.lang].end}\n`;

        return {
            triggers: Object.keys(this.triggers),
            trigger_code,
            connections_within_class,
            connections_extra_class,
            imports: this[`getImports${capitalize(this.lang)}`]()
        };
    }

    private connClassName = () => `${CONN_CLASS}_${this.class_name}`;

    protected getImportsQore = () => [];

    protected getImportsPython = () =>
        Object.keys(this.qore_classes_in_python).map(qore_class => `from qore.__root__ import ${qore_class}`);

    protected getImportsJava = () => {
        let imports = [
            'import org.qore.jni.QoreObject;',
            'import java.util.Map;',
            'import org.qore.jni.Hash;',
            'import java.lang.reflect.Method;'
        ];

        if (this.exists_qore_connector) {
            imports.unshift('import org.qore.jni.QoreJavaApi;');
        }

        if (Object.keys(this.connections)
                  .some(connection => this.connections[connection].some(connector => !!connector.mapper)))
        {
            imports.push('import org.qore.lang.mapper.Mapper;');
        }

        return imports;
    }

    protected memberDeclAndInitAllCodeQore = () =>
        `${indent1}private {\n` +
        this.memberDeclAndInitCodeQore() +
        `${indent1}}\n`

    memberDeclAndInitAllCodePython = () =>
        `${indent1}def __init__(self):\n` +
        this.memberDeclAndInitCodePython()

    memberDeclAndInitCodeQore = () =>
        `${indent2}${GENERATED.qore.begin}\n` +
        `${indent2}${this.connClassName()} ${CONN_MEMBER.qore}();\n` +
        `${indent2}${GENERATED.qore.end}\n`

    memberDeclAndInitCodePython = () =>
        `${indent2}${GENERATED.python.begin}\n` +
        `${indent2}self.${CONN_MEMBER.python} = ${this.connClassName()}()\n` +
        `${indent2}${GENERATED.python.end}\n`

    memberDeclAndInitAllCodeJava = () =>
        this.memberDeclCodeJava() +
        `${indent1}\n\n` +
        `${indent1}${this.class_name}() ${THROWS} {\n` +
        this.memberInitCodeJava() +
        `${indent1}}\n`

    memberDeclCodeJava = () =>
        `${indent1}${GENERATED.java.begin}\n` +
        `${indent1}${this.connClassName()} ${CONN_MEMBER.java};\n` +
        `${indent1}${GENERATED.java.end}\n`

    memberInitCodeJava = () =>
        `${indent2}${GENERATED.java.begin}\n` +
        `${indent2}${CONN_MEMBER.java} = new ${this.connClassName()}();\n` +
        `${indent2}${GENERATED.java.end}\n`

    protected extraClassCodeQore = (event_based_connections) => {
        let code = `class ${this.connClassName()}`;
        if (event_based_connections.length) {
            code += ` inherits ${CONN_BASE_CLASS} {`;
            code += ` # has to inherit ${CONN_BASE_CLASS} because there is an event-based connector\n`;
        } else {
            code += ' {\n';
        }

        code += `${indent1}private {\n` +
            `${indent2}# map of prefixed class names to class instances\n` +
            `${indent2}hash<auto> ${CONN_CLASS_MAP.qore};\n` +
            `${indent1}}\n\n` +
            `${indent1}constructor() {\n` +
            `${indent2}${CONN_CLASS_MAP.qore} = {\n`;

        for (const prefixed_class in this.classes) {
            const class_data = this.classes[prefixed_class];
            const prefix_arg = class_data.prefix ? `"${class_data.prefix}"` : '';
            code += `${indent3}"${prefixed_class}": new ${class_data.connector_class}(${prefix_arg}),\n`;
        }

        code += `${indent2}};\n`;

        if (event_based_connections.length) {
            code += '\n' + `${indent2}# register observers\n`;
            event_based_connections.forEach(event_based => {code +=
                `${indent2}${CONN_CALL_METHOD}("${event_based.prefixed_class}", "registerObserver", self);\n`;
            });
        }

        code += `${indent1}}\n\n` +
            `${indent1}auto ${CONN_CALL_METHOD}(string prefixed_class, string method) {\n` +
            `${indent2}UserApi::logDebug("${this.connClassName()}: ${CONN_CALL_METHOD}: method: %s, class: %y", method, prefixed_class);\n` +
            `${indent2}return call_object_method_args(${CONN_CLASS_MAP.qore}{prefixed_class}, method, argv);\n` +
            `${indent1}}\n`;

        if (event_based_connections.length) {
            code += '\n' +
                `${indent1}# @override ${CONN_BASE_CLASS}'s update()\n` +
                `${indent1}update(string id, hash<auto> ${CONN_DATA}) {\n`;
            event_based_connections.forEach(event_based => {code +=
                `${indent2}if (id == "${event_based.prefixed_class}::${event_based.method}") {\n` +
                `${indent3}${event_based.connection_code_name}(${CONN_DATA});\n` +
                `${indent2}}\n`;
            });
            code += `${indent1}}\n`;
        }

        return code;
    }

    protected extraClassCodePython = (event_based_connections) => {
        let code = `class ${this.connClassName()}`;
        if (event_based_connections.length) {
            code += `(${CONN_BASE_CLASS}):`;
            code += ` # has to inherit ${CONN_BASE_CLASS} because there is an event-based connector\n`;
        } else {
            code += ':\n';
        }

        const some_qore_class = Object.keys(this.classes)
                                      .some(prefixed_class => this.classes[prefixed_class].class_lang === 'qore');

        code += `${indent1}def __init__(self):\n`;
        if (some_qore_class) {
            code += `${indent2}UserApi.startCapturingObjectsFromPython()\n`;
        }
        code += `${indent2}# map of prefixed class names to class instances\n` +
            `${indent2}self.${CONN_CLASS_MAP.python} = {\n`;

        for (const prefixed_class in this.classes) {
            const class_data = this.classes[prefixed_class];
            const prefix_arg = class_data.prefix ? `"${class_data.prefix}"` : '';
            code += `${indent3}'${prefixed_class}': ${class_data.connector_class}(${prefix_arg}),\n`;
        }

        code += `${indent2}}\n`;
        if (some_qore_class) {
            code += `${indent2}UserApi.stopCapturingObjectsFromPython()\n`;
        }

        if (event_based_connections.length) {
            code += '\n' + `${indent2}# register observers\n`;
            event_based_connections.forEach(event_based => {code +=
                `${indent2}self.${CONN_CALL_METHOD}("${event_based.prefixed_class}", "registerObserver", self)\n`;
            });
        }

        code += `\n` +
            `${indent1}def ${CONN_CALL_METHOD}(self, prefixed_class, method, *argv):\n` +
            `${indent2}UserApi.logDebug("${this.connClassName()}: ${CONN_CALL_METHOD}: method: %s, class: %y", method, prefixed_class)\n` +
            `${indent2}return getattr(self.${CONN_CLASS_MAP.python}[prefixed_class], method)(*argv)\n`;

        if (event_based_connections.length) {
            code += '\n' +
                `${indent1}# override ${CONN_BASE_CLASS}'s update()\n` +
                `${indent1}def update(id, *${CONN_DATA}):\n`;
            event_based_connections.forEach(event_based => {code +=
                `${indent2}if (id == "${event_based.prefixed_class}.${event_based.method}"):\n` +
                `${indent3}${event_based.connection_code_name}(*${CONN_DATA})\n`;
            });
        }

        return code;
    }

    protected extraClassCodeJava = (event_based_connections) => {
        let code = `class ${this.connClassName()}`;
        if (event_based_connections.length) {
            code += ` implements ${CONN_BASE_CLASS} {` +
                ` // has to inherit ${CONN_BASE_CLASS} because there is an event-based connector\n`;
        } else {
            code += ' {\n';
        }

        code += `${indent1}// map of prefixed class names to class instances\n` +
            `${indent1}private final Hash ${CONN_CLASS_MAP.java};\n\n` +
            `${indent1}${this.connClassName()}() ${THROWS} {\n`;

        code += `${indent2}${CONN_CLASS_MAP.java} = new Hash();\n`;

        const do_capturing = Object.keys(this.classes).some(prefixed_class =>
                ['qore', 'python'].includes(this.classes[prefixed_class].class_lang));

        if (do_capturing) {
            code += `${indent2}UserApi.startCapturingObjects();\n` +
                `${indent2}try {\n`;
        }

        for (const prefixed_class in this.classes) {
            const class_data = this.classes[prefixed_class];
            const class_name = class_data.connector_class;

            if (['qore', 'python'].includes(class_data.class_lang)) {
                const prefix_arg = class_data.prefix ? `, "${class_data.prefix}"` : '';
                code += `${indent2}${CONN_CLASS_MAP.java}.put("${class_name}", QoreJavaApi.newObjectSave("${class_name}${prefix_arg}"));\n`;
            } else {
                const prefix_arg = class_data.prefix ? `"${class_data.prefix}"` : '';
                code += `${indent2}${CONN_CLASS_MAP.java}.put("${prefixed_class}", new ${class_data.connector_class}(${prefix_arg}));\n`;
            }
        }

        if (do_capturing) {
            code += `${indent2}} finally {\n` +
                `${indent3}UserApi.stopCapturingObjects();\n` +
                `${indent2}}\n`;
        }

        if (event_based_connections.length) {
            code += `\n${indent2}// register observers\n`;
            event_based_connections.forEach(event_based => {code +=
                `${indent2}${CONN_CALL_METHOD}("${event_based.prefixed_class}", "registerObserver", this);\n`;
            });
        }

        code += `${indent1}}\n\n` +
            `${indent1}Object ${CONN_CALL_METHOD}(final String prefixedClass, final String methodName,\n` +
            `${indent1}${' '.repeat(CONN_CALL_METHOD.length + 8)}Object ${CONN_DATA}) ${THROWS} {\n` +
            `${indent2}UserApi.logDebug("${this.connClassName()}: ${CONN_CALL_METHOD}: method: %s, class: %y", methodName, prefixedClass);\n` +
            `${indent2}final Object object = ${CONN_CLASS_MAP.java}.get(prefixedClass);\n\n` +
            `${indent2}if (object instanceof QoreObject) {\n` +
            `${indent3}QoreObject qoreObject = (QoreObject)object;\n` +
            `${indent3}return qoreObject.callMethod(methodName, ${CONN_DATA});\n` +
            `${indent2}} else {\n` +
            `${indent3}final Method method = object.getClass().getMethod(methodName, Object.class);\n` +
            `${indent3}return method.invoke(object, ${CONN_DATA});\n` +
            `${indent2}}\n${indent1}}\n`;

        if (event_based_connections.length) {
            code += '\n' +
                `${indent1}// override ${CONN_BASE_CLASS}'s update()\n` +
                `${indent1}public void update(String id, Map<String, Object> ${CONN_DATA}) ${THROWS} {\n`;
            event_based_connections.forEach(event_based => {code +=
                `${indent2}if (id.equals("${event_based.prefixed_class}::${event_based.method}")) {\n` +
                `${indent3}${event_based.connection_code_name}(${CONN_DATA});\n` +
                `${indent2}}\n`;
            });
            code += `${indent1}}\n`;
        }

        return code;
    }

    protected methodCodeQore = (connection_code_name, connectors) => {
        let code = `${indent1}auto ${connection_code_name}(auto ${CONN_DATA}) {\n`;

        if (connectors.some(connector => connector.mapper)) {
            code += `${indent2}auto ${CONN_MAPPER};\n`;
        }

        code += `${indent2}UserApi::logDebug("${connection_code_name} called with data: %y", ${CONN_DATA});\n`;

        let n = 0;
        connectors.forEach(connector => {
            ++n;
            const prefixed_class = `${connector.prefix || ''}${connector.class}`;

            if (connector.mapper) {
                code += `\n${indent2}${CONN_MAPPER} = UserApi::getMapper("${connector.mapper.split(':')[0]}");\n` +
                `${indent2}${CONN_DATA} = ${CONN_MAPPER}.mapAuto(${CONN_DATA});\n`;
            }

            if (connector.type === 'event') {
                return;
            }

            code += `\n${indent2}UserApi::logDebug("calling ${connector.name}: %y", ${CONN_DATA});\n${indent2}`;
            if (n !== connectors.length) {
                code += `${CONN_DATA} = `;
            } else {
                code += 'return ';
            }

            code += `${CONN_CALL_METHOD}("${prefixed_class}", "${connector.method}", ${CONN_DATA});\n`;
        });

        code += `${indent1}}\n`;
        return code;
    }

    protected methodCodePython = (connection_code_name, connectors) => {
        let code = `${indent1}def ${connection_code_name}(self, *${CONN_DATA}):\n`;

        code += `${indent2}UserApi.logDebug("${connection_code_name} called with data: %y", *${CONN_DATA})\n`;

        let n = 0;
        connectors.forEach(connector => {
            ++n;
            const prefixed_class = `${connector.prefix || ''}${connector.class}`;

            if (connector.mapper) {
                code += `\n${indent2}${CONN_MAPPER} = UserApi.getMapper("${connector.mapper.split(':')[0]}")\n` +
                `${indent2}${CONN_DATA} = ${CONN_MAPPER}.mapAuto(${CONN_DATA})\n`;
            }

            if (connector.type === 'event') {
                return;
            }

            code += `\n${indent2}UserApi.logDebug("calling ${connector.name}: %y", *${CONN_DATA})\n${indent2}`;
            if (n !== connectors.length) {
                code += `${CONN_DATA} = `;
            } else {
                code += 'return ';
            }

            code += `self.${CONN_CALL_METHOD}("${prefixed_class}", "${connector.method}", *${CONN_DATA})\n`;
        });

        return code;
    }

    protected methodCodeJava = (connection_code_name, connectors) => {
        let code = `${indent1}public Object ${connection_code_name}(Object ${CONN_DATA}) ${THROWS} {\n`;

        if (connectors.some(connector => connector.mapper)) {
            code += `${indent2}Mapper ${CONN_MAPPER};\n`;
        }

        code += `${indent2}UserApi.logDebug("${connection_code_name} called with data: %y", ${CONN_DATA});\n`;

        let n = 0;
        connectors.forEach(connector => {
            ++n;
            const prefixed_class = `${connector.prefix || ''}${connector.class}`;

            if (connector.mapper) {
                code += `\n${indent2}${CONN_MAPPER} = UserApi.getMapper("${connector.mapper.split(':')[0]}");\n` +
                `${indent2}${CONN_DATA} = ${CONN_MAPPER}.mapAuto(${CONN_DATA});\n`;
            }

            if (connector.type === 'event') {
                return;
            }

            code += `\n${indent2}UserApi.logDebug("calling ${connector.name}: %y", ${CONN_DATA});\n${indent2}`;
            if (n !== connectors.length) {
                code += `${CONN_DATA} = `;
            } else {
                code += 'return ';
            }
            code += `${CONN_CALL_METHOD}("${prefixed_class}", "${connector.method}", ${CONN_DATA});\n`;
        });

        code += `${indent1}}\n`;
        return code;
    }

    protected triggerCodeQore = trigger => {
        let code = `${indent1}${trigger.signature} {\n`;
        let params_str = '';
        if (trigger.connections.length) {
            if (trigger.arg_names?.length) { // for steps
                code += `${indent2}hash ${CONN_DATA} = {` +
                trigger.arg_names.map(arg_name => `"${arg_name}": ${arg_name}`).join(', ') +
                '};\n';
                params_str = CONN_DATA;
            }
            if (trigger.is_nonstandard_service) { // for non-standard service triggers
                params_str = CONN_DATA;
            }
        }

        let n = 0;
        trigger.connections.forEach(connection => {
            code += indent2;
            if (++n === trigger.connections.length && hasReturn(trigger)) {
                code += 'return ';
            }
            code += `${CONN_MEMBER.qore}.${connection}(${params_str});\n`;
        });

        if (!trigger.connections.length) {
            if (isValidation(trigger)) {
                code += `${indent2}return OMQ::StatRetry;\n`;
            }
            else if (isArray(trigger)) {
                code += `${indent2}return ();\n`;
            }
        }

        code += `${indent1}}\n`;
        return code;
    }

    protected triggerCodePython = trigger => {
        let code = `${indent1}def ${trigger.signature}:\n`;
        let params_str = '';
        if (trigger.connections.length) {
            if (trigger.arg_names?.length) { // for steps
                code += `${indent2}${CONN_DATA} = {` +
                trigger.arg_names.map(arg_name => `"${arg_name}": ${arg_name}`).join(', ') +
                '}\n';
                params_str = `*${CONN_DATA}`;
            }
            if (trigger.is_nonstandard_service) { // for non-standard service triggers
                params_str = `*${CONN_DATA}`;
            }
        }

        let n = 0;
        trigger.connections.forEach(connection => {
            code += indent2;
            if (++n === trigger.connections.length && hasReturn(trigger)) {
                code += 'return ';
            }
            code += `self.${CONN_MEMBER.python}.${connection}(${params_str})\n`;
        });

        if (!trigger.connections.length) {
            if (isValidation(trigger)) {
                code += `${indent2}return OMQ.StatRetry\n`;
            }
            else if (isArray(trigger)) {
                code += `${indent2}return []\n`;
            }
            else {
                code += `${indent2}pass\n`;
            }
        }

        return code;
    }

    protected triggerCodeJava = trigger => {
        let code = `${indent1}${trigger.signature} {\n`;
        let params_str = 'null';
        if (trigger.connections.length) {
            if (trigger.arg_names?.length) { // for steps
                code += `${indent2}Hash ${CONN_DATA} = new Hash();\n` +
                trigger.arg_names.map(arg_name => `${indent2}${CONN_DATA}.put("${arg_name}", ${arg_name});\n`).join('\n');

                params_str = CONN_DATA;
            }
            if (trigger.is_nonstandard_service) { // for non-standard service triggers
                params_str = CONN_DATA;
            }
        }

        let n = 0;
        trigger.connections.forEach(connection => {
            code += indent2;
            if (++n === trigger.connections.length && hasReturn(trigger)) {
                code += 'return ';
            }
            // issue #548: we have to cast array return values to Object[]
            if (isArray(trigger)) {
                code += '(Object[])';
            }
            code += `${CONN_MEMBER.java}.${connection}(${params_str});\n`;
        });

        if (!trigger.connections.length) {
            if (isValidation(trigger)) {
                code += `${indent2}return OMQ.StatRetry;\n`;
            }
            else if (isArray(trigger)) {
                code += `${indent2}return new Object[0];\n`;
            }
        }

        code += `${indent1}}\n`;
        return code;
    }
}
