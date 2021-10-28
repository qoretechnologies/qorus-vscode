import every from 'lodash/every';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import { useEffect, useState } from 'react';
import compose from 'recompose/compose';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withMethodsConsumer from '../../hocomponents/withMethodsConsumer';
import { IClassConnection, IClassConnections } from '../ClassConnectionsManager';
import { IField } from '../InterfaceCreator/panel';

const removeMethodTriggers = (methods, connectionData) =>
    connectionData.reduce((newData, connector) => {
        const newConnector = { ...connector };
        // Check if this connector has a trigger
        if (newConnector.trigger) {
            // Check if the trigger is in the methods
            if (methods.find((method) => method.name === newConnector.trigger)) {
                // Return unchanged
                return [...newData, newConnector];
            } else {
                // Remove the trigger and mapper
                delete newConnector.trigger;
                delete newConnector.mapper;
                // Return new connector
                return [...newData, newConnector];
            }
        }
        // Return unchanged connector
        return [...newData, newConnector];
    }, []);

const transformClassConnections = (connections: IClassConnections): IClassConnections => {
    return reduce(
        connections,
        (newConnections, data, name) => ({
            ...newConnections,
            [name.replace(/ /g, '')]: data,
        }),
        {}
    );
};

const ClassConnectionsStateProvider = ({
    selectedFields,
    type,
    children,
    initialData,
    methods,
}) => {
    const [showClassConnectionsManager, setShowClassConnectionsManager] = useState<boolean>(false);
    const [classConnectionsData, setClassConnectionsData] = useState<IClassConnections>(
        transformClassConnections(initialData[type]?.['class-connections'])
    );
    const [methodsCount, setMethodsCount] = useState<number>(null);

    const isConnectionValid = (name: string) => {
        if (classConnectionsData[name].length > 1) {
            return true;
        }
        // Check if there is only one connector
        // and has a trigger
        if (classConnectionsData[name].length === 1) {
            return !!classConnectionsData[name][0].trigger;
        }

        return false;
    };

    const areAllConnectionsValid = () => {
        return (
            size(classConnectionsData) === 0 ||
            every(classConnectionsData, (_conn, name) => isConnectionValid(name))
        );
    };

    useEffect(() => {
        // If this is service
        if (type === 'service' && methods) {
            // Check if the count was saved yet
            if (!methodsCount) {
                // Save the methods count
                setMethodsCount(size(methods));
            } else {
                // Else check if the size has changed and changed down
                // which means that a method was removed
                if (size(methods) !== methodsCount && size(methods) < methodsCount) {
                    // Map through the connections and removed the triggers that do not
                    // exist in the methods
                    const modifiedConnectionsData = reduce(
                        classConnectionsData,
                        (newConnections, connectionData, connName) => {
                            return {
                                ...newConnections,
                                [connName]: removeMethodTriggers(methods, connectionData),
                            };
                        },
                        {}
                    );
                    // Set the new connections
                    setClassConnectionsData(modifiedConnectionsData);
                }
                // Update the methods count
                setMethodsCount(size(methods));
            }
        }
    }, [methods, methodsCount, classConnectionsData, type]);

    const renameTrigger = (originalName: string, newName: string): void => {
        const modifiedConnectionsData = reduce(
            classConnectionsData,
            (newConnections: IClassConnections, connectionData: IClassConnection[], connName) => {
                // Go through this connections' connectors
                const modifiedConnection: IClassConnection[] = connectionData.reduce(
                    (newConnectionData: IClassConnection[], connector: IClassConnection) => {
                        // Check if the connector has trigger and that trigger matches the
                        // modified method name
                        if (connector.trigger && connector.trigger === originalName) {
                            return [...newConnectionData, { ...connector, trigger: newName }];
                        }
                        // Return unchanged connector
                        return [...newConnectionData, connector];
                    },
                    []
                );

                return { ...newConnections, [connName]: modifiedConnection };
            },
            {}
        );

        setClassConnectionsData(modifiedConnectionsData);
    };

    const resetClassConnections = () => {
        setClassConnectionsData(null);
    };

    const isClassConnectionsManagerEnabled = (interfaceIndex?: number) => {
        if (!initialData.qorus_instance) {
            return false;
        }
        // Find the base class name field
        const classes: IField = selectedFields[type][interfaceIndex].find(
            (field: IField) => field.name === 'classes'
        );
        // Check if the field exists
        if (classes) {
            // The field has to be selected and valid
            return classes.isValid;
        }
        // Not valid
        return false;
    };

    return children({
        showClassConnectionsManager,
        setShowClassConnectionsManager,
        classConnectionsData,
        setClassConnectionsData,
        resetClassConnections,
        isClassConnectionsManagerEnabled,
        renameTrigger,
        areClassConnectionsValid: areAllConnectionsValid,
    });
};

export default compose(
    withInitialDataConsumer(),
    withFieldsConsumer(),
    withMethodsConsumer()
)(ClassConnectionsStateProvider);
