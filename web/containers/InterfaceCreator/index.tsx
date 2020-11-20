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
                        <FSMView
                            fsm={initialData.fsm}
                            onSubmitSuccess={onSubmit}
                            interfaceContext={context}
                            key={initialData?.fsm?.iface_id}
                        />
                    )}
                    {initialData.subtab === 'connection' && (
                        <ConnectionView
                            context={context}
                            onSubmitSuccess={onSubmit}
                            isEditing={!!initialData.connection}
                            key={initialData?.connection?.iface_id}
                        />
                    )}
                    {initialData.subtab === 'pipeline' && (
                        <Pipeline
                            pipeline={initialData.pipeline}
                            onSubmitSuccess={onSubmit}
                            interfaceContext={context}
                            key={initialData?.pipeline?.iface_id}
                        />
                    )}
                    {initialData.subtab === 'service' && (
                        <ServicesView
                            service={initialData.service}
                            onSubmitSuccess={onSubmit}
                            interfaceContext={context}
                            key={initialData?.service?.iface_id}
                        />
                    )}
                    {initialData.subtab === 'mapper-code' && (
                        <LibraryView
                            library={initialData.library}
                            onSubmitSuccess={onSubmit}
                            interfaceContext={context}
                            key={initialData?.['mapper-code']?.iface_id}
                        />
                    )}
                    {initialData.subtab === 'workflow' && (
                        <WorkflowsView
                            workflow={initialData.workflow}
                            onSubmitSuccess={onSubmit}
                            interfaceContext={context}
                            key={initialData?.workflow?.iface_id}
                        />
                    )}
                    {initialData.subtab === 'job' && (
                        <CreatorWrapper>
                            <ClassConnectionsStateProvider type="job" key={initialData?.job?.iface_id}>
                                {(classConnectionsProps) => (
                                    <InterfaceCreatorPanel
                                        hasClassConnections
                                        hasConfigManager
                                        context={context}
                                        onSubmitSuccess={onSubmit}
                                        type={'job'}
                                        data={initialData.job}
                                        isEditing={!!initialData.job}
                                        key={initialData?.job?.iface_id}
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
                                key={initialData?.['class']?.iface_id}
                            />
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'step' && (
                        <CreatorWrapper>
                            <ClassConnectionsStateProvider type="step" key={initialData?.step?.iface_id}>
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
                                        key={initialData?.step?.iface_id}
                                        {...classConnectionsProps}
                                    />
                                )}
                            </ClassConnectionsStateProvider>
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'mapper' && (
                        <MapperView
                            onSubmitSuccess={onSubmit}
                            interfaceContext={context}
                            key={initialData?.mapper?.iface_id}
                        />
                    )}
                    {initialData.subtab === 'group' && (
                        <CreatorWrapper>
                            <InterfaceCreatorPanel
                                type={'group'}
                                onSubmitSuccess={onSubmit}
                                data={initialData.group}
                                key={initialData?.group?.iface_id}
                            />
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'event' && (
                        <CreatorWrapper>
                            <InterfaceCreatorPanel
                                type={'event'}
                                onSubmitSuccess={onSubmit}
                                data={initialData.event}
                                key={initialData?.event?.iface_id}
                            />
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'queue' && (
                        <CreatorWrapper>
                            <InterfaceCreatorPanel
                                type={'queue'}
                                onSubmitSuccess={onSubmit}
                                data={initialData.queue}
                                key={initialData?.queue?.iface_id}
                            />
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'value-map' && (
                        <CreatorWrapper>
                            <InterfaceCreatorPanel
                                type={'value-map'}
                                onSubmitSuccess={onSubmit}
                                data={initialData['value-map']}
                                key={initialData?.['value-map']?.iface_id}
                            />
                        </CreatorWrapper>
                    )}
                    {initialData.subtab === 'type' && (
                        <TypeView onSubmitSuccess={onSubmit} key={initialData?.type?.iface_id} />
                    )}
                </Tab>
            </div>
        </Box>
    );
};

export default compose(withTextContext(), withInitialDataConsumer())(CreateInterface);
