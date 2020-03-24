import { QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { toValidIdentifier } from '../qorus_utils';

// =================================================================

const CONN_CLASS = 'ClassConnections';
const CONN_BASE_CLASS = 'Observer';
const CONN_MEMBER = { qore: 'class_connections', java: 'classConnections' };
const CONN_CLASS_MAP = { qore: 'class_map', java: 'classMap' };
const CONN_CALL_METHOD = 'callClassWithPrefixMethod';
const CONN_MAPPER = 'mapper';
const CONN_DATA = 'params';

const GENERATED = {
    qore: {
        begin: '####### GENERATED SECTION! DON\'T EDIT! ########',
        end: '############ GENERATED SECTION END ############'
    },
    java: {
        begin: '// ==== GENERATED SECTION! DON\'T EDIT! ==== //',
        end: '// ======== GENERATED SECTION END ========= //'
    }
};

const THROWS = 'throws Throwable';

const indent1 = ' '.repeat(4);
const indent2 = indent1.repeat(2);
const indent3 = indent1.repeat(3);
const indent4 = indent1.repeat(4);

// =================================================================

export const classConnectionsCode = (data, code_info: QorusProjectCodeInfo, lang) => {
    const {
        'class-connections': connections,
        iface_kind,
        'base-class-name': base_class_name,
        'class-name': class_name
    } = data;

    const conn_class_name = `${CONN_CLASS}_${data['class-name']}`;

    let triggers = {};
    switch (iface_kind) {
        case 'step':
            triggers = code_info.stepTriggerSignatures(base_class_name, lang);
            break;
        case 'job':
            code_info.triggers({iface_kind}).forEach(trigger => {
                triggers[trigger] = {
                    signature: lang === 'java' ? `public void ${trigger}() ${THROWS}` : `${trigger}()`
                };
            });
            break;
    }

    Object.keys(triggers).forEach(trigger => {
        triggers[trigger] = {...triggers[trigger], connections: []};
    });

    let classes = {};
    let event_based_connections = [];
    let method_codes = [];

    const serviceTrigger = trigger => {
        const is_standard = code_info.triggers({iface_kind: 'service'}).includes(trigger);
        const signature = is_standard
            ? lang === 'java'
                ? `public void ${trigger}() ${THROWS}`
                : `${trigger}()`
            : lang === 'java'
                ? `public Object ${trigger}(Map<String, Object> ${CONN_DATA}) ${THROWS}`
                : `auto ${trigger}(auto ${CONN_DATA})`;

        return {
            signature,
            is_nonstandard_service: !is_standard,
            connections: []
        };
    };

    let exists_qore_connector = false; // used only for java

    for (const connection in connections) {
        const connection_code_name = toValidIdentifier(connection);
        let connectors = [];
        for (let connector of connections[connection]) {
            if (connector.trigger) {
                if (iface_kind === 'service' && !triggers[connector.trigger]) {
                    triggers[connector.trigger] = serviceTrigger(connector.trigger);
                }
                triggers[connector.trigger].connections.push(connection_code_name);
            }

            connector = { ...connector, ...code_info.getClassConnector(connector) };
            const {'class': connector_class, type, prefix = ''} = connector;
            const prefixed_class = prefix + connector_class;

            let class_lang = 'qore';
            if (lang === 'java') {
                class_lang = code_info.yaml_info.yamlDataByName('class', connector_class)?.lang || 'qore';
                exists_qore_connector = exists_qore_connector || (class_lang === 'qore');
            }
            classes[prefixed_class] = { connector_class, prefix, class_lang };

            if (type === 'event') {
                event_based_connections.push({ connection_code_name, prefixed_class, method: connector.method });
            }

            connectors.push(connector);
        }
        method_codes.push(methodCode[lang](connection_code_name, connectors));
    }

    let connections_within_class = constructorCode[lang](class_name, conn_class_name);

    if (Object.keys(triggers).length) {
        connections_within_class += `\n${indent1}${GENERATED[lang].begin}\n` +
        Object.keys(triggers).map(trigger => (triggerCode[lang])(triggers[trigger])).join('\n') +
        `${indent1}${GENERATED[lang].end}\n`;
    }

    const connections_extra_class = `\n\n${GENERATED[lang].begin}\n` +
        extraClassCode[lang](conn_class_name, classes, event_based_connections) + '\n' +
        method_codes.join('\n') + '}\n' +
        `${GENERATED[lang].end}\n`;

    return {
        triggers: Object.keys(triggers),
        connections_within_class,
        connections_extra_class,
        imports: getImports[lang](data['class-connections'], exists_qore_connector)
    };
};

// =================================================================

let getImports: any = {};

getImports.qore = () => [];

getImports.java = (data, exists_qore_connector) => {
    let imports = [
        'import org.qore.jni.QoreObject;',
        'import java.util.Map;',
        'import java.util.Optional;',
        'import java.util.HashMap;',
        'import java.lang.reflect.Method;'
    ];

    if (exists_qore_connector) {
        imports.unshift('import org.qore.jni.QoreJavaApi;');
    }

    if (Object.keys(data).some(connection => data[connection].some(connector => !!connector.mapper))) {
        imports.push('import org.qore.lang.mapper.Mapper;');
    }

    return imports;
};

// =================================================================

let constructorCode: any = {};

constructorCode.qore = (_class_name, conn_class_name) =>
    `${indent1}private {\n` +
    `${indent2}${GENERATED.qore.begin}\n` +
    `${indent2}${conn_class_name} ${CONN_MEMBER.qore};\n` +
    `${indent2}${GENERATED.qore.end}\n` +
    `${indent1}}\n\n` +
    `${indent1}constructor() {\n` +
    `${indent2}${GENERATED.qore.begin}\n` +
    `${indent2}${CONN_MEMBER.qore} = new ${conn_class_name}();\n` +
    `${indent2}${GENERATED.qore.end}\n` +
    `${indent1}}\n`;

constructorCode.java = (class_name, conn_class_name) =>
    `${indent1}${GENERATED.java.begin}\n` +
    `${indent1}${conn_class_name} ${CONN_MEMBER.java};\n` +
    `${indent1}${GENERATED.java.end}\n` +
    `${indent1}\n\n` +
    `${indent1}${class_name}() ${THROWS} {\n` +
    `${indent2}${GENERATED.java.begin}\n` +
    `${indent2}${CONN_MEMBER.java} = new ${conn_class_name}();\n` +
    `${indent2}${GENERATED.java.end}\n` +
    `${indent1}}\n`;

// =================================================================

let extraClassCode: any = {};

extraClassCode.qore = (conn_class_name, classes, event_based_connections) => {
    let code = `class ${conn_class_name}`;
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

    for (const prefixed_class in classes) {
        const class_data = classes[prefixed_class];
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
        `${indent2}UserApi::logDebug("${conn_class_name}: ${CONN_CALL_METHOD}: method: %s, class: %y", method, prefixed_class);\n` +
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
};

extraClassCode.java = (conn_class_name, classes, event_based_connections) => {
    let code = `class ${conn_class_name}`;
    if (event_based_connections.length) {
        code += ` implements ${CONN_BASE_CLASS} {` +
            ` // has to inherit ${CONN_BASE_CLASS} because there is an event-based connector\n`;
    } else {
        code += ' {\n';
    }

    const some_qore_class = Object.keys(classes).some(prefixed_class => classes[prefixed_class].class_lang === 'qore');

    code += `${indent1}// map of prefixed class names to class instances\n` +
        `${indent1}private final HashMap<String, Object> ${CONN_CLASS_MAP.java};\n\n` +
        `${indent1}${conn_class_name}() ${THROWS} {\n`;

    if (some_qore_class) {
        code += `${indent2}UserApi.startCapturingObjects();\n`;
    }

    code += `${indent2}${CONN_CLASS_MAP.java} = new HashMap<String, Object>() {\n${indent3}{\n`;

    for (const prefixed_class in classes) {
        const class_data = classes[prefixed_class];
        const class_name = class_data.connector_class;

        if (class_data.class_lang === 'qore') {
            const prefix_arg = class_data.prefix ? `, "${class_data.prefix}"` : '';
            code += `${indent4}put("${class_name}", QoreJavaApi.newObjectSave("${class_name}${prefix_arg}"));\n`;
        } else {
            const prefix_arg = class_data.prefix ? `"${class_data.prefix}"` : '';
            code += `${indent4}put("${prefixed_class}", new ${class_data.connector_class}(${prefix_arg}));\n`;
        }
    }

    code += `${indent3}}\n${indent2}};\n`;
    if (some_qore_class) {
        code += `${indent2}UserApi.stopCapturingObjects();\n`;
    }
    code += `${indent1}\n`;

    if (event_based_connections.length) {
        code += `${indent2}// register observers\n`;
        event_based_connections.forEach(event_based => {code +=
            `${indent2}${CONN_CALL_METHOD}("${event_based.prefixed_class}", "registerObserver", this);\n`;
        });
    }

    code += `${indent1}}\n\n` +
        `${indent1}Object ${CONN_CALL_METHOD}(final String prefixedClass, final String methodName,\n` +
        `${indent1}${' '.repeat(CONN_CALL_METHOD.length + 8)}Optional<Object> ${CONN_DATA}) ${THROWS} {\n` +
        `${indent2}UserApi.logInfo("${conn_class_name}: ${CONN_CALL_METHOD}: method: %s, class: %y", methodName, prefixedClass);\n` +
        `${indent2}final Object object = ${CONN_CLASS_MAP.java}.get(prefixedClass);\n\n` +
        `${indent2}if (object instanceof QoreObject) {\n` +
        `${indent3}QoreObject qoreObject = (QoreObject)object;\n` +
        `${indent3}if (${CONN_DATA}.isPresent()) {\n` +
        `${indent4}return qoreObject.callMethod(methodName, ${CONN_DATA}.get());\n` +
        `${indent3}}\n` +
        `${indent3}return qoreObject.callMethod(methodName);\n` +
        `${indent2}} else if (${CONN_DATA}.isPresent()) {\n` +
        `${indent3}final Method method = object.getClass().getMethod(methodName, Object.class);\n` +
        `${indent3}return method.invoke(object, ${CONN_DATA}.get());\n` +
        `${indent2}} else {\n` +
        `${indent3}final Method method = object.getClass().getMethod(methodName);\n` +
        `${indent3}return method.invoke(object);\n` +
        `${indent2}}\n${indent1}}\n`;

    if (event_based_connections.length) {
        code += '\n' +
            `${indent1}// override ${CONN_BASE_CLASS}'s update()\n` +
            `${indent1}public void update(String id, Optional<Map<String, Object>> ${CONN_DATA}) ${THROWS} {\n`;
        event_based_connections.forEach(event_based => {code +=
            `${indent2}if (id == "${event_based.prefixed_class}::${event_based.method}") {\n` +
            `${indent3}${event_based.connection_code_name}(${CONN_DATA});\n` +
            `${indent2}}\n`;
        });
        code += `${indent1}}\n`;
    }

    return code;
};

// =================================================================

let methodCode: any = {};

methodCode.qore = (connection_code_name, connectors) => {
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
            `${indent2}${CONN_DATA} = ${CONN_MAPPER}.mapData(${CONN_DATA});\n`;
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
};

methodCode.java = (connection_code_name, connectors) => {
    let code = `${indent1}@SuppressWarnings("unchecked")\n` +
        `${indent1}public Object ${connection_code_name}(Optional<Object> ${CONN_DATA}) ${THROWS} {\n`;

    if (connectors.some(connector => connector.mapper)) {
        code += `${indent2}Mapper ${CONN_MAPPER};\n`;
    }

    code += `${indent2}UserApi.logInfo("${connection_code_name} called with data: %y", ${CONN_DATA});\n`;

    let n = 0;
    connectors.forEach(connector => {
        const prefixed_class = `${connector.prefix || ''}${connector.class}`;

        if (connector.mapper) {
            code += `\n${indent2}${CONN_MAPPER} = UserApi.getMapper("${connector.mapper.split(':')[0]}");\n` +
            `${indent2}${CONN_DATA} = Optional.of(${CONN_MAPPER}.mapData(${CONN_DATA}.get()));\n`;
        }

        code += `\n${indent2}UserApi.logInfo("calling ${connector.name}: %y", ${CONN_DATA});\n${indent2}`;
        if (++n !== connectors.length) {
            code += `${CONN_DATA} = (Optional<Object>)`;
        } else {
            code += 'return ';
        }
        code += `${CONN_CALL_METHOD}("${prefixed_class}", "${connector.method}", ${CONN_DATA});\n`;
    });

    code += `${indent1}}\n`;
    return code;
};

// =================================================================

const isArray = trigger => trigger.signature.indexOf(' array(') > -1;
const isValidation = trigger => trigger.signature.indexOf(' validation(') > -1;
const hasReturn = trigger => trigger.is_nonstandard_service || isValidation(trigger) || isArray(trigger);

let triggerCode: any = {};

triggerCode.qore = trigger => {
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
};

triggerCode.java = trigger => {
    let code = `${indent1}${trigger.signature} {\n`;
    let params_str = 'Optional.empty()';
    if (trigger.connections.length) {
        if (trigger.arg_names?.length) { // for steps
            code += `${indent2}Map<String, Object> ${CONN_DATA} = new HashMap<String, Object>() {\n` +
            `${indent3}{\n` +
            trigger.arg_names.map(arg_name => `${indent4}put("${arg_name}", ${arg_name});\n`).join('\n') +
            `${indent3}}\n${indent2}};\n`;

            params_str = CONN_DATA;
        }
        if (trigger.is_nonstandard_service) { // for non-standard service triggers
            params_str = `Optional.of(${CONN_DATA})`;
        }
    }

    let n = 0;
    trigger.connections.forEach(connection => {
        code += indent2;
        if (++n === trigger.connections.length && hasReturn(trigger)) {
            code += 'return ';
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
};
