import { join } from 'path';
import { Uri } from 'vscode';

const IconsDirRelPath = join('/images/icons');
const DarkIconsDirRelPath = join(IconsDirRelPath, 'dark');
const LightIconsDirRelPath = join(IconsDirRelPath, 'light');

const ClassIconName = 'class.svg';
const ConnectionIconName = 'connection.svg';
const ConstantIconName = 'function.svg';
const ErrorIconName = 'error.svg';
const EventIconName = 'event.svg';
const FolderIconName = 'folder.svg';
const FunctionIconName = 'function.svg';
const GroupIconName = 'group.svg';
const InterfaceIconName = 'interface.svg';
const JobIconName = 'job.svg';
const MapperCodeIconName = 'mapper-code.svg';
const MapperIconName = 'mapper.svg';
const PackageIconName = 'package.svg';
const QueueIconName = 'queue.svg';
const ServiceIconName = 'service.svg';
const StepIconName = 'step.svg';
const ValueMapIconName = 'value-map.svg';
const WorkflowIconName = 'workflow.svg';
const FsmIconName = 'fsm.svg';


export class QorusIcons  {
    private classIcon;
    private connectionIcon;
    private constantIcon;
    private errorIcon;
    private eventIcon;
    private folderIcon;
    private functionIcon;
    private groupIcon;
    private interfaceIcon;
    private jobIcon;
    private mapperCodeIcon;
    private mapperIcon;
    private packageIcon;
    private queueIcon;
    private serviceIcon;
    private stepIcon;
    private valueMapIcon;
    private workflowIcon;
    private fsmIcon;

    constructor() {
    }

    update(extensionPath: string) {
        this.classIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, ClassIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, ClassIconName))
        };
        this.connectionIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, ConnectionIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, ConnectionIconName))
        };
        this.constantIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, ConstantIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, ConstantIconName))
        };
        this.errorIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, ErrorIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, ErrorIconName))
        };
        this.eventIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, EventIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, EventIconName))
        };
        this.folderIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, FolderIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, FolderIconName))
        };
        this.functionIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, FunctionIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, FunctionIconName))
        };
        this.groupIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, GroupIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, GroupIconName))
        };
        this.interfaceIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, InterfaceIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, InterfaceIconName))
        };
        this.jobIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, JobIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, JobIconName))
        };
        this.mapperCodeIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, MapperCodeIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, MapperCodeIconName))
        };
        this.mapperIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, MapperIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, MapperIconName))
        };
        this.packageIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, PackageIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, PackageIconName))
        };
        this.queueIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, QueueIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, QueueIconName))
        };
        this.serviceIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, ServiceIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, ServiceIconName))
        };
        this.stepIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, StepIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, StepIconName))
        };
        this.valueMapIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, ValueMapIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, ValueMapIconName))
        };
        this.workflowIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, WorkflowIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, WorkflowIconName))
        };
        this.fsmIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, FsmIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, FsmIconName))
        };
    }

    getClassIcon() {
        return this.classIcon;
    }

    getConnectionIcon() {
        return this.connectionIcon;
    }

    getConstantIcon() {
        return this.constantIcon;
    }

    getErrorIcon() {
        return this.errorIcon;
    }

    getEventIcon() {
        return this.eventIcon;
    }

    getFolderIcon() {
        return this.folderIcon;
    }

    getFunctionIcon() {
        return this.functionIcon;
    }

    getGroupIcon() {
        return this.groupIcon;
    }

    getInterfaceIcon() {
        return this.interfaceIcon;
    }

    getJobIcon() {
        return this.jobIcon;
    }

    getMapperCodeIcon() {
        return this.mapperCodeIcon;
    }

    getMapperIcon() {
        return this.mapperIcon;
    }

    getPackageIcon() {
        return this.packageIcon;
    }

    getQueueIcon() {
        return this.queueIcon;
    }

    getServiceIcon() {
        return this.serviceIcon;
    }

    getStepIcon() {
        return this.stepIcon;
    }

    getValueMapIcon() {
        return this.valueMapIcon;
    }

    getWorkflowIcon() {
        return this.workflowIcon;
    }

    getFsmIcon() {
        return this.fsmIcon;
    }
}

export const qorusIcons = new QorusIcons();
