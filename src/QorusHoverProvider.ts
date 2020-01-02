import { t } from 'ttag';
import {
    CancellationToken, Hover, HoverProvider,
    MarkdownString, Position, TextDocument
y} from 'vscode';

import { projects } from './QorusProject';
import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';
import { getFilePathFromUri } from './qorus_utils';
import { qore_vscode } from './qore_vscode';

export abstract class QorusHoverProviderBase implements HoverProvider {
    protected code_info: QorusProjectCodeInfo = undefined;

    abstract async provideHoverImpl(document: TextDocument, position: Position): Promise<Hover|undefined>;

    async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover|undefined> {
        this.code_info = projects.currentProjectCodeInfo();
        return this.code_info.waitForPending(['yaml']).then(() => this.provideHoverImpl(document, position));
    }

    isFileClass = (symbol, yaml_info) =>
        symbol.kind === 5 &&
        symbol.name === yaml_info['class-name'];

    isMethod = (symbol) => symbol.kind === 6;

    prepareBoolParam(header: string, param: any, def: boolean): string {
        return '\n\n**' + header + ':** `' + (param !== undefined ? param : def) + '`';
    }

    prepareIntParam(header: string, param: any): string {
        return param ? '\n\n**' + header + ':** `' + param + '`' : '';
    }

    prepareIntParamDefault(header: string, param: any, def: number): string {
        return '\n\n**' + header + ':** `' + (param !== undefined ? param : def) + '`';
    }

    prepareStringParam(header: string, param: any): string {
        return param ? '\n\n**' + header + ':** ' + param : '';
    }

    prepareListParam(header: string, param: any): string {
        return param ? '\n\n**' + header + ':** ' + param.join(', ') : '';
    }

    prepareHashParam(header: string, param: any): string {
        return param ? '\n\n**' + header + ':** ' + param.keys().join(', ') : '';
    }

    prepareCommonParams(yaml_info: any, type: string): string {
        return '**' + type + ': _' + yaml_info.name
            + '_** (ver: ' + yaml_info.version + ')'
            + (yaml_info.desc ? '\n\n> ' + yaml_info.desc : '')
            + this.prepareListParam(t`Authors`, yaml_info.author);
    }

    prepareBasicListParams(yaml_info: any): string {
        return this.prepareListParam(t`Modules`, yaml_info.modules)
            +  this.prepareListParam(t`Classes`, yaml_info.classes)
            +  this.prepareListParam(t`Constants`, yaml_info.constants)
            +  this.prepareListParam(t`Functions`, yaml_info.functions)
            +  this.prepareListParam(t`Mappers`, yaml_info.mappers)
            +  this.prepareListParam(t`ValueMaps`, yaml_info.vmaps)
            +  this.prepareListParam(t`Groups`, yaml_info.groups);
    }

    prepareClassInfoString(yaml_info: any): string {
        return this.prepareCommonParams(yaml_info, t`Class`)
            +  this.prepareListParam(t`Requires`, yaml_info.requires)
            +  this.prepareHashParam(t`Tags`, yaml_info.tags);
    }

    prepareJobInfoString(yaml_info: any): string {
        return this.prepareCommonParams(yaml_info, t`Job`)
            +  this.prepareBoolParam(t`Remote`, yaml_info.remote, true)
            +  this.prepareBoolParam(t`Active`, yaml_info.active, true)
            +  this.prepareBoolParam(t`RunSkipped`, yaml_info['run-skipped'], false)
            +  this.prepareBoolParam(t`SingleInstance`, yaml_info['single-instance'], false)
            +  this.prepareBasicListParams(yaml_info)
            +  this.prepareHashParam(t`Tags`, yaml_info.tags);
    }

    prepareServiceInfoString(yaml_info: any): string {
        return this.prepareCommonParams(yaml_info, t`Service`)
            +  this.prepareStringParam(t`ServiceType`, yaml_info.servicetype)
            +  this.prepareBoolParam(t`Remote`, yaml_info.remote, true)
            +  this.prepareBoolParam(t`Autostart`, yaml_info.autostart, false)
            +  this.prepareBasicListParams(yaml_info)
            +  this.prepareListParam(t`Resources`, yaml_info.resource)
            +  this.prepareListParam(t`TextResources`, yaml_info['text-resource'])
            +  this.prepareListParam(t`BinaryResources`, yaml_info['bin-resource'])
            +  this.prepareListParam(t`Templates`, yaml_info.template)
            +  this.prepareHashParam(t`Tags`, yaml_info.tags);
    }

