import React, { useState } from 'react';
import withMessageHandler from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import SidePanel from '../../components/SidePanel';
import { ContentWrapper, ActionsWrapper } from '../InterfaceCreator/panel';
import { MethodSelector, Selected, RemoveButton } from '../InterfaceCreator/servicesView';
import { ButtonGroup, Button, Dialog, ControlGroup } from '@blueprintjs/core';
import map from 'lodash/map';
import compose from 'recompose/compose';
import { PanelWrapper } from '../InterfaceCreator/servicesView';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import String from '../../components/Field/string';
import styled from 'styled-components';
import { validateField } from '../../helpers/validations';
import ClassConnectionsDiagram from './diagram';
import { TTranslator } from '../../App';

export const StyledDialogBody = styled.div`
    padding: 20px 20px 0 20px;
    margin: 0;
`;

export interface IClassConnections {
    [key: string]: IClassConnection[];
}

export interface IClassConnection {
    class?: string;
    prefix?: string;
    connector?: string;
    mapper?: string;
}

export interface IClassConnectionsManageDialog {
    isOpen?: boolean;
    name?: string;
}

export interface IClassConnectionsManagerProps {
    classes: any;
    t: TTranslator;
    initialData: any;
}

const ClassConnectionsManager: React.FC<IClassConnectionsManagerProps> = ({ t, initialData, classes }) => {
    const [connections, setConnections] = useState<IClassConnections>({});
    const [selectedConnection, setSelectedConnection] = useState(null);
    const [manageDialog, setManageDialog] = useState<IClassConnectionsManageDialog>({});

    const handleAddConnector: (name: string, data: IClassConnection) => void = (name, data) => {
        setConnections(
            (current: IClassConnections): IClassConnections => ({
                ...current,
                [name]: [...current[name], data],
            })
        );
    };

    const isConnectionValid = (name: string) => {
        return false;
    };

    console.log('kek');

    return (
        <>
            <Dialog title={t('AddConnection')} isOpen={manageDialog.isOpen} onClose={() => setManageDialog({})}>
                <StyledDialogBody>
                    <ControlGroup fill>
                        <String
                            name="connection"
                            placeholder={t('Name')}
                            value={manageDialog.name}
                            onChange={(fieldName, value) => setManageDialog(current => ({ ...current, name: value }))}
                        />
                        <Button
                            intent="success"
                            text={t('Submit')}
                            icon="small-tick"
                            disabled={!validateField('string', manageDialog.name) || !!connections[manageDialog.name]}
                            onClick={() => {
                                setConnections(
                                    (current: IClassConnections): IClassConnections => ({
                                        ...current,
                                        [manageDialog.name]: [],
                                    })
                                );
                                setManageDialog({});
                                setSelectedConnection(manageDialog.name);
                            }}
                        />
                    </ControlGroup>
                </StyledDialogBody>
            </Dialog>
            <PanelWrapper style={{ padding: '20px 20px 0 20px', margin: 0 }}>
                <SidePanel title={t('AddClassConnectionsTitle')}>
                    <ContentWrapper>
                        {map(connections, (connection, name: string) => (
                            <MethodSelector
                                key={name}
                                active={name === selectedConnection}
                                valid={isConnectionValid(name)}
                                onClick={() => setSelectedConnection(name)}
                            >
                                {name}
                                {name === selectedConnection && (
                                    <>
                                        <Selected />
                                    </>
                                )}
                                <RemoveButton
                                    onClick={() => {
                                        setConnections(current => {
                                            const result = { ...current };
                                            delete result[name];
                                            return result;
                                        });
                                    }}
                                />
                            </MethodSelector>
                        ))}
                    </ContentWrapper>
                    <ActionsWrapper>
                        <ButtonGroup fill>
                            <Button
                                text={t('AddConnection')}
                                icon={'plus'}
                                onClick={() => setManageDialog({ isOpen: true })}
                            />
                        </ButtonGroup>
                    </ActionsWrapper>
                </SidePanel>
                <ContentWrapper
                    style={{
                        background: `url(${
                            process.env.NODE_ENV === 'development'
                                ? `http://localhost:9876/images/tiny_grid.png`
                                : `vscode-resource:${initialData.path}/images/tiny_grid.png)`
                        }`,
                        padding: 10,
                    }}
                >
                    <div style={{ width: '100%', display: 'flex', flex: '1 1 auto', justifyContent: 'center' }}>
                        {selectedConnection && (
                            <ClassConnectionsDiagram
                                t={t}
                                classes={classes}
                                onAddConnector={handleAddConnector}
                                connection={connections[selectedConnection]}
                            />
                        )}
                    </div>
                </ContentWrapper>
            </PanelWrapper>
        </>
    );
};

export default compose(withMessageHandler(), withInitialDataConsumer(), withTextContext())(ClassConnectionsManager);
