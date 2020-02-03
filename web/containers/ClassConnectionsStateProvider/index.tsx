import React, { useState, useEffect } from 'react';
import { IClassConnections } from '../ClassConnectionsManager';
import { IField } from '../InterfaceCreator/panel';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import compose from 'recompose/compose';
import withMethodsConsumer from '../../hocomponents/withMethodsConsumer';
import size from 'lodash/size';
import reduce from 'lodash/reduce';

const removeMethodTriggers = (methods, connectionData) =>
    connectionData.reduce((newData, connector) => {
        const newConnector = { ...connector };
        // Check if this connector has a trigger
        if (newConnector.trigger) {
            // Check if the trigger is in the methods
            if (methods.find(method => method.name === newConnector.trigger)) {
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

const ClassConnectionsStateProvider = ({ selectedFields, type, children, initialData, methods }) => {
    const [showClassConnectionsManager, setShowClassConnectionsManager] = useState<boolean>(false);
    const [classConnectionsData, setClassConnectionsData] = useState<IClassConnections>(
        initialData[type]?.['class-connections']
    );
    const [methodsCount, setMethodsCount] = useState<number>(null);

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
                            return { ...newConnections, [connName]: removeMethodTriggers(methods, connectionData) };
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

    const resetClassConnections = () => {
        setClassConnectionsData(null);
    };

    const isClassConnectionsManagerEnabled = () => {
        // Find the base class name field
        const classes: IField = selectedFields[type].find((field: IField) => field.name === 'classes');
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
    });
};

export default compose(
    withInitialDataConsumer(),
    withFieldsConsumer(),
    withMethodsConsumer()
)(ClassConnectionsStateProvider);
