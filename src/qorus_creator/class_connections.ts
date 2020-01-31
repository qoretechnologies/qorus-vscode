import { toValidIdentifier } from '../qorus_utils';
import { lang_inherits } from './common_constants';
import * as msg from '../qorus_message';

// =================================================================

export const connectionsCode = (data, lang) => {
    const {connections_within_class, triggers} = withinClassCode(data, lang);
    const {connections_extra_class} = extraClassCode(data, lang);
    return {connections_within_class, connections_extra_class, triggers};
};

const CONN_CLASS = 'ClassConnections';
const CONN_BASE_CLASS = 'Observer';
const CONN_MEMBER = 'class_connections';
const CONN_CLASS_MAP = 'class_map';
const CONN_CALL_METHOD = 'callClassWithPrefixMethod';

let GENERATED: any = { qore: {}, java: {} };
GENERATED.qore.begin = '####### GENERATED SECTION! DON\'T EDIT! ########';
GENERATED.qore.end   = '############ GENERATED SECTION END ############';
GENERATED.java.begin = '// ==== GENERATED SECTION! DON\'T EDIT! ==== //';
GENERATED.java.end   = '// ======== GENERATED SECTION END ========= //';

const indent1 = ' '.repeat(4);
const indent2 = indent1.repeat(2);
const indent3 = indent1.repeat(3);

// =================================================================

const withinClassCode = (data, lang) => {
    let triggers = [];
    let code = constructorCode(lang, data);

    let trigger_exists = false;
    for (const connection in data) {
        for (const connector of data[connection]) {
            if (connector.trigger) {
                if (!trigger_exists) {
                    code += `\n${indent1}${GENERATED[lang].begin}\n`;
                    trigger_exists = true;
                } else {
                    code += '\n';
                }

                code += triggerCode(lang, {
                    connection_code_name: toValidIdentifier(connection),
                    trigger_code_name: toValidIdentifier(connector.trigger)
                });

                triggers.push(connector.trigger);
            }
        }
    }
    if (trigger_exists) {
        code += `${indent1}${GENERATED[lang].end}\n`;
    }

    return { triggers, connections_within_class: code };
};

// =================================================================

const extraClassCode = (data, lang) => {
    let code = `\n${GENERATED[lang].begin}\n`;

    let method_codes = [];
    let classes = {};
    let event_based = undefined;

    for (const connection in data) {
        const connection_code_name = toValidIdentifier(connection);
        for (const connector of data[connection]) {
            const {'class': class_name, 'event-based': is_event_based = false, prefix = ''} = connector;
            const prefixed_class = prefix + class_name;
            classes[prefixed_class] = { class_name, prefix };
            if (is_event_based) {
                event_based = { prefixed_class, connection_code_name };
            }
        }
        method_codes.push(methodCode(lang, connection_code_name, data[connection]));
    }

    switch (lang) {
        case 'qore': code += classConnectionsQore(classes, event_based);
    }

    code += '\n' + method_codes.join('\n') + '}\n';

    code += `${GENERATED[lang].end}\n`;
    return { connections_extra_class: code };
};

const classConnectionsQore = (classes, event_based) => {
    let code = `class ${CONN_CLASS}`;
    if (event_based) {
        code += ` ${lang_inherits.qore} ${CONN_BASE_CLASS} {`;
        code += ` # has to inherit ${CONN_BASE_CLASS} because there is an event-based connector`;
    } else {
        code += '{\n';
    }

    code += '\n' +
        `${indent1}private {\n` +
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

    if (event_based) {
        code += '\n' +
            `${indent2}# register itself as an observer\n` +
            `${indent2}${CONN_CALL_METHOD}("${event_based.prefixed_class}", "registerObserver", self);\n`;
    }

    code += `${indent1}}\n\n` +
        `${indent1}auto ${CONN_CALL_METHOD}(string prefixed_class, string method) {\n` +
        `${indent2}UserApi::logDebug("${CONN_CLASS}: ${CONN_CALL_METHOD}: method: %s, class: %y", method, prefixed_class);\n` +
        `${indent2}return call_object_method_args(${CONN_CLASS_MAP}{prefixed_class}, method, argv);\n` +
        `${indent1}}\n`;

    if (event_based) {
        code += '\n' +
            `${indent1}# @override ${CONN_BASE_CLASS}'s update()\n` +
            `${indent1}update(string id, hash<auto> data) {\n` +
            `${indent2}if (id == "${event_based.prefixed_class}::messageCallbackImpl") {\n` +
            `${indent3}${event_based.connection_code_name}(data);\n` +
            `${indent2}}\n` +
            `${indent1}}\n`;
    }

    return code;
};

// =================================================================

//const fillTemplate = (template: any, vars?: any): string =>
//    new Function('return `' + template + '`;').call(vars);

// =================================================================

const constructorCode = (lang, _data) => {
    switch (lang) {
        case 'qore': return constructorCodeQore();
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

// =================================================================

const triggerCode = (lang, data) => {
    switch (lang) {
        case 'qore': return triggerCodeQore(data);
        default: return '';
    }
};

const triggerCodeQore = ({connection_code_name, trigger_code_name}) => {
    return (
        `${indent1}${trigger_code_name}() {\n` +
        `${indent2}${CONN_MEMBER}.${connection_code_name}();\n` +
        `${indent1}}\n`
    );
};

// =================================================================

const methodCode = (lang, connection_code_name, data) => {
    switch (lang) {
        case 'qore': return methodCodeQore(connection_code_name, data);
        default: return '';
    }
};

const methodCodeQore = (connection_code_name, data) => {
    msg.debug({connection_code_name, data});
    let code = `${indent1}${connection_code_name}() {\n` +
        `${indent2}UserApi::logDebug("${connection_code_name} called");\n` +
        `${indent1}}\n`;
    return code;
};
