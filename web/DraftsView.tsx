import { Callout, Tab, Tabs } from '@blueprintjs/core';
import { capitalize, map, reduce } from 'lodash';
import React, { useContext, useState } from 'react';
import { useMount } from 'react-use';
import Box from './components/Box';
import { DraftsTable } from './components/DraftsTable';
import Loader from './components/Loader';
import Spacer from './components/Spacer';
import { Messages } from './constants/messages';
import { StyledHeader } from './containers/InterfaceCreator/tab';
import { DraftsContext } from './context/drafts';
import { InitialContext } from './context/init';
import { TextContext } from './context/text';
import { callBackendBasic } from './helpers/functions';

export const DraftsView = () => {
  const [categories, setCategories] = useState(null);
  const { addDraft } = useContext(DraftsContext);
  const { changeTab, subtab }: any = useContext(InitialContext);
  const [tab, setTab] = useState(subtab);
  const t = useContext(TextContext);

  useMount(() => {
    fetchCategories();
  });

  const fetchCategories = async () => {
    const fetchedDrafts = await callBackendBasic(Messages.GET_ALL_DRAFTS_WITH_COUNT);

    if (fetchedDrafts.ok) {
      setCategories(fetchedDrafts.data.drafts);
    }
  };

  if (!categories) {
    return <Loader text={t('Loading')} />;
  }

  return (
    <Box fill style={{ flexFlow: 'column', overflowY: 'auto' }}>
      <StyledHeader>
        <h2>
          {t('Drafts')} ({reduce(categories, (totalCount, count) => totalCount + count, 0)})
        </h2>
      </StyledHeader>
      <Callout intent="primary">{t('DraftsDescription')}</Callout>
      <Spacer size={20} />
      <Tabs id="draftTabs" selectedTabId={tab} onChange={(newTabId) => setTab(newTabId)} vertical>
        {map(categories, (count, iface) => (
          <Tab
            id={iface}
            title={`${capitalize(iface).replace(/-/g, ' ')} (${count})`}
            panel={
              <DraftsTable
                interfaceKind={iface}
                refreshCategories={fetchCategories}
                onClick={(interfaceId, draftData) => {
                  addDraft({
                    interfaceKind: iface,
                    interfaceId,
                    ...draftData,
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
