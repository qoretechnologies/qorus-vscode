import { Button, Callout, Classes, InputGroup, Tag } from '@blueprintjs/core';
import { size, sortBy } from 'lodash';
import React, { useContext, useState } from 'react';
import { useMount } from 'react-use';
import { interfaceKindTransform } from '../../constants/interfaces';
import { Messages } from '../../constants/messages';
import { IDraftData } from '../../context/drafts';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import { callBackendBasic, deleteDraft } from '../../helpers/functions';
import { StyledDialogSelectItem } from '../Field/select';
import HorizontalSpacer from '../HorizontalSpacer';
import Spacer from '../Spacer';
import { TimeAgo } from '../TimeAgo';

export const DraftsTable = ({ interfaceKind, onClick, lastDraft, refreshCategories }: any) => {
  const t = useContext(TextContext);
  const { changeDraft } = useContext(InitialContext);
  // Get the last draft from the initial data context
  const [drafts, setDrafts] = useState<any[]>([]);
  const [query, setQuery] = useState('');

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
    await deleteDraft(interfaceKindTransform[interfaceKind], interfaceId);

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

  return (
    <div>
      {size(drafts) > 0 && (
        <>
          <InputGroup
            leftIcon="search"
            placeholder={t('Filter')}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Spacer size={10} />
        </>
      )}
      {size(sortedDrafts) ? (
        <>
          {sortedDrafts.map(({ date, interfaceId, fileName, ...rest }) => (
            <StyledDialogSelectItem
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
              className={interfaceId === lastDraft ? 'selected' : ''}
            >
              <h5>
                {rest.name}{' '}
                <Button
                  style={{ float: 'right' }}
                  intent="danger"
                  icon="trash"
                  small
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(fileName);
                  }}
                />{' '}
              </h5>
              <p className={Classes.TEXT_MUTED}>
                [<TimeAgo time={date} />] <HorizontalSpacer size={20} />
                {rest.selectedFields && (
                  <>
                    {t('FieldsSelected')}:
                    <HorizontalSpacer size={10} />
                    <Tag round>{size(rest.selectedFields)}</Tag>
                  </>
                )}
                {size(rest.selectedMethods) ? (
                  <>
                    <HorizontalSpacer size={20} />
                    {t('Methods')}:<HorizontalSpacer size={10} />
                    <Tag round>{size(rest.selectedMethods)}</Tag>
                  </>
                ) : null}
                {size(rest.steps) ? (
                  <>
                    <HorizontalSpacer size={20} />
                    {t('Steps')}:<HorizontalSpacer size={10} />
                    <Tag round>{size(rest.steps.steps)}</Tag>
                  </>
                ) : null}
                <HorizontalSpacer size={20} />
                {t('Status')}:<HorizontalSpacer size={10} />
                <Tag round intent={isValid(rest) ? 'success' : 'danger'}>
                  {t(isValid(rest) ? 'Valid' : 'Invalid')}
                </Tag>
              </p>
            </StyledDialogSelectItem>
          ))}
        </>
      ) : (
        <Callout intent="warning">
          {' '}
          No drafts found for {query && query !== ''
            ? 'your search query'
            : 'this interface type'}{' '}
        </Callout>
      )}
    </div>
  );
};
