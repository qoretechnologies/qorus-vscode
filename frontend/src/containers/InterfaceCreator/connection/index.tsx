import { capitalize, isEqual, some } from 'lodash';
import map from 'lodash/map';
import size from 'lodash/size';
import React, { useContext, useState } from 'react';
import { useDebounce, useMount, useUpdateEffect } from 'react-use';
import shortid from 'shortid';
import Content from '../../../components/Content';
import Field from '../../../components/Field';
import { SaveColorEffect } from '../../../components/Field/multiPair';
import { getProtocol } from '../../../components/Field/urlField';
import FieldGroup from '../../../components/FieldGroup';
import { ContentWrapper, FieldWrapper, IField } from '../../../components/FieldWrapper';
import Loader from '../../../components/Loader';
import { Messages } from '../../../constants/messages';
import { DraftsContext, IDraftData } from '../../../context/drafts';
import { GlobalContext } from '../../../context/global';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { mapFieldsToGroups } from '../../../helpers/common';
import { deleteDraft, getDraftId, getTargetFile, hasValue } from '../../../helpers/functions';
import { validateField } from '../../../helpers/validations';
import { addMessageListener, postMessage } from '../../../hocomponents/withMessageHandler';

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
    if (!!setConnectionReset) {
      setConnectionReset(() => () => setData(connection || {}));
    }
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

  const renderFields = (fields: IField[]) => {
    return map(fields, (field: IField) => (
      <FieldWrapper
        name="selected-field"
        label={t(`field-label-${field.name}`)}
        desc={t(`field-desc-${field.name}`)}
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
        compact={field.compact}
      >
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
      </FieldWrapper>
    ));
  };

  const renderGroups = (groups: Record<string, IField[]>) => {
    return map(groups, (fields, groupName) => {
      if (size(fields) > 1) {
        return (
          <FieldGroup
            key={groupName}
            label={capitalize(groupName)}
            isValid={!fields.some((field) => field.isValid === false)}
          >
            {renderFields(fields)}
          </FieldGroup>
        );
      }

      return <React.Fragment key={groupName}>{renderFields(fields)}</React.Fragment>;
    });
  };

  return (
    <>
      <Content
        title={'Fill in the details'}
        bottomActions={[
          {
            label: t('DiscardChangesButton'),
            icon: 'HistoryLine',
            tooltip: t('ResetTooltip'),
            onClick: () => {
              confirmAction(
                'ResetFieldsConfirm',
                () => {
                  reset();
                },
                'Reset',
                'warning'
              );
            },
            position: 'left',
          },
          {
            label: t('Submit'),
            disabled: !isDataValid(),
            icon: 'CheckLine',
            responsive: false,
            flat: false,
            effect: SaveColorEffect,
            onClick: handleSubmitClick,
            position: 'right',
          },
        ]}
      >
        <ContentWrapper>
          {renderGroups(mapFieldsToGroups(fields))}
          <FieldWrapper
            name="selected-field"
            desc={t(`field-desc-url`)}
            label={t('field-label-url')}
            isValid={validateField('url', data.url)}
            collapsible={false}
          >
            <Field
              type="url"
              value={data.url}
              url="options/remote?list"
              onChange={handleDataChange}
              name="url"
            />
          </FieldWrapper>
          <FieldGroup
            label="Connection options"
            isValid={
              validateField('url', data.url) &&
              (data.connection_options && size(data.connection_options)
                ? validateField('options', data.connection_options)
                : true)
            }
          >
            {getProtocol(data.url) && (
              <FieldWrapper
                name="selected-field"
                desc={t(`field-desc-connection_options`)}
                label={t('field-label-options')}
                info={t('Optional')}
                isValid={
                  data.connection_options && size(data.connection_options)
                    ? validateField('options', data.connection_options)
                    : true
                }
                collapsible={false}
              >
                <Field
                  type="options"
                  value={data.connection_options}
                  url={`remote/${getProtocol(data.url)}`}
                  onChange={handleDataChange}
                  name="connection_options"
                />
              </FieldWrapper>
            )}
          </FieldGroup>
        </ContentWrapper>
      </Content>
    </>
  );
};
