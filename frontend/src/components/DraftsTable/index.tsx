import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreInput,
  ReqoreMessage,
  ReqoreVerticalSpacer,
  useReqore,
} from '@qoretechnologies/reqore';
import { TReqoreBadge } from '@qoretechnologies/reqore/dist/components/Button';
import timeago from 'epoch-timeago';
import { size, sortBy } from 'lodash';
import { useContext, useState } from 'react';
import { useMount } from 'react-use';
import { interfaceKindTransform } from '../../constants/interfaces';
import { Messages } from '../../constants/messages';
import { IDraftData } from '../../context/drafts';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import { callBackendBasic, deleteDraft } from '../../helpers/functions';

export const DraftsTable = ({ interfaceKind, onClick, lastDraft, refreshCategories }: any) => {
  const t = useContext(TextContext);
  const { changeDraft } = useContext(InitialContext);
  // Get the last draft from the initial data context
  const [drafts, setDrafts] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const { addNotification } = useReqore();

  useMount(() => {
    (async () => {
      const fetchedDrafts = await callBackendBasic(Messages.GET_DRAFTS, undefined, {
        iface_kind: interfaceKindTransform[interfaceKind],
      });

      if (fetchedDrafts.ok) {
        setDrafts(fetchedDrafts.data.drafts);
      }
    })();
  });

  const onDeleteClick = async (interfaceId) => {
    await deleteDraft(interfaceKindTransform[interfaceKind], interfaceId, false, addNotification);

    const fetchedDrafts = await callBackendBasic(Messages.GET_DRAFTS, undefined, {
      iface_kind: interfaceKindTransform[interfaceKind],
    });

    refreshCategories?.();

    if (fetchedDrafts.ok) {
      setDrafts(fetchedDrafts.data.drafts);
    }
  };

  const sortedDrafts = sortBy(drafts, (draft) => draft.date)
    .reverse()
    .filter((draft) => {
      return draft.name.toLowerCase().includes(query.toLowerCase());
    });

  // Function that returns true or false based on whether every field in the list is valid or not
  const isValid = (draftData: IDraftData) => {
    return draftData.isValid;
  };

  const buildBadges = (data): TReqoreBadge[] => {
    const badges: TReqoreBadge[] = [
      {
        labelKey: 'Fields',
        label: size(data.selectedFields),
      },
    ];

    if (size(data.selectedMethods) > 0) {
      badges.push({
        labelKey: 'Methods',
        label: size(data.selectedMethods),
      });
    }

    if (size(data.steps) > 0) {
      badges.push({
        labelKey: 'Steps',
        label: size(data.steps.steps),
      });
    }

    badges.push({
      labelKey: 'Status',
      label: t(isValid(data) ? 'Valid' : 'Invalid'),
      intent: isValid(data) ? 'success' : 'danger',
      minimal: false,
    });

    return badges;
  };

  return (
    <div>
      <ReqoreInput
        placeholder={t('Start typing to filter drafts')}
        onChange={(e) => setQuery(e.target.value)}
        value={query}
        icon="SearchLine"
        rightIcon="KeyboardFill"
        focusRules={{
          type: 'keypress',
          shortcut: 'letters',
          clearOnFocus: true,
        }}
      />
      <ReqoreVerticalSpacer height={10} />
      <ReqoreControlGroup vertical fluid>
        {size(sortedDrafts) ? (
          sortedDrafts.map(({ date, interfaceId, fileName, ...rest }) => (
            <ReqoreControlGroup fluid fill stack key={interfaceId}>
              <ReqoreButton
                onClick={
                  interfaceId === lastDraft
                    ? undefined
                    : () => {
                        changeDraft({
                          interfaceId,
                          interfaceKind,
                        });
                      }
                }
                key={interfaceId}
                active={interfaceId === lastDraft}
                badge={buildBadges(rest)}
                description={`${t('Last modified')}: ${timeago(date)}`}
              >
                {rest.name}
              </ReqoreButton>

              <ReqoreButton
                fixed
                intent="danger"
                icon="DeleteBinLine"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(interfaceId);
                }}
              />
            </ReqoreControlGroup>
          ))
        ) : (
          <ReqoreMessage intent="warning">
            No drafts found for{' '}
            {query && query !== '' ? 'your search query' : 'this interface type'}
          </ReqoreMessage>
        )}
      </ReqoreControlGroup>
    </div>
  );
};
