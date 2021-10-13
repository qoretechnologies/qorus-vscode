import { Callout, Tab, Tabs } from '@blueprintjs/core';
import { capitalize } from 'lodash';
import React, { useContext } from 'react';
import Box from './components/Box';
import { DraftsTable } from './components/DraftsTable';
import { StyledHeader } from './containers/InterfaceCreator/tab';
import { DraftsContext } from './context/drafts';
import { InitialContext } from './context/init';
import { TextContext } from './context/text';

const interfaces = ['workflow', 'job', 'service', 'step', 'class'];

export const DraftsView = () => {
    const { addDraft } = useContext(DraftsContext);
    const { changeTab }: any = useContext(InitialContext);
    const t = useContext(TextContext);

    return (
        <Box fill style={{ flexFlow: 'column', overflowY: 'auto' }}>
            <StyledHeader>
                <h2>{t('Drafts')}</h2>
            </StyledHeader>
            <Callout intent="primary">{t('DraftsDescription')}</Callout>
            <Tabs id="draftTabs">
                {interfaces.map((iface) => (
                    <Tab
                        id={iface}
                        title={capitalize(iface)}
                        panel={
                            <DraftsTable
                                interfaceKind={iface}
                                onClick={(interfaceId, data, methods) => {
                                    addDraft({
                                        interfaceKind: iface,
                                        interfaceId,
                                        fields: data,
                                        methods,
                                    });
                                    changeTab('CreateInterface', iface);
                                }}
                            />
                        }
                    />
                ))}
            </Tabs>
        </Box>
    );
};
