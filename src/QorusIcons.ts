import { join } from 'path';
import { Uri } from 'vscode';

const IconsDirRelPath = join('/images/icons');
const DarkIconsDirRelPath = join(IconsDirRelPath, 'dark');
const LightIconsDirRelPath = join(IconsDirRelPath, 'light');

const ErrorsIconName = 'warning-sign.svg';
const ClassIconName = 'code-block.svg';
const ConnectionIconName = 'link.svg';
const EventIconName = 'notifications.svg';
const FolderIconName = 'folder.svg';
const GroupIconName = 'group-objects.svg';
const InterfaceIconName = 'interface.svg';
const JobIconName = 'calendar.svg';
const MapperCodeIconName = 'function.svg';
const MapperIconName = 'layout-group-by.svg';
const PackageIconName = 'package.svg';
const QueueIconName = 'list.svg';
const ServiceIconName = 'merge-links.svg';
const StepIconName = 'diagram-tree.svg';
const TypeIconName = 'asterisk.svg';
const ValueMapIconName = 'join-table.svg';
const WorkflowIconName = 'exchange.svg';
const FsmIconName = 'layout.svg';
const PipelineIconName = 'graph.svg';

export class QorusIcons {
    private classIcon;
    private connectionIcon;
    private errorsIcon;
    private eventIcon;
    private folderIcon;
    private groupIcon;
    private interfaceIcon;
    private jobIcon;
    private mapperCodeIcon;
    private mapperIcon;
    private packageIcon;
    private queueIcon;
    private serviceIcon;
    private stepIcon;
    private typeIcon;
    private valueMapIcon;
    private workflowIcon;
    private fsmIcon;
    private pipelineIcon;

    constructor() {}

    update(extensionPath: string) {
        this.classIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, ClassIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, ClassIconName)),
        };
        this.connectionIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, ConnectionIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, ConnectionIconName)),
        };
        this.errorsIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, ErrorsIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, ErrorsIconName)),
        };
        this.eventIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, EventIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, EventIconName)),
        };
        this.folderIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, FolderIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, FolderIconName)),
        };
        this.groupIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, GroupIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, GroupIconName)),
        };
        this.interfaceIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, InterfaceIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, InterfaceIconName)),
        };
        this.jobIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, JobIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, JobIconName)),
        };
        this.mapperCodeIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, MapperCodeIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, MapperCodeIconName)),
        };
        this.mapperIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, MapperIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, MapperIconName)),
        };
        this.packageIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, PackageIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, PackageIconName)),
        };
        this.queueIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, QueueIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, QueueIconName)),
        };
        this.serviceIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, ServiceIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, ServiceIconName)),
        };
        this.stepIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, StepIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, StepIconName)),
        };
        this.typeIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, TypeIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, TypeIconName)),
        };
        this.valueMapIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, ValueMapIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, ValueMapIconName)),
        };
        this.workflowIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, WorkflowIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, WorkflowIconName)),
        };
        this.fsmIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, FsmIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, FsmIconName)),
        };
        this.pipelineIcon = {
            dark: Uri.file(join(extensionPath, DarkIconsDirRelPath, PipelineIconName)),
            light: Uri.file(join(extensionPath, LightIconsDirRelPath, PipelineIconName)),
        };
    }

    getClassIcon() {
        return this.classIcon;
    }

    getConnectionIcon() {
        return this.connectionIcon;
    }

    getErrorsIcon() {
        return this.errorsIcon;
    }

    getErrorIcon() {
        return this.errorsIcon;
    }

    getEventIcon() {
        return this.eventIcon;
    }

    getFolderIcon() {
        return this.folderIcon;
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

    getMappercodeIcon() {
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

    getTypeIcon() {
        return this.typeIcon;
    }

    getValueMapIcon() {
        return this.valueMapIcon;
    }

    getValuemapIcon() {
        return this.valueMapIcon;
    }

    getWorkflowIcon() {
        return this.workflowIcon;
    }

    getFsmIcon() {
        return this.fsmIcon;
    }

    getPipelineIcon() {
        return this.pipelineIcon;
    }
}

export const qorusIcons = new QorusIcons();
