import * as shortid from 'shortid';
import { QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { toValidIdentifier } from '../qorus_utils';

// =================================================================

let CONN_CLASS = 'ClassConnections';
const CONN_BASE_CLASS = 'Observer';
const CONN_MEMBER = 'class_connections';
const CONN_CLASS_MAP = 'class_map';
const CONN_CLASS_MAP_J = 'classMap';
const CONN_CALL_METHOD = 'callClassWithPrefixMethod';
const CONN_MAPPER = 'mapper';
const CONN_DATA = 'params';

let GENERATED: any = { qore: {}, java: {} };
GENERATED.qore.begin = '####### GENERATED SECTION! DON\'T EDIT! ########';
GENERATED.qore.end   = '############ GENERATED SECTION END ############';
GENERATED.java.begin = '// ==== GENERATED SECTION! DON\'T EDIT! ==== //';
GENERATED.java.end   = '// ======== GENERATED SECTION END ========= //';

const THROWS = 'throws Throwable';

const indent1 = ' '.repeat(4);
const indent2 = indent1.repeat(2);
const indent3 = indent1.repeat(3);
const indent4 = indent1.repeat(4);

// =================================================================

export const connectionsCode = (data, code_info: QorusProjectCodeInfo, lang) => {
    const imports = lang === 'java' ? [
        'import org.qore.jni.QoreObject;',
        'import java.util.Map;',
        'import java.util.Optional;',
        'import java.util.HashMap;',
        'import java.lang.reflect.Method;'
    ] : [];

    CONN_CLASS += `_${shortid.generate()}`;

    const {connections_within_class, triggers} = withinClassCode(data, code_info, lang);
    const {connections_extra_class} = extraClassCode(data['class-connections'], code_info, lang);

    if (lang === 'java') {
        if (data['class-connections'].some(connection => data['class-connections'][connection]
                                     .some(connector => !!connector.mapper)))
        {
            imports.push('import org.qore.lang.mapper.Mapper;');
        }
    }

    return {connections_within_class, connections_extra_class, triggers, imports};
};

// =================================================================

const withinClassCode = (data, code_info, lang) => {
    const {
        'class-connections': connections,
        iface_kind,
        'base-class-name': base_class_name,
        'class-name': class_name
    } = data;
    let code = constructorCode(lang, class_name);

    let triggers = {};
    switch (iface_kind) {
        case 'step':
            triggers = code_info.stepTriggerSignatures(base_class_name, lang);
            break;
        case 'job':
            code_info.triggers({iface_kind}).forEach(trigger => {
                triggers[trigger] = {signature: lang === 'java' ? `public void ${trigger}()` : `${trigger}()`};
            });
            break;
    }

    Object.keys(triggers).forEach(trigger => {
        triggers[trigger] = {...triggers[trigger], connections: []};
    });

    for (const connection in connections) {
        const connection_code_name = toValidIdentifier(connection);
        for (const connector of connections[connection]) {
            if (connector.trigger) {
                if (!triggers[connector.trigger]) {
                    triggers[connector.trigger] = {
                        signature: `${connector.trigger}()`,
                        connections: []
                    };
                }
                triggers[connector.trigger].connections.push(connection_code_name);
            }
        }
    }
    if (Object.keys(triggers).length) {
        code += `\n${indent1}${GENERATED[lang].begin}\n` +
        Object.keys(triggers).map(trigger => triggerCode(lang, triggers[trigger])).join('\n') +
        `${indent1}${GENERATED[lang].end}\n`;
    }

    return { triggers: Object.keys(triggers), connections_within_class: code };
};

// =================================================================

const extraClassCode = (data, code_info, lang) => {
    let code = `\n${GENERATED[lang].begin}\n`;

    let method_codes = [];
    let classes = {};
    let event_based_connections = [];

    for (const connection in data) {
        const connection_code_name = toValidIdentifier(connection);
        let connectors = [];
        for (let connector of data[connection]) {
            connector = { ...connector, ...code_info.getClassConnector(connector) };
            const {'class': class_name, type, prefix = ''} = connector;
            const prefixed_class = prefix + class_name;
            classes[prefixed_class] = { class_name, prefix };

            if (type === 'event') {
                event_based_connections.push({ connection_code_name, prefixed_class, method: connector.method });
            }

            connectors.push(connector);
        }
        method_codes.push(methodCode(connection_code_name, connectors, lang));
    }

    switch (lang) {
        case 'qore':
            code += classConnectionsQore(classes, event_based_connections);
            break;
        case 'java':
            code += classConnectionsJava(classes, event_based_connections);
            break;
    }

    code += '\n' + method_codes.join('\n') + '}\n';

    code += `${GENERATED[lang].end}\n`;
    return { connections_extra_class: code };
};

const classConnectionsQore = (classes, event_based_connections) => {
    let code = `class ${CONN_CLASS}`;
    if (event_based_connections.length) {
        code += ` inherits ${CONN_BASE_CLASS} {`;
        code += ` # has to inherit ${CONN_BASE_CLASS} because there is an event-based connector\n`;
    } else {
        code += ' {\n';
    }

    code += `${indent1}private {\n` +
        `${indent2}# map of prefixed class names to class instances\n` +
        `${indent2}hash<auto> ${CONN_CLASS_MAP};\n` +
        `${indent1}}\n\n` +
        `${indent1}constructor() {\n` +
        `${indent2}${CONN_CLASS_MAP} = {\n`;

    for (const prefixed_class in classes) {
        const class_data = classes[prefixed_class];
        const prefix_arg = class_data.prefix ? `"${class_data.prefix}"` : '';
        code += `${indent3}"${prefixed_class}": new ${class_data.class_name}(${prefix_arg}),\n`;
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
        `${indent2}UserApi::logDebug("${CONN_CLASS}: ${CONN_CALL_METHOD}: method: %s, class: %y", method, prefixed_class);\n` +
        `${indent2}return call_object_method_args(${CONN_CLASS_MAP}{prefixed_class}, method, argv);\n` +
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

const classConnectionsJava = (classes, event_based_connections) => {
    let code = `class ${CONN_CLASS}`;
    if (event_based_connections.length) {
        code += ` implements ${CONN_BASE_CLASS} {` +
            ` // has to inherit ${CONN_BASE_CLASS} because there is an event-based connector\n`;
    } else {
        code += ' {\n';
    }

    code += `${indent1}// map of prefixed class names to class instances\n` +
        `${indent1}private final HashMap<String, Object> ${CONN_CLASS_MAP_J};\n\n` +
        `${indent1}${CONN_CLASS}() ${THROWS} {\n` +
        `${indent2}${CONN_CLASS_MAP_J} = new HashMap<String, Object>() {\n` +
        `${indent3}{\n`;

    for (const prefixed_class in classes) {
        const class_data = classes[prefixed_class];
        const prefix_arg = class_data.prefix ? `"${class_data.prefix}"` : '';
        code += `${indent4}put("${prefixed_class}", new ${class_data.class_name}(${prefix_arg}));\n`;
    }

    code += `${indent3}}\n${indent2}};\n${indent1}\n`;

    if (event_based_connections.length) {
        code += `${indent2}// register observers\n`;
        event_based_connections.forEach(event_based => {code +=
            `${indent2}${CONN_CALL_METHOD}("${event_based.prefixed_class}", "registerObserver", this);\n`;
        });
    }

    code += `${indent1}}\n\n` +
        `${indent1}Object ${CONN_CALL_METHOD}(final String prefixedClass, final String methodName,\n` +
        `${indent1}${' '.repeat(CONN_CALL_METHOD.length + 8)}Optional<Map<String, Object>> ${CONN_DATA}) ${THROWS} {\n` +
        `${indent2}UserApi.logInfo("${CONN_CLASS}: ${CONN_CALL_METHOD}: method: %s, class: %y", methodName, prefixedClass);\n` +
        `${indent2}final Object object = ${CONN_CLASS_MAP_J}.get(prefixedClass);\n\n` +
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
            `${indent1}public void update(String id, Map<String, Object> ${CONN_DATA}) ${THROWS} {\n`;
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

const constructorCode = (lang, class_name) => {
    switch (lang) {
        case 'qore': return constructorCodeQore();
        case 'java': return constructorCodeJava(class_name);
        default: return '';
    }
};

const constructorCodeQore = () =>
    `${indent1}private {\n` +
    `${indent2}${GENERATED.qore.begin}\n` +
    `${indent2}${CONN_CLASS} ${CONN_MEMBER};\n` +
    `${indent2}${GENERATED.qore.end}\n` +
    `${indent1}}\n\n` +
    `${indent1}constructor() {\n` +
    `${indent2}${GENERATED.qore.begin}\n` +
    `${indent2}${CONN_MEMBER} = new ${CONN_CLASS}();\n` +
    `${indent2}${GENERATED.qore.end}\n` +
    `${indent1}}\n`;

const constructorCodeJava = class_name =>
    `${indent1}${GENERATED.java.begin}\n` +
    `${indent1}${CONN_CLASS} ${CONN_MEMBER};\n` +
    `${indent1}${GENERATED.java.end}\n` +
    `${indent1}\n\n` +
    `${indent1}${class_name}() ${THROWS} {\n` +
    `${indent2}${GENERATED.java.begin}\n` +
    `${indent2}${CONN_MEMBER} = new ${CONN_CLASS}();\n` +
    `${indent2}${GENERATED.java.end}\n` +
    `${indent1}}\n`;

// =================================================================

const triggerCode = (lang, trigger) => {
    switch (lang) {
        case 'qore': return triggerCodeQore(trigger);
        case 'java': return triggerCodeJava(trigger);
        default: return '';
    }
};

const triggerCodeQore = trigger => {
    let code = `${indent1}${trigger.signature} {\n`;
    let params_str = '';
    if (trigger.connections.length && trigger.arg_names?.length) {
        code += `${indent2}hash ${CONN_DATA} = {` +
        trigger.arg_names.map(arg_name => `"${arg_name}": ${arg_name}`).join(', ') +
        '};\n';
        params_str = CONN_DATA;
    }
    trigger.connections.forEach(connection => {code +=
        `${indent2}${CONN_MEMBER}.${connection}(${params_str});\n`
    });
    code += `${indent1}}\n`
    return code;
};

const triggerCodeJava = trigger => {
    let code = `${indent1}${trigger.signature} {\n`;
    let params_str = '';
    if (trigger.connections.length && trigger.arg_names?.length) {
        code += `${indent2}Map<String, Object> ${CONN_DATA} = new HashMap<String, Object>() {\n` +
        `${indent3}{\n` +
        trigger.arg_names.map(arg_name => `${indent4}put("${arg_name}", ${arg_name});\n`).join('\n') +
        `${indent3}}\n${indent2}};\n`;

        params_str = CONN_DATA;
    }
    trigger.connections.forEach(connection => {code +=
        `${indent2}${CONN_MEMBER}.${connection}(${params_str});\n`
    });
    code += `${indent1}}\n`
    return code;
};

// =================================================================

const methodCode = (connection_code_name, connectors, lang) => {
    switch (lang) {
        case 'qore': return methodCodeQore(connection_code_name, connectors);
        case 'java': return methodCodeJava(connection_code_name, connectors);
        default: return '';
    }
};

const methodCodeQore = (connection_code_name, connectors) => {
    let code = `${indent1}${connection_code_name}(*hash<auto> ${CONN_DATA}) {\n`;

    if (connectors.some(connector => connector.mapper)) {
        code += `${indent2}auto ${CONN_MAPPER};\n`;
    }

    code += `${indent2}UserApi::logDebug("${connection_code_name} called with data: %y", ${CONN_DATA});\n`;

    let n = 0;
    connectors.forEach(connector => {
        const prefixed_class = `${connector.prefix || ''}${connector.class}`;

        if (connector.mapper) {
            code += `\n${indent2}${CONN_MAPPER} = UserApi::getMapper("${connector.mapper.split(':')[0]}");\n` +
            `${indent2}${CONN_DATA} = ${CONN_MAPPER}.mapData(${CONN_DATA});\n`;
        }

        code += `\n${indent2}UserApi::logDebug("calling ${connector.name}: %y", ${CONN_DATA});\n${indent2}`;
        if (++n !== connectors.length) {
            code += `${CONN_DATA} = `;
        }
        code += `${CONN_CALL_METHOD}("${prefixed_class}", "${connector.method}", ${CONN_DATA});\n`;
    });

    code += `${indent1}}\n`;
    return code;
};

const methodCodeJava = (connection_code_name, connectors) => {
    let code = `${indent1}@SuppressWarnings("unchecked")\n` +
        `${indent1}public void ${connection_code_name}(Map<String, Object> ${CONN_DATA}) ${THROWS} {\n`;

    if (connectors.some(connector => connector.mapper)) {
        code += `${indent2}Mapper ${CONN_MAPPER};\n`;
    }

    code += `${indent2}UserApi.logInfo("${connection_code_name} called with data: %y", ${CONN_DATA});\n`;

    let n = 0;
    connectors.forEach(connector => {
        const prefixed_class = `${connector.prefix || ''}${connector.class}`;

        if (connector.mapper) {
            code += `\n${indent2}${CONN_MAPPER} = UserApi.getMapper("${connector.mapper.split(':')[0]}");\n` +
            `${indent2}${CONN_DATA} = ${CONN_MAPPER}.mapData(${CONN_DATA});\n`;
        }

        code += `\n${indent2}UserApi.logInfo("calling ${connector.name}: %y", ${CONN_DATA});\n${indent2}`;
        if (++n !== connectors.length) {
            code += `${CONN_DATA} = `;
        }
        code += `(Map<String, Object>)${CONN_CALL_METHOD}("${prefixed_class}", "${connector.method}", Optional.of(${CONN_DATA}));\n`;
    });

    code += `${indent1}}\n`;
    return code;
};
