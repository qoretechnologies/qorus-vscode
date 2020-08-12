export const MENU = {
    ProjectConfig: [
        {
            name: 'ProjectConfig',
            icon: 'home',
            tab: 'ProjectConfig',
        },
    ],
    ReleasePackage: [
        {
            name: 'ReleasePackage',
            icon: 'cube',
            tab: 'ReleasePackage',
        },
    ],
    DeleteInterfaces: [
        {
            name: 'DeleteInterfaces',
            icon: 'trash',
            tab: 'DeleteInterfaces',
        },
    ],
    CreateInterface: [
        {
            name: 'CreateInterface',
            icon: 'new-object',
            tab: 'CreateInterface',
            submenu: [
                { name: 'Workflow', icon: 'exchange', tab: 'CreateInterface', subtab: 'workflow' },
                { name: 'Service', icon: 'merge-links', tab: 'CreateInterface', subtab: 'service' },
                { name: 'Job', icon: 'calendar', tab: 'CreateInterface', subtab: 'job' },
                { name: 'Step', icon: 'diagram-tree', tab: 'CreateInterface', subtab: 'step' },
                { name: 'Class', icon: 'code-block', tab: 'CreateInterface', subtab: 'class' },
                { name: 'Mapper', icon: 'layout-group-by', tab: 'CreateInterface', subtab: 'mapper' },
                { name: 'Mapper Code', icon: 'function', tab: 'CreateInterface', subtab: 'mapper-code' },
                { name: 'Type', icon: 'asterisk', tab: 'CreateInterface', subtab: 'type' },
                { name: 'Pipeline', icon: 'graph', tab: 'CreateInterface', subtab: 'pipeline' },
                { name: 'FiniteStateMachine', icon: 'layout', tab: 'CreateInterface', subtab: 'fsm' },
                { name: 'Other', icon: 'more', tab: 'CreateInterface', subtab: 'other' },
            ],
        },
    ],
};
