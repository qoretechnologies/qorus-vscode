import { ReqoreMessage, ReqoreModal, ReqoreSpinner } from '@qoretechnologies/reqore';
import { memo, useMemo, useState } from 'react';
import { useAsyncRetry, useUpdateEffect } from 'react-use';
import { fetchData } from '../../helpers/functions';
import { validateField } from '../../helpers/validations';
import { useGetAppActionData } from '../../hooks/useGetAppActionData';
import { PositiveColorEffect, SaveColorEffect } from '../Field/multiPair';
import Options, {
  IOptions,
  IOptionsSchema,
  fixOptions,
  hasRequiredOptions,
} from '../Field/systemOptions';

export interface IConnectionManagementModalProps {
  appName?: string;
  actionName?: string;
  onSubmit?: (connection: any, authorize?: boolean) => void;
  onClose?: () => void;
  selectedConnection?: string;
}

export const ConnectionManagementModal = memo(
  ({ appName, onClose, onSubmit, selectedConnection }: IConnectionManagementModalProps) => {
    const [options, setOptions] = useState<IOptions>(undefined);
    const [isCreating, setIsCreating] = useState(false);
    const [creationError, setCreationError] = useState(undefined);
    const app = useGetAppActionData(appName);

    const { loading, value, error } = useAsyncRetry<IOptionsSchema>(async () => {
      const result = await fetchData(
        `/dataprovider/apps/${appName}/getCreateConnectionOptions?context=ui`,
        'PUT',
        {
          options: {
            name: {
              type: 'string',
              value: selectedConnection,
            },
          },
        }
      );

      const { data, ok } = result;

      if (ok) {
        setOptions(fixOptions({}, data.options));

        return data.options;
      } else {
        return undefined;
      }
    });

    const handleCreateOrUpdateConnection = async (authorize?: boolean): Promise<any> => {
      setIsCreating(true);

      const additionalOptions = selectedConnection
        ? { name: { type: 'string', value: selectedConnection } }
        : {};

      const data = await fetchData(
        `/dataprovider/apps/${appName}/${
          selectedConnection ? 'updateConnection' : 'createConnection'
        }?context=ui`,
        selectedConnection ? 'PUT' : 'POST',
        {
          options: {
            ...options,
            ...additionalOptions,
          },
        }
      );

      setIsCreating(false);

      if (data.ok) {
        onSubmit?.(selectedConnection || data.data?.name, authorize);
      } else {
        setCreationError(data.data?.desc || data.data);
      }
    };

    const canBeCreatedAutomatically = useMemo(
      () => value && !hasRequiredOptions(value) && !selectedConnection,
      [JSON.stringify(value), selectedConnection]
    );

    useUpdateEffect(() => {
      if (canBeCreatedAutomatically) {
        // This connection does not require options, so we can create it right away
        handleCreateOrUpdateConnection(true);
      }
    }, [canBeCreatedAutomatically]);

    const isLoading = useMemo(() => loading || isCreating, [loading, isCreating]);
    const hasError = useMemo(() => error || creationError, [error, creationError]);

    return (
      <ReqoreModal
        isOpen
        flat
        blur={3}
        onClose={onClose}
        minimal
        label={selectedConnection ? 'Edit connection' : `New ${app.display_name} connection`}
        iconImage={app.logo}
        iconProps={{ rounded: true, size: '35px' }}
        actions={[
          {
            label: 'Save',
            icon: 'CheckLine',
            effect: SaveColorEffect,
            onClick: handleCreateOrUpdateConnection,
            disabled: isLoading || !validateField('options', options, { optionSchema: value }),
            show: !canBeCreatedAutomatically,
          },
          {
            label: 'Save and re-authorize',
            icon: 'CheckDoubleLine',
            effect: PositiveColorEffect,
            onClick: () => handleCreateOrUpdateConnection(true),
            disabled: isLoading || !validateField('options', options, { optionSchema: value }),
            show: !!selectedConnection,
          },
        ]}
      >
        {hasError && (
          <ReqoreMessage opaque={false} intent="danger" margin="bottom">
            {hasError}
          </ReqoreMessage>
        )}
        {isLoading || canBeCreatedAutomatically ? (
          <ReqoreSpinner centered iconColor="info" type={5}>
            Loading...
          </ReqoreSpinner>
        ) : (
          <>
            {!selectedConnection && (
              <ReqoreMessage intent="info" opaque={false}>
                {app.display_name} connection requires some options to be set before it can be
                created and authorized
              </ReqoreMessage>
            )}
            <Options
              flat
              sortable={false}
              label={undefined}
              badge={undefined}
              allowTemplates={false}
              options={value}
              value={options}
              name="options"
              onChange={(_n, value) => setOptions(value)}
            />
          </>
        )}
      </ReqoreModal>
    );
  }
);
