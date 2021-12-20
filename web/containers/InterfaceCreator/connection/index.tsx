import { Button, ButtonGroup, Intent, Tooltip } from '@blueprintjs/core';
import { isEqual, some } from 'lodash';
import map from 'lodash/map';
import size from 'lodash/size';
import React, { useContext, useState } from 'react';
import { useDebounce, useMount, useUpdateEffect } from 'react-use';
import shortid from 'shortid';
import Field from '../../../components/Field';
import { getProtocol } from '../../../components/Field/urlField';
import FieldActions from '../../../components/FieldActions';
import FieldLabel from '../../../components/FieldLabel';
import Loader from '../../../components/Loader';
import { Messages } from '../../../constants/messages';
import { DraftsContext, IDraftData } from '../../../context/drafts';
import { GlobalContext } from '../../../context/global';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { deleteDraft, getDraftId, getTargetFile, hasValue } from '../../../helpers/functions';
import { validateField } from '../../../helpers/validations';
import { addMessageListener, postMessage } from '../../../hocomponents/withMessageHandler';
import { ActionsWrapper, FieldInputWrapper, FieldWrapper, IField } from '../panel';

export interface IConnection {
  target_dir: string;
  target_file?: string;
  name: string;
  desc: string;
  url: string;
  connection_options?: { [key: string]: any };
}

export const ConnectionView = ({ onSubmitSuccess }) => {
  const { connection, confirmAction, callBackend, saveDraft } = useContext(InitialContext);
  const { resetAllInterfaceData, setConnectionReset } = useContext(GlobalContext);
  const t = useContext(TextContext);
  const { maybeApplyDraft, draft } = useContext(DraftsContext);

  const [data, setData] = useState<IConnection>({
    connection_options: {},
    ...(connection || {}),
  });
  const [interfaceId, setInterfaceId] = useState(null);
  const [fields, setFields] = useState(undefined);

  const handleDataChange = (name: string, value: any) => {
    setData((cur) => {
      const result = { ...cur };

      // Remove the connection options if they are empty
      if (name === 'connection_options' && size(value) === 0) {
        delete result.connection_options;
      } else {
        result[name] = value;
      }

      return result;
    });
  };

  useMount(() => {
    setConnectionReset(() => () => setData(connection || {}));

    addMessageListener(Messages.FIELDS_FETCHED, ({ fields }) => {
      setFields(fields);
      setInterfaceId(connection?.iface_id || shortid.generate());
      applyDraft();
    });

    postMessage(Messages.GET_FIELDS, { iface_kind: 'connection', is_editing: !!connection });
  });

  const applyDraft = () => {
    // Apply the draft with "type" as first parameter and a custom function
    maybeApplyDraft(
      'connection',
      undefined,
      connection,
      ({ connectionData: { fields, data }, interfaceId: ifaceId }: IDraftData) => {
        setInterfaceId(ifaceId);
        setData(data);
        setFields(fields);
      }
    );
  };

  useUpdateEffect(() => {
    if (draft) {
      applyDraft();
    }
  }, [draft]);

  useDebounce(
    () => {
      const draftId = getDraftId(connection, interfaceId);
      const hasChanged = connection
        ? some(data, (value, key) => {
            return !isEqual(value, connection[key]);
          })
        : true;

      if (
        draftId &&
        (hasValue(data.target_dir) ||
          hasValue(data.desc) ||
          hasValue(data.name) ||
          hasValue(data.target_file) ||
          (hasValue(data.url) && data.url !== '://')) &&
        hasChanged
      ) {
        saveDraft(
          'connection',
          draftId,
          {
            connectionData: {
              fields,
              data,
            },
            interfaceId,
            associatedInterface: getTargetFile(connection),
            isValid: isDataValid(),
          },
          data.name
        );
      }
    },
    1500,
    [data, interfaceId]
  );

  const reset = () => {
    setData(connection || {});
  };

  const isDataValid = () => {
    return (
      validateField('string', data.target_dir) &&
      validateField('string', data.name) &&
      validateField('string', data.desc) &&
      validateField('url', data.url) &&
      (!data.connection_options ||
        size(data.connection_options) === 0 ||
        validateField('options', data.connection_options))
    );
  };

  const handleSubmitClick = async () => {
    let fixedMetadata = { ...data };

    if (size(fixedMetadata.connection_options) === 0) {
      delete fixedMetadata.connection_options;
    }

    const result = await callBackend(
      connection ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE,
      undefined,
      {
        iface_kind: 'connection',
        iface_id: interfaceId,
        orig_data: connection,
        no_data_return: !!onSubmitSuccess,
        data: fixedMetadata,
      },
      t('SavingConnection...')
    );

    if (result.ok) {
      if (onSubmitSuccess) {
        onSubmitSuccess(data);
      }
      const fileName = getDraftId(connection, interfaceId);

      deleteDraft('connection', fileName, false);

      reset();
      resetAllInterfaceData('connection');
    }
  };

  if (!size(fields)) {
    return <Loader text={t('LoadingFields')} />;
  }

  return (
    <>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {map(fields, (field: IField) => (
          <FieldWrapper name="selected-field">
            <FieldLabel
              label={t(`field-label-${field.name}`)}
              info={
                field.markdown
                  ? t('MarkdownSupported')
                  : field.mandatory === false
                  ? t('Optional')
                  : undefined
              }
              isValid={
                field.mandatory !== false || data[field.name]
                  ? validateField(field.type || 'string', data[field.name], field)
                  : true
              }
            />
            <FieldInputWrapper>
              <Field
                {...field}
                isValid={
                  field.mandatory !== false || data[field.name]
                    ? validateField(field.type || 'string', data[field.name], field)
                    : true
                }
                value={data[field.name]}
                onChange={handleDataChange}
              />
            </FieldInputWrapper>
            <FieldActions desc={t(`field-desc-${field.name}`)} />
          </FieldWrapper>
        ))}
        <FieldWrapper name="selected-field">
          <FieldLabel label={t('field-label-url')} isValid={validateField('url', data.url)} />
          <FieldInputWrapper>
            <Field
              type="url"
              value={data.url}
              url="options/remote?list"
              onChange={handleDataChange}
              name="url"
            />
          </FieldInputWrapper>
          <FieldActions desc={t(`field-desc-url`)} />
        </FieldWrapper>
        {getProtocol(data.url) && (
          <FieldWrapper name="selected-field">
            <FieldLabel
              label={t('field-label-options')}
              info={t('Optional')}
              isValid={
                data.connection_options && size(data.connection_options)
                  ? validateField('options', data.connection_options)
                  : true
              }
            />
            <FieldInputWrapper>
              <Field
                type="options"
                value={data.connection_options}
                url={`remote/${getProtocol(data.url)}`}
                onChange={handleDataChange}
                name="connection_options"
              />
            </FieldInputWrapper>
            <FieldActions desc={t(`field-desc-connection_options`)} />
          </FieldWrapper>
        )}
      </div>
      <ActionsWrapper>
        <ButtonGroup fill>
          <Tooltip content={t('ResetTooltip')}>
            <Button
              text={t('Reset')}
              icon={'history'}
              onClick={() => {
                confirmAction(
                  'ResetFieldsConfirm',
                  () => {
                    reset();
                  },
                  'Reset',
                  'warning'
                );
              }}
            />
          </Tooltip>
          <Button
            text={t('Submit')}
            onClick={handleSubmitClick}
            disabled={!isDataValid()}
            icon={'tick'}
            name="connection-submit"
            intent={Intent.SUCCESS}
          />
        </ButtonGroup>
      </ActionsWrapper>
    </>
  );
};
