import React, { FunctionComponent } from 'react';
import compose from 'recompose/compose';
import Box from '../../components/Box';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import ClassConnectionsStateProvider from '../ClassConnectionsStateProvider';
import { ConnectionView } from './connection';
import FSMView from './fsm';
import LibraryView from './libraryView';
import MapperView from './mapperView';
import InterfaceCreatorPanel from './panel';
import Pipeline from './pipeline';
import ServicesView from './servicesView';
import Tab from './tab';
import TypeView from './typeView';
import WorkflowsView, { CreatorWrapper } from './workflowsView';

export interface ICreateInterface {
    initialData: any;
    onSubmit: any;
    context: any;
}

export const CreateInterface: FunctionComponent<ICreateInterface> = ({ initialData, onSubmit, context }) => {
    return (
        <Box fill style={{ overflow: 'hidden' }}>
            <div className={'fullHeightTabs'}>
                <Tab type={initialData.subtab}>
                    {initialData.subtab === 'fsm' && (
                        <FSMView fsm={initialData.fsm} onSubmitSuccess={onSubmit} interfaceContext={context} />
                    )}
                    {initialData.subtab === 'connection' && (
                        <ConnectionView
                            context={context}
                            onSubmitSuccess={onSubmit}
                            isEditing={!!initialData.connection}
                        />
                    )}
                    {initialData.subtab === 'pipeline' && (
                        <Pipeline
                            pipeline={initialData.pipeline}
                            onSubmitSuccess={onSubmit}
                            interfaceContext={context}
                        />
                    )}
                    {initialData.subtab === 'service' && (
                        <ServicesView
                            service={initialData.service}
                            onSubmitSuccess={onSubmit}
                            interfaceContext={context}
                        />
                    )}
                    {initialData.subtab === 'mapper-code' && (
                        <LibraryView
                            library={initialData.library}
                            onSubmitSuccess={onSubmit}
                            interfaceContext={context}
                        />
                    )}
                    {initialData.subtab === 'workflow' && (
                        <WorkflowsView
                            workflow={initialData.workflow}
                            onSubmitSuccess={onSubmit}
                            interfaceContext={context}
                        />
                    )}
                    {initialData.subtab === 'job' && (
                        <CreatorWrapper>
                            <ClassConnectionsStateProvider type="job">
                                {(classConnectionsProps) => (
                                    <InterfaceCreatorPanel
                                        hasClassConnections
                                        hasConfigManager
                                        context={context}
                                        onSubmitSuccess={onSubmit}
                                        type={'job'}
                                        data={initialData.job}
                                        isEditing={!!initialData.job}
                                        {...classConnectionsProps}
                                    />
                                )}
                            </ClassConnectionsStateProvider>
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'class' && (
                        <CreatorWrapper>
                            <InterfaceCreatorPanel
                                type={'class'}
                                context={context}
                                data={initialData.class}
                                isEditing={!!initialData.class}
                                hasConfigManager
                                onSubmitSuccess={onSubmit}
                                definitionsOnly
                            />
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'step' && (
                        <CreatorWrapper>
                            <ClassConnectionsStateProvider type="step">
                                {(classConnectionsProps) => (
                                    <InterfaceCreatorPanel
                                        type={'step'}
                                        data={initialData.step}
                                        hasClassConnections
                                        hasConfigManager
                                        context={context}
                                        onSubmitSuccess={onSubmit}
                                        isEditing={!!initialData.step}
                                        openFileOnSubmit={!onSubmit}
                                        forceSubmit
                                        {...classConnectionsProps}
                                    />
                                )}
                            </ClassConnectionsStateProvider>
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'mapper' && (
                        <MapperView onSubmitSuccess={onSubmit} interfaceContext={context} />
                    )}
                    {initialData.subtab === 'group' && (
                        <CreatorWrapper>
                            <InterfaceCreatorPanel
                                type={'group'}
                                onSubmitSuccess={onSubmit}
                                data={initialData.group}
                            />
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'event' && (
                        <CreatorWrapper>
                            <InterfaceCreatorPanel
                                type={'event'}
                                onSubmitSuccess={onSubmit}
                                data={initialData.event}
                            />
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'queue' && (
                        <CreatorWrapper>
                            <InterfaceCreatorPanel
                                type={'queue'}
                                onSubmitSuccess={onSubmit}
                                data={initialData.queue}
                            />
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'type' && <TypeView onSubmitSuccess={onSubmit} />}
                </Tab>
            </div>
        </Box>
    );
};

export default compose(withTextContext(), withInitialDataConsumer())(CreateInterface);
