import {
  ReqoreH3,
  ReqoreMessage,
  ReqorePanel,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { capitalize, map, reduce } from 'lodash';
import { useContext, useState } from 'react';
import { useMount } from 'react-use';
import { DraftsTable } from './components/DraftsTable';
import Loader from './components/Loader';
import { Messages } from './constants/messages';
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
    <ReqorePanel
      minimal
      flat
      transparent
      fill
      label={t('Drafts')}
      badge={reduce(categories, (totalCount, count) => totalCount + count, 0)}
      contentStyle={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ReqoreMessage intent="info">{t('DraftsDescription')}</ReqoreMessage>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreTabs
        id="draftTabs"
        activeTab={tab}
        activeTabIntent="info"
        onTabChange={(newTabId) => setTab(newTabId)}
        vertical
        fillParent
        tabs={map(categories, (count, iface) => ({
          id: iface,
          badge: count,
          label: `${capitalize(iface).replace(/-/g, ' ')}`,
        }))}
      >
        {map(categories, (_count, iface) => (
          <ReqoreTabsContent tabId={iface}>
            <ReqoreH3>{`${capitalize(iface).replace(/-/g, ' ')}`} drafts</ReqoreH3>
            <ReqoreVerticalSpacer height={10} />
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
          </ReqoreTabsContent>
        ))}
      </ReqoreTabs>
    </ReqorePanel>
  );
};
