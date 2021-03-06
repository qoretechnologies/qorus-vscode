import { t } from 'ttag';
import { qorus_webview } from '../QorusWebview';
import { serviceFields } from './service_constants';


export class FormChangesResponder {
    static configItemTypeChanged({type, iface_id, iface_kind}) {
        const postMessage = (action, fields) => fields.forEach(field =>
            qorus_webview.postMessage({
                action: `creator-${action}-field`,
                field,
                iface_id,
                iface_kind
            })
        );

        if (type === 'any') {
            postMessage('remove', ['can_be_undefined', 'allowed_values']);
            postMessage('disable', ['can_be_undefined', 'allowed_values']);
        } else {
            postMessage('enable', ['can_be_undefined', 'allowed_values']);
            postMessage('add', ['can_be_undefined']);
        }
    }

    private static changeStatelessServiceDefaultsByLang = (lang: string, iface_id: string, iface_kind: string) => {
        ['scaling-memory', 'container-memory-request', 'container-memory-limit'].forEach(field => {
            qorus_webview.postMessage({
                action: 'creator-change-field-value',
                field,
                value: serviceFields({lang}).find(({name}) => name === field)?.default_value,
                iface_id,
                iface_kind
            });
        });
    }

    static langChanged({ lang, orig_lang, iface_id, iface_kind, send_response }, code_info) {
        if (lang === 'java') {
            qorus_webview.postMessage({
                action: 'creator-remove-field',
                field: 'target_file',
                iface_id,
                iface_kind
            });
            qorus_webview.postMessage({
                action: 'creator-disable-field',
                field: 'target_file',
                iface_id,
                iface_kind
            });
        }

        if (send_response && orig_lang && orig_lang !== lang) {
            qorus_webview.postMessage({
                action: 'maybe-recreate-interface',
                message: t`LangChangeRecreateQuestion`,
                orig_lang,
                iface_id,
                iface_kind
            });
        }

        // https://github.com/qoretechnologies/qorus-vscode/issues/743
        // do not reset the base class name when changing the lang to java, as java can inherit qore and python
        // classes

        if ([lang, orig_lang].includes('java') && orig_lang !== lang) {
            FormChangesResponder.changeStatelessServiceDefaultsByLang(lang, iface_id, iface_kind);
        }

        code_info.interface_info.last_lang = lang;
    }

    static valueTypeChanged({ valuetype, iface_id, iface_kind }) {
        if (valuetype === 'date') {
            qorus_webview.postMessage({
                action: `creator-enable-field`,
                field: 'dateformat',
                iface_id,
                iface_kind
            });
            qorus_webview.postMessage({
                action: `creator-add-field`,
                field: 'dateformat',
                iface_id,
                iface_kind
            });
        } else {
            qorus_webview.postMessage({
                action: `creator-remove-field`,
                field: 'dateformat',
                iface_id,
                iface_kind
            });
            qorus_webview.postMessage({
                action: `creator-disable-field`,
                field: 'dateformat',
                iface_id,
                iface_kind
            });
        }
    }

    static errorStatusChanged({ status: status, iface_id, iface_kind }) {
        if (status === 'RETRY') {
            qorus_webview.postMessage({
                action: `creator-enable-field`,
                field: 'retry-delay',
                iface_id,
                iface_kind
            });
        } else {
            qorus_webview.postMessage({
                action: `creator-remove-field`,
                field: 'retry-delay',
                iface_id,
                iface_kind
            });
            qorus_webview.postMessage({
                action: `creator-disable-field`,
                field: 'retry-delay',
                iface_id,
                iface_kind
            });
        }
    }

    static statelessChanged({stateless, iface_id, iface_kind, interface_info }) {
        const fields = [
            'scaling-min-replicas', 'scaling-max-replicas', 'scaling-cpu', 'scaling-memory',
            'container-memory-request', 'container-memory-limit', 'container-cpu-request', 'container-cpu-limit',
        ];

        if (stateless) {
            fields.forEach(field => {
                qorus_webview.postMessage({ action: `creator-enable-field`, field, iface_id, iface_kind });
                qorus_webview.postMessage({ action: `creator-add-field`, field, iface_id, iface_kind });
            });

            const lang = interface_info.last_lang;
            if (lang === 'java') {
                FormChangesResponder.changeStatelessServiceDefaultsByLang(lang, iface_id, iface_kind);
            }
        } else {
            fields.forEach(field => {
                qorus_webview.postMessage({ action: `creator-remove-field`, field, iface_id, iface_kind });
                qorus_webview.postMessage({ action: `creator-disable-field`, field, iface_id, iface_kind });
            });
        }
    }

    static fieldAdded({field, iface_id, iface_kind}) {
        const addField = field =>
            qorus_webview.postMessage({ action: 'creator-add-field', field, iface_id, iface_kind });

        switch(field) {
            case 'class-name':
                if (iface_kind === 'workflow') {
                    addField('base-class-name');
                    addField('lang');
                }
                break;
            case 'base-class-name':
                if (iface_kind === 'workflow') {
                    addField('class-name');
                    addField('lang');
                }
                break;
            case 'lang':
                if (iface_kind === 'workflow') {
                    addField('class-name');
                    addField('base-class-name');
                }
                break;
            case 'processor':
                if (iface_kind === 'class') {
                    addField('base-class-name');
                }
                break;
        }
    }

    static fieldRemoved({field, interface_info, ...other_params}) {
        const {iface_id, iface_kind} = other_params;

        const removeField = field =>
            qorus_webview.postMessage({ action: 'creator-remove-field', field, iface_id, iface_kind });

        const disableField = field =>
            qorus_webview.postMessage({ action: 'creator-disable-field', field, iface_id, iface_kind });

        switch(field) {
            case 'base-class-name':
                if (iface_kind === 'workflow') {
                    removeField('class-name');
                    removeField('lang');
                }
                if (iface_kind === 'class') {
                    removeField('processor');
                }
                interface_info.removeBaseClass(other_params);
                interface_info.getConfigItems(other_params);
                break;
            case 'class-name':
                if (iface_kind === 'workflow') {
                    removeField('base-class-name');
                    removeField('lang');
                }
                break;
            case 'lang':
                if (iface_kind === 'workflow') {
                    removeField('base-class-name');
                    removeField('class-name');
                }
                break;
            case 'classes':
            case 'requires':
                interface_info.removeAllClasses(other_params);
                break;
            case 'valuetype':
                removeField('dateformat');
                disableField('dateformat');
                break;
            case 'status':
                removeField('retry-delay');
                disableField('retry-delay');
                break;
            case 'stateless':
                removeField('scaling-min-replicas');
                disableField('scaling-min-replicas');
                removeField('scaling-max-replicas');
                disableField('scaling-max-replicas');
                removeField('scaling-cpu');
                disableField('scaling-cpu');
                removeField('scaling-memory');
                disableField('scaling-memory');
                removeField('container-memory-request');
                disableField('container-memory-request');
                removeField('container-memory-limit');
                disableField('container-memory-limit');
                removeField('container-cpu-request');
                disableField('container-cpu-request');
                removeField('container-cpu-limit');
                disableField('container-cpu-limit');
                break;
        }
    }
}