    prepareStepInfoString(yaml_info: any): string {
        return this.prepareCommonParams(yaml_info, t`Step`)
            +  this.prepareStringParam(t`Queue`, yaml_info.queue)
            +  this.prepareStringParam(t`Event`, yaml_info.event)
            +  this.prepareBoolParam(t`UserInteraction`, yaml_info['user-interaction'], false)
            +  this.prepareBasicListParams(yaml_info)
            +  this.prepareHashParam(t`Tags`, yaml_info.tags);
    }

    prepareWorkflowInfoString(yaml_info: any): string {
        return this.prepareCommonParams(yaml_info, t`Workflow`)
            +  this.prepareBoolParam(t`Remote`, yaml_info.remote, true)
            +  this.prepareIntParamDefault(t`Autostart`, yaml_info.autostart, 1)
            +  this.prepareIntParam(t`MaxInstances`, yaml_info.max_instances)
            +  this.prepareIntParamDefault(t`SLAThreshold`, yaml_info.sla_threshold, 1800)
            +  this.prepareBasicListParams(yaml_info)
            +  this.prepareStringParam(t`Attach`, yaml_info.attach)
            +  this.prepareStringParam(t`Detach`, yaml_info.detach)
            +  this.prepareStringParam(t`OneTimeInit`, yaml_info.onetimeinit)
            +  this.prepareStringParam(t`ErrorHandler`, yaml_info.error_handler)
            +  this.prepareStringParam(t`Errors`, yaml_info.errors)
            +  this.prepareHashParam(t`Tags`, yaml_info.tags);
    }

    prepareInterfaceInfoString(yaml_info: any): string {
        switch (yaml_info.type) {
            case 'class':
                return this.prepareClassInfoString(yaml_info);
            case 'job':
                return this.prepareJobInfoString(yaml_info);
            case 'service':
                return this.prepareServiceInfoString(yaml_info);
            case 'step':
                return this.prepareStepInfoString(yaml_info);
            case 'workflow':
                return this.prepareWorkflowInfoString(yaml_info);
            default:
                return '';
        }
    }

    prepareCodeClassInfoString(yaml_info: any): string {
        let methods = '';
        for (const m of yaml_info.methods || []) {
            methods += '\n\n- `' + m.name + '()`';
        }
        return '**' + t`Class` + ' _' + yaml_info['class-name'] + '_**\n\n**'
            +  t`Methods` + ':**\n\n'
            +  (methods ? methods : '_(' + t`NoMethodsDescribed` + ')_');
    }

    createClassHover(symbol, yaml_info) {
        const markdown = new MarkdownString(
            this.prepareInterfaceInfoString(yaml_info) + '\n\n---\n\n' +
            this.prepareCodeClassInfoString(yaml_info)
        );
        markdown.isTrusted = true;
        return new Hover(markdown);
    }

    createMethodHover(symbol, yaml_info) {
        const methodName = symbol.name.replace(/\(.*\)/, '');
        let method;
        for (const m of yaml_info.methods || []) {
            if (m.name === methodName) {
                method = m;
                break;
            }
        }
        if (method) {
            const markdown = new MarkdownString(method.desc);
            markdown.isTrusted = true;
            return new Hover(markdown);
        }
        return new Hover('(' + t`NoDescriptionFound` + ')');
    }
}

export class QorusHoverProvider extends QorusHoverProviderBase {
    isSearchedSymbol = (symbol, position) =>
        symbol.location.range.start.line === position.line &&
        symbol.location.range.start.character <= position.character &&
        symbol.location.range.end.character > position.character

    async provideHoverImpl(document: TextDocument, position: Position): Promise<Hover|undefined> {
        let symbols = await qore_vscode.exports.getDocumentSymbols(document);

        const filePath = getFilePathFromUri(document.uri);
        const yaml_info = this.code_info.yamlDataBySrcFile(filePath);
        if (!yaml_info) {
            return undefined;
        }

        for (const symbol of symbols) {
            if (this.isSearchedSymbol(symbol, position)) {
                if (this.isFileClass(symbol, yaml_info)) {
                    return this.createClassHover(symbol, yaml_info);
                }
                if (this.isMethod(symbol)) {
                    return this.createMethodHover(symbol, yaml_info);
                }
            }
        }

        return undefined;
    }
}
