import * as vscode from 'vscode';
import { t } from 'ttag';
import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken } from 'vscode';
import * as request from 'request-promise';
import { qorus_request } from './QorusRequest';
import * as msg from './qorus_message';

let qore_vscode = vscode.extensions.getExtension('qoretechnologies.qore-vscode');

export function pickInterface(config: DebugConfiguration) {
    const {ok, active_instance, token} = qorus_request.activeQorusInstanceAndToken();
    if (!ok) {
        throw new Error(t`Aborted`);
    }
    // list interfaces
    const options = {
        method: 'GET',
        uri: `${active_instance.url}/api/latest/${config.kind}s`,
        strictSSL: false,
        headers: {
            'qorus-token': token
        },
        json: true
    };
    return request(options).then(
        (response: any) => {
            let items: string[] = [];
            for (let iface of response) {
                items.push(iface.name + ":" + iface.version);
            }
            msg.log(t`requestResponse ${JSON.stringify(response)}`);
            return vscode.window.showQuickPick(items, {
                canPickMany: false,
                placeHolder: t`PickInterfacePlaceHolder ${config.kind} ${config.kind}`,
            }).then( name => {
                return name;
            } );
        },
        (error: any) => {
            throw new Error(error.message);
        }
    );
}

export class QorusConfigurationProvider implements vscode.DebugConfigurationProvider {
    /**
        Massage a debug configuration just before a debug session is being launched,
        e.g. add all missing attributes to the debug configuration.
        Commands ${command:xxx} are invoked by vscode and value is substituted
     */
    resolveDebugConfiguration(_folder: WorkspaceFolder | undefined, config: DebugConfiguration, _token?: CancellationToken): ProviderResult<DebugConfiguration> {
        const {ok, active_instance, token} = qorus_request.activeQorusInstanceAndToken();
        if (!ok) {
            throw new Error(t`Aborted`);
        }
        config.active_instance = active_instance;
        config.token = token;
        return config;
    }
}

export class QorusDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {

    createDebugAdapterDescriptor(session: vscode.DebugSession, _executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        let config = session.configuration;
        // prepare qore-vscode configuration, mainly we need resolve URL for remote interface

        // we need resolve interface name to adjust connection in case the interface is remote
        // interface might be in <name>, <name>:<version>, <interface_id> form

        const options = {
            method: 'GET',
            uri: `${config.active_instance.url}/api/latest/${config.kind}s/${config.interface}`,
            strictSSL: false,
            headers: {
                'qorus-token': config.token
            },
            json: true
        };
        return request(options).then(
            (response: any) => {
                let qoreConfig = <DebugConfiguration>{};
                qoreConfig.type = "qore";
                qoreConfig.name = config.name;
                qoreConfig.request = "attach";
                qoreConfig.connection = config.active_instance.url.replace(/^http/i, "ws") + "/debug";
                if (config.token) {
                    qoreConfig.headers = [ {"name": "qorus-token", "value": config.token} ];
                }

                if (response.remote) {
                    if (response.process !== null) {
                        qoreConfig.connection = qoreConfig.connection + "/" + response.process.id;
                    } else {
                        throw new Error(t`CannotGetRemoteUrl`);
                    }
                }
                for (const key of ["logFilename", "appendToLog", "fullException", "verbosity", "maxRedir",
                    "proxy", "timeout", "connTimeout", "respTimeout"]) {
                    if (typeof config[key] !== "undefined") {
                        qoreConfig[key] = config[key];
                    }
                }
                msg.info(t`Connecting ${qoreConfig.connection}`);
                qoreConfig.program = response.name+":"+response.version;
                let s: string = config.kind + " #" + response[config.kind + "id"] + ": " + qoreConfig.program;
                msg.info(s);
                let qoreExecutable = qore_vscode.exports.getQoreExecutable();
                let args: string[] = qore_vscode.exports.getExecutableArguments(qoreConfig);
                /*
                Unless we create new debugger then we cannot override config used by debuger for attach program.
                It is about substituteVariables to do it properly. Even session is passed apparently
                by reference in case of object then modification has not effect and no program is passed to adapter.
                So we use workaround and we pass program name at command line which is used if no program appears
                in attach request
                */
                session.configuration.program = qoreConfig.program;
                args.push("--program");
                args.push(qoreConfig.program);
                console.log(qoreExecutable + " " + args.join(" "));
                console.log(s);
                return new vscode.DebugAdapterExecutable(qoreExecutable, args);
            },
            (error: any) => {
                throw new Error(error.message);
            }
        );
        return null;
    }
}
